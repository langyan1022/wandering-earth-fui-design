#!/usr/bin/env python3
"""Static checks for a wandering-earth-fui-design build (references/qa.md §3, level L1).

  python3 scripts/fui_lint.py src/                     # a folder
  python3 scripts/fui_lint.py index.html app.css       # or files
  python3 scripts/fui_lint.py src/ --json              # machine-readable

Checks the source for what the skill rules out: shadows and blur, radius off
the three radius tokens, colour literals outside tokens, hues the palette does
not have (violet, purple, magenta, pink), foreign or novelty fonts,
`transition: all`, easing and durations off the tokens, loops off the
allowlist, SMIL, removed focus outlines, decorative gradients, text under
11px, banned Tailwind utilities, filler text, and (in HTML) the root,
language, viewport, panel-nesting structure, and a count of framed panels.

Severity follows the release gate: BLOCKER and MAJOR fail the run (exit 1);
MINOR and REVIEW are listed. REVIEW means the tool cannot decide — read the line.

Explaining a deviation: put  fui-lint-ignore: <RULE> <reason>  in a comment on
the same line. The finding is then reported as "explained", not as a failure —
the release gate is 0 blockers and 0 *unexplained* majors.

A linter cannot see a rendered page: run scripts/fui_verify.mjs as well.
No dependencies beyond the Python standard library.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys
from html.parser import HTMLParser

EXTENSIONS = {".html", ".htm", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage", "vendor", "logos", "encom-globe"}
# The skill's own canvas helpers carry documented token fallbacks and data-driven frame loops.
SKIP_FILES = {"fui-geo.js", "fui-audio.js", "fui-globe-encom.js"}

TOKEN_FONTS = {
    "rajdhani", "barlow semi condensed", "bahnschrift", "din alternate", "saira semi condensed",
    "jetbrains mono", "b612 mono", "ibm plex mono", "ui-monospace", "cascadia mono", "consolas",
    "source han mono sc", "noto sans mono cjk sc",
    "source han sans sc", "noto sans sc", "思源黑体", "pingfang sc", "microsoft yahei",
    "sans-serif", "monospace", "inherit",
}
NOVELTY_FONTS = re.compile(r"\b(orbitron|audiowide|michroma|share tech|exo 2|syncopate|aldrich|quantico)\b", re.I)
LOOP_ALLOWLIST = ("fui-beat", "fui-flow", "fui-march")
PANEL_BUDGET = 5      # framed panels in one document before S4 asks whether each frame is needed
LEVELS = ["BLOCKER", "MAJOR", "MINOR", "REVIEW"]

COMMENT_CSS_JS = re.compile(r"/\*.*?\*/", re.S)
COMMENT_HTML = re.compile(r"<!--.*?-->", re.S)
IGNORE = re.compile(r"fui-lint-ignore:\s*([A-Z]\d+)[ \t]*(.*?)[ \t]*(?:\*/|-->|$)", re.M)
TIME = re.compile(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b")
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
COLOR_FN = re.compile(r"\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(")
GRADIENT = re.compile(r"\b(?:repeating-)?(?:linear|radial|conic)-gradient\(")
TAILWIND = re.compile(
    r"(?<![\w-])(?:shadow(?:-(?:sm|md|lg|xl|2xl|inner))?|blur(?:-\w+)?|backdrop-blur(?:-\w+)?|"
    r"rounded(?:-[trblse]{1,2})?-(?:md|lg|xl|2xl|3xl|full)|animate-(?:spin|ping|pulse|bounce))(?![\w-])")


RGB_FN = re.compile(r"\brgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)")
HSL_FN = re.compile(r"\bhsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%")


def hsl(r: float, g: float, b: float) -> tuple[float, float, float]:
    """Hue in degrees, saturation and lightness in 0..1, from 0..255 channels."""
    r, g, b = r / 255, g / 255, b / 255
    hi, lo = max(r, g, b), min(r, g, b)
    light = (hi + lo) / 2
    if hi == lo:
        return 0.0, 0.0, light
    span = hi - lo
    sat = span / (2 - hi - lo) if light > 0.5 else span / (hi + lo)
    if hi == r:
        hue = ((g - b) / span) % 6
    elif hi == g:
        hue = (b - r) / span + 2
    else:
        hue = (r - g) / span + 4
    return hue * 60, sat, light


def off_palette(text: str, hex_anywhere: bool) -> str | None:
    """Return the first colour in `text` whose hue the palette does not have: violet through pink.

    The palette is white, orange, green, cyan, and red on black and teal. A saturated colour
    between 250° and 345° is none of them, whatever it is called and wherever it is declared.
    In CSS a 3-digit hex may be an id selector, so only values after a colon are read there.
    """
    found = []
    scope = text if hex_anywhere else (text.split(":", 1)[1] if ":" in text else "")
    for match in re.finditer(r"#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", scope):
        digits = match.group(1)
        if len(digits) == 3:
            if hex_anywhere:
                continue                      # in script text "#bad" is far more likely a selector
            digits = "".join(c * 2 for c in digits)
        found.append((match.group(0), hsl(*(int(digits[i:i + 2], 16) for i in (0, 2, 4)))))
    for match in RGB_FN.finditer(text):
        found.append((match.group(0) + "…)", hsl(*(float(v) for v in match.groups()))))
    for match in HSL_FN.finditer(text):
        hue, sat, light = (float(v) for v in match.groups())
        found.append((match.group(0) + "…)", (hue % 360, sat / 100, light / 100)))
    for literal, (hue, sat, light) in found:
        if 250 <= hue <= 345 and sat >= 0.25 and 0.15 <= light <= 0.92:
            return literal
    return None


def blank(match: re.Match) -> str:
    """Replace a comment with spaces, keeping newlines so line numbers hold."""
    return re.sub(r"[^\n]", " ", match.group(0))


def split_top_level(value: str) -> list[str]:
    """Split a declaration value on commas that are not inside parentheses."""
    parts, depth, current = [], 0, []
    for ch in value:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        if ch == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(ch)
    parts.append("".join(current))
    return parts


def soft_blend(call: str) -> bool:
    """True when a gradient blends two or more different colours with no stop positions.

    Functional patterns (grid lines, segments, hatch, hazard ends, rulers, progress
    tracks) always give positions; a decorative fade does not.
    """
    inner = call[call.index("(") + 1:].rstrip()
    inner = inner[:-1] if inner.endswith(")") else inner
    bare = set()
    for arg in split_top_level(inner):
        arg = arg.strip()
        depth, tokens, current = 0, [], ""
        for ch in arg:
            depth += ch == "("
            depth -= ch == ")"
            if ch.isspace() and depth == 0:
                if current:
                    tokens.append(current)
                current = ""
            else:
                current += ch
        if current:
            tokens.append(current)
        if len(tokens) == 1 and not re.match(r"^-?[\d.]+(deg|turn|rad|grad)$", tokens[0]) \
                and tokens[0] not in {"circle", "ellipse", "closest-side", "farthest-corner"}:
            bare.add(tokens[0])
    return len(bare) >= 2


class Finding(dict):
    pass


class Linter:
    def __init__(self) -> None:
        self.findings: list[Finding] = []

    def add(self, level, rule, path, line, text, hint, ignores):
        entry = Finding(level=level, rule=rule, file=str(path), line=line, text=text.strip()[:140], hint=hint)
        if rule in ignores.get(line, {}):
            entry["explained"] = ignores[line][rule] or "no reason given"
        self.findings.append(entry)

    # ── CSS rules, applied to a stylesheet, a <style> block, or a style="" attribute ──
    def css(self, path, text, offset, ignores, selector_hint=""):
        lines = text.split("\n")
        selector = selector_hint
        for i, raw in enumerate(lines):
            line_no = offset + i
            line = raw
            if "{" in line:
                selector = line.split("{")[0].strip() or selector
            low = line.lower()
            token_decl = bool(re.match(r"\s*--fui-[\w-]+\s*:", line))
            add = lambda level, rule, hint: self.add(level, rule, path, line_no, raw, hint, ignores)  # noqa: E731

            if re.search(r"\b(box-shadow|text-shadow)\s*:(?!\s*none\b)", low) or "drop-shadow(" in low \
                    or re.search(r"\bblur\(", low) or re.search(r"backdrop-filter\s*:(?!\s*none\b)", low):
                add("MAJOR", "R01", "no shadow, glow, or blur: depth is a surface-token step")

            m = re.search(r"border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)", low)
            if m and not token_decl:
                values = re.sub(r"var\(--fui-radius(?:-control|-key)?\)", "0", m.group(1))
                if any(float(n) > 2 for n in re.findall(r"(\d*\.?\d+)px", values)) or re.search(r"\d(?:%|r?em)", values) \
                        or "var(" in values:
                    add("MAJOR", "R02", "radius is var(--fui-radius) (0), var(--fui-radius-control) (2px), or on a key var(--fui-radius-key) (6px)")

            stray = off_palette(line, hex_anywhere=False)
            if stray:
                add("BLOCKER", "R16", f"{stray} is a hue the palette does not have (violet / purple / magenta / pink): "
                                      "one palette, no alternative colour schemes")

            if not token_decl:
                bare = re.sub(r"#(?:000|fff|000000|ffffff)\b", "", line, flags=re.I)
                if HEX.search(bare) or COLOR_FN.search(bare):
                    add("MAJOR", "R03", "colour literal outside the token block: use a --fui-* token")

            m = re.search(r"\bfont(?:-family)?\s*:\s*([^;}]+)", line)
            if m and not token_decl:
                foreign = [n for n in re.findall(r"[\"']([^\"']+)[\"']", m.group(1)) if n.lower() not in TOKEN_FONTS]
                if foreign:
                    add("MAJOR", "R04", f"font outside the three token stacks: {', '.join(foreign)}")
            if NOVELTY_FONTS.search(line):
                add("MAJOR", "R04", "novelty sci-fi display face: the system uses Rajdhani, JetBrains Mono, Source Han Sans")

            if re.search(r"transition(?:-property)?\s*:\s*all\b", low):
                add("MAJOR", "R06", "name the properties: transform, opacity, clip-path, or colours")

            for motion in ([] if token_decl else re.finditer(r"\b(transition|animation)(?:-[a-z-]+)?\s*:\s*([^;}]+)", low)):
                kind, value = motion.group(1), motion.group(2)
                plain = re.sub(r"var\(--fui-dur-[\w-]+\)", " 0ms ", value)     # a token duration counts as in range
                plain = re.sub(r"var\(--fui-[\w-]+\)", " ", plain)
                if "cubic-bezier(" in plain or re.search(r"(?<![\w-])ease(?:-in|-out|-in-out)?(?![\w-])", plain):
                    add("MAJOR", "R07", "easing comes from --fui-ease / --fui-ease-exit, steps(), or linear")
                if "infinite" in plain and not any(name in plain for name in LOOP_ALLOWLIST):
                    add("BLOCKER", "R05", "loop off the allowlist (heartbeat, pending progress, pending link)")
                for segment in split_top_level(plain):
                    times = [float(n) * (1000 if unit == "s" else 1) for n, unit in TIME.findall(segment)]
                    if not times or "infinite" in segment:
                        continue
                    finite_blink = kind == "animation" and "steps(" in segment and re.search(r"\)\s*(?:\S+\s+)*[1-3]\s*$", segment.strip())
                    if times[0] > 240 and not finite_blink:
                        add("MAJOR", "R08", f"{times[0]:g}ms is over the 240ms ceiling (durations come from --fui-dur-*)")

            if re.search(r"outline\s*:\s*(none|0)\b", low) or re.search(r"outline-(style|width)\s*:\s*(none|0)\b", low):
                add("BLOCKER", "R09", "the focus ring is never removed")

            gradient = None if token_decl else GRADIENT.search(low)
            if gradient:
                tail = "\n".join([low[gradient.start():]] + [x.lower() for x in lines[i + 1:i + 10]])
                depth, stop = 0, len(tail)               # cut at the parenthesis that closes this gradient(...) call
                for k, ch in enumerate(tail):
                    if ch == "(":
                        depth += 1
                    elif ch == ")":
                        depth -= 1
                        if depth == 0:
                            stop = k + 1
                            break
                call = tail[:stop]
                functional = "mask" in low or not soft_blend(call)
                if not functional:
                    add("REVIEW", "R11", "gradient: allowed only as a functional pattern (grid, segments, hatch, hazard, ruler)")

            m = re.search(r"font(?:-size)?\s*:[^;}]*?(?<![\w.-])(\d*\.?\d+)(px|rem)\b", low)
            if m and not token_decl:
                px = float(m.group(1)) * (16 if m.group(2) == "rem" else 1)
                if px < 10 or (px < 11 and "fui-bi__secondary" not in selector):
                    add("MINOR", "R14", f"{px:g}px text: the floor is 11px (12px Chinese); 10px only for the bilingual caption")

    # ── Rules for script and markup text ──
    def text_rules(self, path, text, offset, ignores, is_markup):
        for i, raw in enumerate(text.split("\n")):
            line_no = offset + i
            add = lambda level, rule, hint: self.add(level, rule, path, line_no, raw, hint, ignores)  # noqa: E731
            if re.search(r"<(animate|animateTransform|animateMotion|set)\b", raw):
                add("MAJOR", "R10", "no SMIL: animate SVG with CSS transitions on stroke dashes or transforms")
            if re.search(r"\blorem ipsum\b", raw, re.I):
                add("BLOCKER", "R12", "filler text: every string is real for the product")
            if re.search(r"""(?:>|["'`])[^<"'`]*\b0x[0-9A-F]{4,}\b""", raw):
                add("BLOCKER", "R12", "hex filler on screen: labels and codes come from the product's data")
            for m in re.finditer(r"""\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})""", raw):
                classes = next(g for g in m.groups() if g is not None)
                hit = TAILWIND.search(classes)
                if hit:
                    add("MAJOR", "R13", f"Tailwind utility `{hit.group(0)}` is ruled out inside a FUI surface")
            if not is_markup and re.search(r"\b(setInterval|requestAnimationFrame)\s*\(", raw):
                add("REVIEW", "R15", "timer or frame loop: it must be driven by data or input, and stop when paused")
            if not is_markup:
                stray = off_palette(raw, hex_anywhere=True)
                if stray:
                    add("BLOCKER", "R16", f"{stray} is a hue the palette does not have (violet / purple / magenta / pink): "
                                          "one palette, no alternative colour schemes")
            if NOVELTY_FONTS.search(raw) and "family=" in raw:
                add("MAJOR", "R04", "novelty sci-fi display face loaded")

    def html_structure(self, path, text, ignores):
        linter = self

        class Walker(HTMLParser):
            def __init__(self):
                super().__init__(convert_charrefs=True)
                self.stack, self.fields, self.root, self.lang = [], 0, False, False
                self.panels, self.overlay_depth = 0, []
                self.void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                classes = (attrs.get("class") or "").split()
                line = self.getpos()[0]
                if tag == "html" and attrs.get("lang"):
                    self.lang = True
                if "fui" in classes:
                    self.root = True
                if "fui-field" in classes:
                    self.fields += 1
                    if self.fields == 2:
                        linter.add("MAJOR", "S2", path, line, f"<{tag} class=\"{' '.join(classes)}\">",
                                   "a second blueprint field: one viewport per view", ignores)
                is_panel = "fui-panel" in classes
                opens_overlay = tag == "dialog" or any(c in classes for c in ("fui-dialog", "fui-drawer", "fui-popover"))
                if is_panel and not self.overlay_depth:
                    self.panels += 1                   # things that open over the console are meant to be boxes
                if opens_overlay and tag not in self.void:
                    self.overlay_depth.append(len(self.stack))
                if is_panel and any(self.stack_panels()):
                    linter.add("MAJOR", "S3", path, line, f"<{tag} class=\"{' '.join(classes)}\">",
                               "panel nested in a panel: subdivide with a divider or a sub-header", ignores)
                if tag not in self.void:
                    self.stack.append((tag, is_panel))

            def stack_panels(self):
                return [p for _, p in self.stack]

            def handle_endtag(self, tag):
                for i in range(len(self.stack) - 1, -1, -1):
                    if self.stack[i][0] == tag:
                        del self.stack[i:]
                        break
                while self.overlay_depth and self.overlay_depth[-1] >= len(self.stack):
                    self.overlay_depth.pop()

        walker = Walker()
        walker.feed(text)
        if walker.panels > PANEL_BUDGET:
            self.add("REVIEW", "S4", path, 1, f"{walker.panels} framed panels",
                     "on minimalist .fui-station views, keep frames only where content scrolls or opens (station.md §3); "
                     "on structured .fui-console Tactical Command Consoles, 5-8 hairline panels with 3px semantic ticks are intentional", ignores)
        if "<html" in text.lower():
            if not walker.lang:
                self.add("MAJOR", "S1", path, 1, "<html>", "<html> needs lang (the type rules hang off it)", ignores)
            if not walker.root:
                self.add("MAJOR", "S1", path, 1, "<body>", "the app root needs class=\"fui\"", ignores)

    def file(self, path: pathlib.Path):
        try:
            source = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            return
        ignores: dict[int, dict[str, str]] = {}
        for i, line in enumerate(source.split("\n"), 1):
            for rule, reason in IGNORE.findall(line):
                ignores.setdefault(i, {})[rule] = reason.strip()

        suffix = path.suffix.lower()
        if suffix == ".css":
            self.css(path, COMMENT_CSS_JS.sub(blank, source), 1, ignores)
            return

        markup = suffix in {".html", ".htm", ".vue", ".svelte"}
        clean = COMMENT_HTML.sub(blank, source) if markup else source
        clean = COMMENT_CSS_JS.sub(blank, clean)
        if markup:
            for m in re.finditer(r"<style\b[^>]*>(.*?)</style>", clean, re.S | re.I):
                self.css(path, m.group(1), clean.count("\n", 0, m.start(1)) + 1, ignores)
            for m in re.finditer(r"""\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')""", clean):
                self.css(path, m.group(1) or m.group(2) or "", clean.count("\n", 0, m.start()) + 1, ignores)
            outside_scripts = re.sub(r"<script\b[^>]*>.*?</script>", blank, clean, flags=re.S | re.I)
            self.text_rules(path, outside_scripts, 1, ignores, is_markup=True)
            for m in re.finditer(r"<script\b[^>]*>(.*?)</script>", clean, re.S | re.I):
                self.text_rules(path, m.group(1), clean.count("\n", 0, m.start(1)) + 1, ignores, is_markup=False)
            if suffix in {".html", ".htm"}:
                self.html_structure(path, clean, ignores)
        else:
            self.text_rules(path, clean, 1, ignores, is_markup=False)
            for m in re.finditer(r"""\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')""", clean):
                self.css(path, m.group(1) or m.group(2) or "", clean.count("\n", 0, m.start()) + 1, ignores)


def collect(targets: list[pathlib.Path]) -> list[pathlib.Path]:
    files = []
    for target in targets:
        if target.is_file():
            files.append(target)
        elif target.is_dir():
            for path in sorted(target.rglob("*")):
                if path.is_file() and path.suffix.lower() in EXTENSIONS and path.name not in SKIP_FILES \
                        and not (set(path.relative_to(target).parts[:-1]) & SKIP_DIRS) and not path.name.endswith(".min.js"):
                    files.append(path)
        else:
            sys.exit(f"fui_lint: cannot find {target}")
    return files


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("targets", nargs="+", type=pathlib.Path, help="files or folders to check")
    ap.add_argument("--json", action="store_true", help="print findings as JSON")
    args = ap.parse_args()

    linter = Linter()
    files = collect(args.targets)
    for path in files:
        linter.file(path)

    open_findings = [f for f in linter.findings if "explained" not in f]
    explained = [f for f in linter.findings if "explained" in f]
    counts = {level: sum(1 for f in open_findings if f["level"] == level) for level in LEVELS}
    failed = counts["BLOCKER"] or counts["MAJOR"]

    if args.json:
        print(json.dumps({"files": len(files), "counts": counts, "explained": len(explained), "findings": linter.findings},
                         ensure_ascii=False, indent=2))
    else:
        for level in LEVELS:
            for f in (x for x in open_findings if x["level"] == level):
                print(f"{level:<7} {f['rule']}  {f['file']}:{f['line']}\n        {f['text']}\n        → {f['hint']}")
        for f in explained:
            print(f"EXPLAINED {f['rule']}  {f['file']}:{f['line']} — {f['explained']}")
        print(f"\n{len(files)} file(s) · " + " · ".join(f"{counts[l]} {l.lower()}" for l in LEVELS)
              + f" · {len(explained)} explained")
        print("FAIL: fix, or explain each major with fui-lint-ignore" if failed
              else "PASS (static level only: render and probe with scripts/fui_verify.mjs)")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
