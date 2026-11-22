#!/usr/bin/env python3
"""Make one self-contained HTML file from a page that links local CSS and imports local ES modules.

A page opened from disk (file://) cannot import ES modules, and a single file
is the usual deliverable when there is no project. Instead of pasting
fui.css, fui-sim.js, fui-geo.js or fui-audio.js into the page by hand, link
and import them normally, then run:

  python3 scripts/bundle_html.py page.html -o dist/page.html

What it inlines
  <link rel="stylesheet" href="local.css">        -> <style>…</style>
  <script type="module" src="local.js"></script>  -> <script type="module">…</script>
  import { a, b as c } from './local.js';         -> the module's code, scoped, with its exports handed back
  import * as ns from './local.js';

What it leaves alone
  Remote URLs (https://…, //…), e.g. font links. Bare imports such as 'three'
  cannot be inlined; the script stops and says so.

No dependencies beyond the Python standard library.
"""
from __future__ import annotations

import argparse
import pathlib
import re
import sys

REMOTE = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//)", re.I)
LINK = re.compile(r"<link\b[^>]*>", re.I)
ATTR = lambda name: re.compile(rf"""\b{name}\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.I)  # noqa: E731
SCRIPT = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.I | re.S)
IMPORT = re.compile(
    r"""^[ \t]*import\s+(?:(?P<ns>\*\s+as\s+[\w$]+)|(?P<named>\{[^}]*\})|(?P<default>[\w$]+))\s+from\s+(?P<q>['"])(?P<path>[^'"]+)(?P=q)\s*;?[ \t]*$""",
    re.M,
)
SIDE_EFFECT_IMPORT = re.compile(r"""^[ \t]*import\s+(['"])([^'"]+)\1\s*;?[ \t]*$""", re.M)
EXPORT_DECL = re.compile(r"^([ \t]*)export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)", re.M)
EXPORT_NAME = re.compile(r"^[ \t]*export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([\w$]+)", re.M)
UNSUPPORTED_EXPORT = re.compile(r"^[ \t]*export\s+(?:default\b|\{|\*)", re.M)


def attr(tag: str, name: str) -> str | None:
    m = ATTR(name).search(tag)
    return (m.group(1) if m.group(1) is not None else m.group(2)) if m else None


class Bundler:
    def __init__(self, page: pathlib.Path):
        self.page = page
        self.inlined: list[str] = []

    def fail(self, message: str) -> None:
        sys.exit(f"bundle_html: {message}")

    def read(self, path: pathlib.Path) -> str:
        if not path.is_file():
            self.fail(f"cannot find {path}")
        self.inlined.append(str(path))
        return path.read_text(encoding="utf-8")

    # ── CSS ──────────────────────────────────────────────────────────────
    def inline_links(self, html: str) -> str:
        def swap(match: re.Match) -> str:
            tag = match.group(0)
            rel, href = attr(tag, "rel") or "", attr(tag, "href")
            if "stylesheet" not in rel.lower() or not href or REMOTE.match(href):
                return tag
            css = self.read((self.page.parent / href).resolve())
            return f"<style>\n/* inlined from {href} */\n{css.rstrip()}\n</style>"
        return LINK.sub(swap, html)

    # ── JS modules ───────────────────────────────────────────────────────
    def module_body(self, path: pathlib.Path, stack: tuple[pathlib.Path, ...]) -> tuple[str, list[str]]:
        """Return (code with exports stripped and imports resolved, exported names)."""
        if path in stack:
            self.fail(f"circular import at {path}")
        code = self.read(path)
        if UNSUPPORTED_EXPORT.search(code):
            self.fail(f"{path.name}: only `export function/const/let/var/class` declarations can be inlined "
                      "(no `export default`, `export {…}`, or `export *`)")
        names = EXPORT_NAME.findall(code)
        code = EXPORT_DECL.sub(r"\1", code)
        code = self.resolve_imports(code, path.parent, stack + (path,))
        return code, names

    def resolve_imports(self, code: str, base: pathlib.Path, stack: tuple[pathlib.Path, ...] = ()) -> str:
        counter = [0]

        def wrap(path_text: str) -> tuple[str, str]:
            if REMOTE.match(path_text):
                self.fail(f"remote import '{path_text}' cannot be inlined; load it with its own <script> tag")
            if not path_text.startswith("."):
                self.fail(f"bare import '{path_text}' cannot be inlined: this page needs a bundler or an import map")
            body, names = self.module_body((base / path_text).resolve(), stack)
            counter[0] += 1
            var = f"__fui_module_{len(stack)}_{counter[0]}"
            iife = (f"const {var} = await (async () => {{\n/* inlined from {path_text} */\n{body.rstrip()}\n"
                    f"return {{ {', '.join(names)} }};\n}})();")
            return var, iife

        def swap(match: re.Match) -> str:
            if match.group("default"):
                self.fail(f"default import from '{match.group('path')}' cannot be inlined; use named imports")
            var, iife = wrap(match.group("path"))
            if match.group("ns"):
                local = match.group("ns").split()[-1]
                return f"{iife}\nconst {local} = {var};"
            pairs = []
            for item in match.group("named").strip("{} \n\t").split(","):
                item = item.strip()
                if not item:
                    continue
                parts = re.split(r"\s+as\s+", item)
                pairs.append(parts[0] if len(parts) == 1 else f"{parts[0]}: {parts[1]}")
            return f"{iife}\nconst {{ {', '.join(pairs)} }} = {var};"

        code = IMPORT.sub(swap, code)

        def swap_side_effect(match: re.Match) -> str:
            _, iife = wrap(match.group(2))
            return iife
        return SIDE_EFFECT_IMPORT.sub(swap_side_effect, code)

    def inline_scripts(self, html: str) -> str:
        def swap(match: re.Match) -> str:
            attrs, body = match.group(1), match.group(2)
            is_module = (attr(attrs, "type") or "").lower() == "module"
            src = attr(attrs, "src")
            if src and not REMOTE.match(src):
                path = (self.page.parent / src).resolve()
                body = self.read(path)
                attrs = re.sub(r"""\s*\bsrc\s*=\s*(?:"[^"]*"|'[^']*')""", "", attrs)
                base = path.parent
            elif src:
                return match.group(0)
            else:
                base = self.page.parent
            if is_module:
                body = self.resolve_imports(body, base)
            # A literal </script> inside inlined code would close the tag early.
            body = re.sub(r"</(script)", r"<\\/\1", body, flags=re.I)
            return f"<script{attrs}>{body}</script>"
        return SCRIPT.sub(swap, html)

    def run(self) -> str:
        html = self.page.read_text(encoding="utf-8")
        return self.inline_scripts(self.inline_links(html))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("page", type=pathlib.Path, help="the HTML page to bundle")
    ap.add_argument("-o", "--out", type=pathlib.Path, required=True, help="where to write the single file")
    args = ap.parse_args()

    page = args.page.resolve()
    if not page.is_file():
        sys.exit(f"bundle_html: cannot find {page}")
    bundler = Bundler(page)
    html = bundler.run()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html, encoding="utf-8")
    print(f"wrote {args.out} — {len(html.encode('utf-8')):,} bytes, {len(bundler.inlined)} file(s) inlined")
    for path in bundler.inlined:
        print(f"  + {path}")
    remote = sorted(set(re.findall(r"""(?:href|src)\s*=\s*["'](https?://[^"']+)["']""", html)))
    if remote:
        print("still loaded over the network (the page needs these, or its fallbacks, at run time):")
        for url in remote:
            print(f"  ~ {url}")


if __name__ == "__main__":
    main()
