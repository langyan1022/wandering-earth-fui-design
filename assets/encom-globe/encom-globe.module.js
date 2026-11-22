/**
 * encom-globe.module.js — ENCOM Globe, ported to Three.js r187 (three@0.187.0) as one ES module.
 *
 * MODIFIED PORT. Original work: ENCOM Globe, https://github.com/arscan/encom-globe (v0.5.4, src/*.js),
 * Copyright (c) 2014-2017 Robert Scanlon, released under the MIT License:
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *   associated documentation files (the "Software"), to deal in the Software without restriction,
 *   including without limitation the rights to use, copy, modify, merge, publish, distribute,
 *   sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or
 *   substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 *   NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 *   DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 *   OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Changes from the original (r66) code:
 *  - Targets Three.js r187: THREE.Geometry / Face3 / LinePieces / ParticleSystem / ShaderMaterial
 *    `attributes` / Object3D.position assignment replaced by BufferGeometry + BufferAttribute,
 *    LineSegments, Points and geometry attributes; colour management through ColorManagement,
 *    SRGBColorSpace textures and <colorspace_fragment> in the custom shaders.
 *  - tween.js, quadtree2, vec2 and pusher.color are replaced by small inline re-implementations of
 *    the parts the globe used (Elastic.Out tween, brute-force label collision, HSV hue set / shade).
 *  - Options are taken when !== undefined (the original ignored falsy options such as 0).
 *  - destroy() also disposes GPU resources; Marker.remove() actually removes its lines.
 * The module imports only from 'three' and sets nothing on window.
 */
import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, Fog, Line, LineBasicMaterial,
  LineSegments, LinearFilter, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry,
  Points, RepeatWrapping, SRGBColorSpace, Scene, ShaderMaterial, Sprite, SpriteMaterial, Vector3,
  WebGLRenderer,
} from 'three';

/* ------------------------------------------------------------------ helpers (was utils.js) */

const renderToCanvas = (width, height, draw) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'));
  return canvas;
};

const mapPoint = (lat, lng, scale = 500) => {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (180 - lng) * Math.PI / 180;
  return {
    x: scale * Math.sin(phi) * Math.cos(theta),
    y: scale * Math.cos(phi),
    z: scale * Math.sin(phi) * Math.sin(theta),
  };
};

const hexToRgb = (hex) => {
  const full = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
};

const createLabel = (text, size, color, font, underlineColor) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${size}pt ${font}`;
  // at least 2px wide: an empty label would otherwise make a 0x0 texture
  canvas.width = Math.max(2, ctx.measureText(text).width);
  canvas.height = size + 10;
  if (canvas.width % 2) canvas.width++;
  if (canvas.height % 2) canvas.height++;
  if (underlineColor) canvas.height += 30;
  ctx.font = `${size}pt ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'black';
  ctx.miterLimit = 2;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.lineWidth = 2;
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  if (underlineColor) {
    ctx.strokeStyle = underlineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width - 1, canvas.height - 10);
    ctx.stroke();
  }
  return canvas;
};

/** A canvas texture with the settings r66 effectively used for canvases (no mipmaps, linear). */
const canvasTexture = (canvas) => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};

/* --------------------------------------------- colour (the part of pusher.color that was used) */

const rgbToHsv = ([r, g, b]) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, max === 0 ? 0 : (d / max) * 100, max * 100];
};

const hsvToRgb = ([h, s, v]) => {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
};

/** pusher.color(base).hueSet(): same hue, saturation and value in {100, 65, 30} (clamped to 99). */
const hueSet = (cssColor) => {
  const sRGB = new Color(cssColor).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  const [h] = rgbToHsv([sRGB.r, sRGB.g, sRGB.b]);
  const set = [];
  for (let s = 100; s >= 30; s -= 35) {
    for (let v = 100; v >= 30; v -= 35) set.push(hsvToRgb([h, Math.min(s, 99), Math.min(v, 99)]));
  }
  return set;
};

/* ------------------------------------------- tweens (the part of tween.js 0.13 that was used) */

const Easing = {
  Linear: (k) => k,
  ElasticOut: (k) => {
    if (k === 0) return 0;
    if (k === 1) return 1;
    const p = 0.4;
    const s = p / 4;
    return Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1;
  },
};

class TweenGroup {
  constructor() { this.tweens = []; }

  /** Tween `object`'s numeric properties to `target` over `duration` ms; returns a handle. */
  add(object, target, duration, { easing = Easing.Linear, delay = 0, onUpdate, onComplete } = {}) {
    const start = {};
    for (const key of Object.keys(target)) start[key] = object[key];
    const tween = { object, target, start, duration, easing, onUpdate, onComplete, t0: performance.now() + delay };
    this.tweens.push(tween);
    return tween;
  }

  update(now = performance.now()) {
    this.tweens = this.tweens.filter((tw) => {
      if (now < tw.t0) return true;
      const p = tw.duration > 0 ? Math.min(1, (now - tw.t0) / tw.duration) : 1;
      const e = tw.easing(p);
      for (const key of Object.keys(tw.target)) tw.object[key] = tw.start[key] + (tw.target[key] - tw.start[key]) * e;
      if (tw.onUpdate) tw.onUpdate.call(tw.object, e);
      if (p < 1) return true;
      if (tw.onComplete) tw.onComplete.call(tw.object);
      return false;
    });
  }

  clear() { this.tweens = []; }
}

/* ----------------------------------------------------------------------------- SmokeProvider */

const smokeVertexShader = /* glsl */ `
#define PI 3.141592653589793238462643
#define DISTANCE 500.0
in float myStartTime;
in float myStartLat;
in float myStartLon;
in float altitude;
in float smokeActive;
uniform float currentTime;
uniform vec3 smokeColor;
out vec4 vColor;

vec3 getPos(float lat, float lon) {
  if (lon < -180.0) lon = lon + 360.0;
  float phi = (90.0 - lat) * PI / 180.0;
  float theta = (180.0 - lon) * PI / 180.0;
  return vec3(DISTANCE * sin(phi) * cos(theta) * altitude,
              DISTANCE * cos(phi) * altitude,
              DISTANCE * sin(phi) * sin(theta) * altitude);
}

void main() {
  float dt = currentTime - myStartTime;
  if (dt < 0.0) dt = 0.0;
  if (dt > 0.0 && smokeActive > 0.0) dt = mod(dt, 1500.0);
  float opacity = 1.0 - dt / 1500.0;
  if (dt == 0.0 || smokeActive == 0.0) opacity = 0.0;
  vec3 newPos = getPos(myStartLat, myStartLon - (dt / 50.0));
  vColor = vec4(smokeColor, opacity);
  gl_PointSize = 2.5 - (dt / 1500.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}`;

const smokeFragmentShader = /* glsl */ `
in vec4 vColor;
void main() {
  gl_FragColor = vColor;
  #include <colorspace_fragment>
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(1500.0, 1800.0, depth);
  gl_FragColor = mix(gl_FragColor, vec4(vec3(0.0), gl_FragColor.w), fogFactor);
}`;

class SmokeProvider {
  constructor(scene, opts = {}) {
    this.opts = { smokeCount: 5000, smokePerPin: 30, smokePerSecond: 20, ...opts };
    const n = this.opts.smokeCount;
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
    for (const name of ['myStartTime', 'myStartLat', 'myStartLon', 'altitude', 'smokeActive']) {
      this.geometry.setAttribute(name, new BufferAttribute(new Float32Array(n), 1));
    }
    this.uniforms = { currentTime: { value: 0 }, smokeColor: { value: new Color('#aaa') } };
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      transparent: true,
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;   // positions are computed in the shader
    this.smokeIndex = 0;
    this.totalRunTime = 0;
    scene.add(this.points);
  }

  attr(name) { return this.geometry.getAttribute(name); }

  setFire(lat, lon, altitude) {
    const point = mapPoint(lat, lon);
    const start = this.smokeIndex;
    const pos = this.attr('position');
    for (let i = 0; i < this.opts.smokePerPin; i++) {
      const k = this.smokeIndex;
      pos.setXYZ(k, point.x * altitude, point.y * altitude, point.z * altitude);
      this.attr('myStartTime').setX(k, this.totalRunTime + (1000 * i / this.opts.smokePerSecond + 1500));
      this.attr('myStartLat').setX(k, lat);
      this.attr('myStartLon').setX(k, lon);
      this.attr('altitude').setX(k, altitude);
      this.attr('smokeActive').setX(k, 1);
      this.smokeIndex = (this.smokeIndex + 1) % this.opts.smokeCount;
    }
    for (const name of ['position', 'myStartTime', 'myStartLat', 'myStartLon', 'altitude', 'smokeActive']) {
      this.attr(name).needsUpdate = true;
    }
    return start;
  }

  setRange(name, index, value) {
    const a = this.attr(name);
    for (let i = 0; i < this.opts.smokePerPin; i++) a.setX((i + index) % this.opts.smokeCount, value);
    a.needsUpdate = true;
  }

  extinguish(index) { this.setRange('smokeActive', index, 0); }

  changeAltitude(altitude, index) { this.setRange('altitude', index, altitude); }

  tick(totalRunTime) {
    this.totalRunTime = totalRunTime;
    this.uniforms.currentTime.value = totalRunTime;
  }
}

/* ----------------------------------------------------------------------------------------- Pin */

const createTopCanvas = (color) => renderToCanvas(20, 20, (ctx) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(10, 10, 5, 0, 2 * Math.PI);
  ctx.fill();
});

const labelPosition = (sprite, point, altitude, yScale = 1) => {
  sprite.position.set(point.x * altitude * 1.1, point.y * altitude * yScale + (point.y < 0 ? -15 : 30), point.z * altitude * 1.1);
};

class Pin {
  constructor(lat, lon, text, altitude, ctx, _opts = {}) {
    const opts = {
      lineColor: '#8FD8D8', lineWidth: 1, topColor: '#8FD8D8', smokeColor: '#FFF', labelColor: '#FFF',
      font: 'Inconsolata', showLabel: text.length > 0, showTop: text.length > 0, showSmoke: text.length > 0,
    };
    for (const k of Object.keys(opts)) if (_opts[k] !== undefined) opts[k] = _opts[k];

    Object.assign(this, { lat, lon, text, altitude, ctx, opts, dateCreated: Date.now() });
    this.scene = ctx.scene;
    this.smokeProvider = ctx.smoke;
    this.topVisible = opts.showTop;
    this.smokeVisible = opts.showSmoke;
    this.labelVisible = opts.showLabel;

    const point = mapPoint(lat, lon);

    /* the line */
    this.lineGeometry = new BufferGeometry();
    this.lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array([point.x, point.y, point.z, point.x, point.y, point.z]), 3));
    this.line = new Line(this.lineGeometry, new LineBasicMaterial({ color: opts.lineColor, linewidth: opts.lineWidth }));
    this.line.frustumCulled = false;

    /* the label */
    const labelCanvas = createLabel(text, 18, opts.labelColor, opts.font);
    const labelMaterial = new SpriteMaterial({ map: canvasTexture(labelCanvas), opacity: 0, depthTest: true, fog: true });
    this.labelSprite = new Sprite(labelMaterial);
    labelPosition(this.labelSprite, point, altitude);
    this.labelSprite.scale.set(labelCanvas.width, labelCanvas.height, 1);

    /* the top */
    const topMaterial = new SpriteMaterial({ map: canvasTexture(createTopCanvas(opts.topColor)), depthTest: true, fog: true, opacity: 0 });
    this.topSprite = new Sprite(topMaterial);
    this.topSprite.scale.set(20, 20, 1);
    this.topSprite.position.set(point.x * altitude, point.y * altitude, point.z * altitude);

    /* the smoke */
    if (this.smokeVisible) this.smokeId = this.smokeProvider.setFire(lat, lon, altitude);

    /* intro animations */
    if (opts.showTop || opts.showLabel) {
      ctx.tweens.add({ opacity: 0 }, { opacity: 1 }, 500, {
        delay: 1000,
        onUpdate: (e) => {
          topMaterial.opacity = this.topVisible ? e : 0;
          labelMaterial.opacity = this.labelVisible ? e : 0;
        },
      });
    }
    const end = { x: point.x * altitude, y: point.y * altitude, z: point.z * altitude };
    ctx.tweens.add({ ...point }, end, 1500, {
      easing: Easing.ElasticOut,
      onUpdate: function onUpdate() { pinTip(this); },
    });
    const pinTip = (p) => {
      const pos = this.lineGeometry.getAttribute('position');
      pos.setXYZ(1, p.x, p.y, p.z);
      pos.needsUpdate = true;
    };

    this.scene.add(this.labelSprite, this.line, this.topSprite);
  }

  toString() { return `${this.lat}_${this.lon}`; }

  changeAltitude(altitude) {
    const point = mapPoint(this.lat, this.lon);
    const pin = this;
    this.ctx.tweens.add({ altitude: this.altitude }, { altitude }, 1500, {
      easing: Easing.ElasticOut,
      onUpdate: function onUpdate() {
        const a = this.altitude;
        if (pin.smokeVisible) pin.smokeProvider.changeAltitude(a, pin.smokeId);
        if (pin.topVisible) pin.topSprite.position.set(point.x * a, point.y * a, point.z * a);
        if (pin.labelVisible) labelPosition(pin.labelSprite, point, a);
        const pos = pin.lineGeometry.getAttribute('position');
        pos.setXYZ(1, point.x * a, point.y * a, point.z * a);
        pos.needsUpdate = true;
      },
      onComplete: () => { pin.altitude = altitude; },
    });
  }

  hideTop() { if (this.topVisible) { this.topSprite.material.opacity = 0; this.topVisible = false; } }

  showTop() { if (!this.topVisible) { this.topSprite.material.opacity = 1; this.topVisible = true; } }

  hideLabel() { if (this.labelVisible) { this.labelSprite.material.opacity = 0; this.labelVisible = false; } }

  showLabel() { if (!this.labelVisible) { this.labelSprite.material.opacity = 1; this.labelVisible = true; } }

  hideSmoke() {
    if (this.smokeVisible) { this.smokeProvider.extinguish(this.smokeId); this.smokeVisible = false; }
  }

  showSmoke() {
    if (!this.smokeVisible) {
      this.smokeId = this.smokeProvider.setFire(this.lat, this.lon, this.altitude);
      this.smokeVisible = true;
    }
  }

  age() { return Date.now() - this.dateCreated; }

  remove() {
    this.scene.remove(this.labelSprite, this.line, this.topSprite);
    disposeObject(this.labelSprite);
    disposeObject(this.line);
    disposeObject(this.topSprite);
    if (this.smokeVisible) this.smokeProvider.extinguish(this.smokeId);
  }
}

/* -------------------------------------------------------------------------------------- Marker */

const createMarkerTexture = (markerColor) => canvasTexture(renderToCanvas(30, 30, (ctx) => {
  ctx.fillStyle = markerColor;
  ctx.strokeStyle = markerColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(15, 15, 10, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(15, 15, 6, 0, 2 * Math.PI);
  ctx.fill();
}));

class Marker {
  constructor(lat, lon, text, altitude, previous, ctx, _opts = {}) {
    const opts = {
      lineColor: '#FFCC00', lineWidth: 1, markerColor: '#FFCC00', labelColor: '#FFF',
      font: 'Inconsolata', fontSize: 20, drawTime: 2000, lineSegments: 150,
    };
    for (const k of Object.keys(opts)) if (_opts[k] !== undefined) opts[k] = _opts[k];

    this.lat = parseFloat(lat);
    this.lon = parseFloat(lon);
    this.text = text;
    this.altitude = parseFloat(altitude);
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.previous = previous;
    this.next = [];
    this.opts = opts;
    this.lines = [];
    if (previous) previous.next.push(this);

    const point = mapPoint(this.lat, this.lon);
    if (!ctx.markerTexture) ctx.markerTexture = createMarkerTexture(opts.markerColor);

    this.marker = new Sprite(new SpriteMaterial({ map: ctx.markerTexture, opacity: 0.7, depthTest: true, fog: true }));
    this.marker.scale.set(0, 0, 1);
    this.marker.position.set(point.x * altitude, point.y * altitude, point.z * altitude);

    const labelCanvas = createLabel(text.toUpperCase(), opts.fontSize, opts.labelColor, opts.font, opts.markerColor);
    const labelMaterial = new SpriteMaterial({ map: canvasTexture(labelCanvas), opacity: 0, depthTest: true, fog: true });
    this.labelSprite = new Sprite(labelMaterial);
    labelPosition(this.labelSprite, point, altitude, 1.05);
    this.labelSprite.scale.set(labelCanvas.width, labelCanvas.height, 1);

    ctx.tweens.add({ opacity: 0 }, { opacity: 1 }, 500, { onUpdate: function onUpdate() { labelMaterial.opacity = this.opacity; } });
    const sprite = this.marker;
    ctx.tweens.add({ x: 0, y: 0 }, { x: 50, y: 50 }, 2000, {
      easing: Easing.ElasticOut,
      delay: previous ? opts.drawTime : 0,
      onUpdate: function onUpdate() { sprite.scale.set(this.x, this.y, 1); },
    });

    if (previous) this.drawConnection(previous);

    this.scene.add(this.marker, this.labelSprite);
  }

  /** The arc to the previous marker: a solid line and a dotted (segment pairs) line drawn over drawTime. */
  drawConnection(previous) {
    const { lineSegments, drawTime, lineColor } = this.opts;
    const n = lineSegments + 1;
    const latdist = (this.lat - previous.lat) / lineSegments;
    const londist = (this.lon - previous.lon) / lineSegments;
    const start = mapPoint(previous.lat, previous.lon);
    const pointList = [];
    const pointList2 = [];
    for (let j = 0; j < n; j++) {
      const nextlat = (((90 + previous.lat + j * latdist) % 180) - 90) * (0.5 + Math.cos(j * (5 * Math.PI / 2) / lineSegments) / 2)
        + (j * this.lat / lineSegments / 2);
      const nextlon = ((180 + previous.lon + j * londist) % 360) - 180;
      pointList.push({ lat: nextlat, lon: nextlon, index: j });
      pointList2.push({ lat: (j === 0 || j === lineSegments) ? nextlat : nextlat + 1, lon: nextlon, index: j });
    }
    const filled = (scale) => {
      const arr = new Float32Array(n * 3);
      for (let j = 0; j < n; j++) arr.set([start.x * scale, start.y * scale, start.z * scale], j * 3);
      return new BufferAttribute(arr, 3);
    };
    this.geometrySpline = new BufferGeometry().setAttribute('position', filled(1.2));
    this.geometrySplineDotted = new BufferGeometry().setAttribute('position', filled(1.2));
    // r66 drew the dotted line with LinePieces: an odd vertex count leaves the last one unused
    this.geometrySplineDotted.setDrawRange(0, n - (n % 2));

    const solid = new Line(this.geometrySpline, new LineBasicMaterial({ color: lineColor, transparent: true, linewidth: 3, opacity: 0.5 }));
    const dotted = new LineSegments(this.geometrySplineDotted, new LineBasicMaterial({ color: lineColor, linewidth: 1, transparent: true, opacity: 0.5 }));
    solid.frustumCulled = false;
    dotted.frustumCulled = false;
    this.lines = [solid, dotted];

    const update = () => {
      if (this.ctx.destroyed) return;
      const spot = pointList.shift();
      const spot2 = pointList2.shift();
      const p = mapPoint(spot.lat, spot.lon);
      const p2 = mapPoint(spot2.lat, spot2.lon);
      const a = this.geometrySpline.getAttribute('position');
      const b = this.geometrySplineDotted.getAttribute('position');
      for (let x = spot.index; x < n; x++) {
        a.setXYZ(x, p.x * 1.2, p.y * 1.2, p.z * 1.2);
        b.setXYZ(x, p2.x * 1.19, p2.y * 1.19, p2.z * 1.19);
      }
      a.needsUpdate = true;
      b.needsUpdate = true;
      if (pointList.length > 0) this.timer = setTimeout(update, drawTime / lineSegments);
    };
    update();
    this.scene.add(solid, dotted);
  }

  /** Retract the lines drawn to this marker from its successors, then drop them (original: lines leaked). */
  retractConnection() {
    if (!this.geometrySpline) return;
    clearTimeout(this.timer);
    const a = this.geometrySpline.getAttribute('position');
    const b = this.geometrySplineDotted.getAttribute('position');
    let x = 0;
    const step = () => {
      if (this.ctx.destroyed) return;
      for (let i = 0; i < x && i + 1 < a.count; i++) {
        a.setXYZ(i, a.getX(i + 1), a.getY(i + 1), a.getZ(i + 1));
        b.setXYZ(i, b.getX(i + 1), b.getY(i + 1), b.getZ(i + 1));
      }
      a.needsUpdate = true;
      b.needsUpdate = true;
      x++;
      if (x < a.count) {
        setTimeout(step, this.opts.drawTime / this.opts.lineSegments);
      } else {
        for (const line of this.lines) { this.scene.remove(line); disposeObject(line); }
        this.lines = [];
      }
    };
    step();
  }

  remove() {
    for (const next of this.next) next.retractConnection();
    this.scene.remove(this.marker, this.labelSprite);
    this.marker.material.dispose();   // the marker texture is shared: not disposed here
    disposeObject(this.labelSprite);
  }
}

/* ------------------------------------------------------------------ TextureAnimator, Satellite */

// based on http://stemkoski.github.io/Three.js/Texture-Animation.html
class TextureAnimator {
  constructor(texture, tilesVert, tilesHoriz, numTiles, tileDispDuration, repeatAtTile) {
    this.texture = texture;
    this.repeatAtTile = repeatAtTile === undefined ? -1 : repeatAtTile;
    // the original tested an unset field here, so shutDownFlag was always false
    this.shutDownFlag = false;
    this.done = false;
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1 / tilesHoriz, 1 / tilesVert);
    this.tileDisplayDuration = tileDispDuration;
    this.currentDisplayTime = 0;
    this.currentTile = 0;
    texture.offset.y = 1;
  }

  update(milliSec) {
    this.currentDisplayTime += milliSec;
    while (!this.done && this.currentDisplayTime > this.tileDisplayDuration) {
      if (this.shutDownFlag && this.currentTile >= this.numberOfTiles) {
        this.done = true;
        if (this.shutDownCb) this.shutDownCb();
      } else {
        this.currentDisplayTime -= this.tileDisplayDuration;
        this.currentTile++;
        if (this.currentTile === this.numberOfTiles && !this.shutDownFlag) this.currentTile = this.repeatAtTile;
        const col = this.currentTile % this.tilesHorizontal;
        const row = Math.floor(this.currentTile / this.tilesHorizontal);
        this.texture.offset.x = col / this.tilesHorizontal;
        this.texture.offset.y = 1 - (row / this.tilesVertical) - 1 / this.tilesVertical;
      }
    }
  }

  shutDown(cb) {
    this.shutDownFlag = true;
    this.shutDownCb = cb;
  }
}

const createSatelliteCanvas = (numFrames, pixels, rows, waveStart, numWaves, waveColor, coreColor, shieldColor) => {
  const cols = numFrames / rows;
  const waveInterval = Math.floor((numFrames - waveStart) / numWaves);
  const waveDist = pixels - 25;
  const distPerFrame = waveDist / (numFrames - waveStart);
  const waveRGB = hexToRgb(waveColor) || { r: 255, g: 255, b: 255 };
  let offsetx = 0;
  let offsety = 0;
  let curRow = 0;

  return renderToCanvas(numFrames * pixels / rows, pixels * rows, (ctx) => {
    for (let i = 0; i < numFrames; i++) {
      if (i - curRow * cols >= cols) { offsetx = 0; offsety += pixels; curRow++; }
      const cx = offsetx + 25;
      const cy = offsety + Math.floor(pixels / 2);

      /* circle around core */
      ctx.lineWidth = 2;
      ctx.strokeStyle = shieldColor;
      const buffer = Math.PI / 16;
      const start = -Math.PI + Math.PI / 4;
      let radius = 8;
      const repeatAt = Math.floor(numFrames - 2 * (numFrames - waveStart) / numWaves) + 1;
      if (i < waveStart) radius = radius * i / waveStart;
      const swirlDone = Math.floor((repeatAt - waveStart) / 2) + waveStart;

      for (let n = 0; n < 4; n++) {
        ctx.beginPath();
        if (i < waveStart || i >= numFrames) {
          ctx.arc(cx, cy, radius, n * Math.PI / 2 + start + buffer, n * Math.PI / 2 + start + Math.PI / 2 - 2 * buffer);
        } else if (i > waveStart && i < swirlDone) {
          const step = (3 * Math.PI / 2) / (swirlDone - waveStart);
          const sa = -Math.PI + Math.PI / 4 + buffer + step * (i - waveStart);
          ctx.arc(cx, cy, radius, Math.max(n * Math.PI / 2 + start, sa), Math.max(n * Math.PI / 2 + start + Math.PI / 2 - 2 * buffer, sa + Math.PI / 2 - 2 * buffer));
        } else if (i >= swirlDone && i < repeatAt) {
          const step = (n * 2 * Math.PI / 4) / (repeatAt - swirlDone);
          const sa = Math.PI / 2 + Math.PI / 4 + buffer + step * (i - swirlDone);
          ctx.arc(cx, cy, radius, sa, sa + Math.PI / 2 - 2 * buffer);
        } else if (i >= repeatAt && i < (numFrames - repeatAt) / 2 + repeatAt) {
          const step = (Math.PI / 2) / ((numFrames - repeatAt) / 2);
          const sa = n * (Math.PI / 2) + Math.PI / 4 + buffer + step * (i - repeatAt);
          ctx.arc(cx, cy, radius, sa, sa + Math.PI / 2 - 2 * buffer);
        } else {
          ctx.arc(cx, cy, radius, n * Math.PI / 2 + start + buffer, n * Math.PI / 2 + start + Math.PI / 2 - 2 * buffer);
        }
        ctx.stroke();
      }

      /* waves going out */
      for (let wi = 0; wi < numWaves; wi++) {
        const frameOn = i - (waveInterval * wi) - waveStart;
        if (frameOn > 0 && frameOn * distPerFrame < pixels - 25) {
          ctx.strokeStyle = `rgba(${waveRGB.r},${waveRGB.g},${waveRGB.b},${0.9 - frameOn * distPerFrame / (pixels - 25)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, frameOn * distPerFrame, -Math.PI / 12, Math.PI / 12);
          ctx.stroke();
        }
      }

      /* core */
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, i < waveStart ? 3 * i / waveStart : 3, 0, 2 * Math.PI);
      ctx.stroke();

      offsetx += pixels;
    }
  });
};

const SAT_FRAMES = 50;
const SAT_PIXELS = 100;
const SAT_ROWS = 10;
const SAT_WAVE_START = Math.floor(SAT_FRAMES / 8);

class Satellite {
  constructor(lat, lon, altitude, scene, _opts = {}, canvas, texture) {
    const opts = { numWaves: 8, waveColor: '#FFF', coreColor: '#FF0000', shieldColor: '#FFF', size: 1 };
    for (const k of Object.keys(opts)) if (_opts[k] !== undefined) opts[k] = _opts[k];
    Object.assign(this, { lat, lon, altitude, scene, opts, onRemoveList: [] });

    if (canvas && texture) {
      this.canvas = canvas;
      this.texture = texture;          // shared: animated by the first satellite of a constellation
      this.sharedTexture = true;
    } else {
      this.canvas = canvas || createSatelliteCanvas(SAT_FRAMES, SAT_PIXELS, SAT_ROWS, SAT_WAVE_START, opts.numWaves, opts.waveColor, opts.coreColor, opts.shieldColor);
      this.makeTexture();
    }

    const point = mapPoint(lat, lon, 500 * altitude);
    this.material = new MeshBasicMaterial({ map: this.texture, depthTest: false, transparent: true });
    this.mesh = new Mesh(new PlaneGeometry(opts.size * 150, opts.size * 150, 1, 1), this.material);
    this.mesh.tiltMultiplier = Math.PI / 2 * (1 - Math.abs(lat / 90));
    this.mesh.tiltDirection = lat > 0 ? -1 : 1;
    this.mesh.lon = lon;
    this.mesh.position.set(point.x, point.y, point.z);
    this.mesh.rotation.z = -1 * (lat / 90) * Math.PI / 2;
    this.mesh.rotation.y = (lon / 180) * Math.PI;
    scene.add(this.mesh);
  }

  makeTexture() {
    this.texture = canvasTexture(this.canvas);
    const repeatAt = Math.floor(SAT_FRAMES - 2 * (SAT_FRAMES - SAT_WAVE_START) / this.opts.numWaves) + 1;
    this.animator = new TextureAnimator(this.texture, SAT_ROWS, SAT_FRAMES / SAT_ROWS, SAT_FRAMES, 80, repeatAt);
  }

  changeAltitude(altitude) {
    const p = mapPoint(this.lat, this.lon, 500 * altitude);
    this.altitude = altitude;
    this.mesh.position.set(p.x, p.y, p.z);
  }

  changeCanvas(numWaves, waveColor, coreColor, shieldColor) {
    if (numWaves) this.opts.numWaves = numWaves;
    if (waveColor) this.opts.waveColor = waveColor;
    if (coreColor) this.opts.coreColor = coreColor;
    if (shieldColor) this.opts.shieldColor = shieldColor;
    const o = this.opts;
    this.canvas = createSatelliteCanvas(SAT_FRAMES, SAT_PIXELS, SAT_ROWS, SAT_WAVE_START, o.numWaves, o.waveColor, o.coreColor, o.shieldColor);
    if (!this.sharedTexture && this.texture) this.texture.dispose();
    this.sharedTexture = false;
    this.makeTexture();
    this.material.map = this.texture;
    this.material.needsUpdate = true;
  }

  tick(cameraPosition, cameraAngle, renderTime) {
    this.mesh.lookAt(cameraPosition);
    this.mesh.rotateZ(this.mesh.tiltDirection * Math.PI / 2);
    this.mesh.rotateZ(Math.sin(cameraAngle + (this.mesh.lon / 180) * Math.PI) * this.mesh.tiltMultiplier * this.mesh.tiltDirection * -1);
    if (this.animator) this.animator.update(renderTime);
  }

  remove() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    for (const fn of this.onRemoveList) fn();
  }

  onRemove(fn) { this.onRemoveList.push(fn); }

  toString() { return `${this.lat}_${this.lon}_${this.altitude}`; }
}

/* ---------------------------------------------------------------------------------- disposal */

function disposeObject(object) {
  if (object.geometry) object.geometry.dispose();
  const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
  for (const m of materials) {
    if (m.map) m.map.dispose();
    m.dispose();
  }
}

/* ------------------------------------------------------------------------------------- Globe */

const hexVertexShader = /* glsl */ `
#define PI 3.141592653589793238462643
in float lng;
uniform float currentTime;
uniform float introDuration;
uniform float introAltitude;
out vec4 vColor;

void main() {
  vec3 newPos = position;
  float opacityVal = 0.0;
  float introStart = introDuration * ((180.0 + lng) / 360.0);
  if (currentTime > introStart) opacityVal = 1.0;
  if (currentTime > introStart && currentTime < introStart + introDuration / 8.0) {
    newPos = position * introAltitude;
    opacityVal = 0.3;
  }
  if (currentTime > introStart + introDuration / 8.0 && currentTime < introStart + introDuration / 8.0 + 200.0) {
    newPos = position * (1.0 + ((introAltitude - 1.0) * (1.0 - (currentTime - introStart - (introDuration / 8.0)) / 200.0)));
  }
  vColor = vec4(color, opacityVal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}`;

const hexFragmentShader = /* glsl */ `
uniform float fogNear;
uniform float fogFar;
in vec4 vColor;
void main() {
  gl_FragColor = vColor;
  #include <colorspace_fragment>
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(fogNear, fogFar, depth);
  gl_FragColor = mix(gl_FragColor, vec4(vec3(0.0), gl_FragColor.w), fogFactor);
}`;

/** Pins' label-collision circles in (lat+90, lon+180) space: replaces quadtree2 + vec2. */
const collides = (a, b) => a !== b && Math.hypot(a.pos_.x - b.pos_.x, a.pos_.y - b.pos_.y) < a.rad_ + b.rad_;

const latLon2d = (lat, lon) => ({ x: lat + 90, y: lon + 180, rad: 2 + (Math.abs(lat) / 90) * 15 });

const DEFAULTS = {
  font: 'Inconsolata',
  baseColor: '#ffcc00',
  markerColor: '#ffcc00',
  pinColor: '#00eeee',
  satelliteColor: '#ff0000',
  blankPercentage: 0,
  thinAntarctica: 0.01,
  mapUrl: 'resources/equirectangle_projection.png',
  introLinesAltitude: 1.10,
  introLinesDuration: 2000,
  introLinesColor: '#8FD8D8',
  introLinesCount: 60,
  scale: 1.0,
  dayLength: 28000,
  pointsPerDegree: 1.1,
  pointSize: 0.6,
  pointsVariance: 0.2,
  maxPins: 500,
  maxMarkers: 4,
  data: [],
  tiles: [],
  viewAngle: 0,
};

export class Globe {
  constructor(width, height, opts = {}) {
    this.width = width;
    this.height = height;
    this.points = [];
    this.introLines = new Object3D();
    this.pins = [];
    this.markers = [];
    this.satelliteAnimations = [];
    this.satelliteMeshes = [];
    this.satellites = {};
    this.active = true;
    this.tweens = new TweenGroup();

    for (const key of Object.keys(DEFAULTS)) {
      this[key] = opts[key] !== undefined ? opts[key] : DEFAULTS[key];
    }
    this.data = [...this.data];

    this.setScale(this.scale);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1);
    this.renderer.setSize(this.width, this.height);
    this.domElement = this.renderer.domElement;

    this.data.sort((a, b) => (b.lng - b.label.length * 2) - (a.lng - a.label.length * 2));
    for (const d of this.data) d.when = this.introLinesDuration * ((180 + d.lng) / 360.0) + 500;
  }

  init(cb) {
    this.camera = new PerspectiveCamera(50, this.width / this.height, 1, this.cameraDistance + 300);
    this.camera.position.z = this.cameraDistance;
    this.cameraAngle = Math.PI;

    this.scene = new Scene();
    this.scene.fog = new Fog(0x000000, this.cameraDistance, this.cameraDistance + 300);
    this.ctx = { scene: this.scene, tweens: this.tweens, smoke: null, markerTexture: null, destroyed: false };

    this.createIntroLines();
    this.smokeProvider = new SmokeProvider(this.scene);
    this.ctx.smoke = this.smokeProvider;
    this.createParticles();
    setTimeout(cb, 500);
  }

  createParticles() {
    if (this.hexGrid) {
      this.scene.remove(this.hexGrid);
      disposeObject(this.hexGrid);
    }

    const palette = hueSet(this.baseColor).map((rgb) => {
      const shade = Math.random() / 3.0;   // pusher.color shade(): blend toward black
      return rgb.map((c) => Math.floor(255 * c * (1 - shade)) / 255);
    });

    let triangles = 0;
    for (const t of this.tiles) triangles += t.b.length > 5 ? 4 : 3;
    const positions = new Float32Array(triangles * 9);
    const colors = new Float32Array(triangles * 9);
    const lngs = new Float32Array(triangles * 3);
    const color = new Color();
    let k = 0;
    const addTriangle = (a, b, c, lng) => {
      for (const v of [a, b, c]) {
        positions.set([v.x, v.y, v.z], k * 3);
        colors.set([color.r, color.g, color.b], k * 3);
        lngs[k] = lng;
        k++;
      }
    };
    for (const t of this.tiles) {
      const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
      color.setRGB(r, g, b, SRGBColorSpace);   // stored in the linear working space
      addTriangle(t.b[0], t.b[1], t.b[2], t.lon);
      addTriangle(t.b[0], t.b[2], t.b[3], t.lon);
      addTriangle(t.b[0], t.b[3], t.b[4], t.lon);
      if (t.b.length > 5) addTriangle(t.b[0], t.b[5], t.b[4], t.lon);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('lng', new BufferAttribute(lngs, 1));
    geometry.computeBoundingSphere();

    this.pointUniforms = {
      currentTime: { value: this.totalRunTime || 0 },
      introDuration: { value: parseFloat(this.introLinesDuration) + 0.00001 },
      introAltitude: { value: parseFloat(this.introLinesAltitude) + 0.00001 },
      fogNear: { value: this.cameraDistance },
      fogFar: { value: this.cameraDistance + 300 },
    };
    const material = new ShaderMaterial({
      uniforms: this.pointUniforms,
      vertexShader: hexVertexShader,
      fragmentShader: hexFragmentShader,
      transparent: true,
      vertexColors: true,
      side: DoubleSide,
    });

    this.hexGrid = new Mesh(geometry, material);
    this.scene.add(this.hexGrid);
  }

  createIntroLines() {
    this.introLinesMaterial = new LineBasicMaterial({ color: this.introLinesColor, transparent: true, linewidth: 2, opacity: 0.5 });
    for (let i = 0; i < this.introLinesCount; i++) {
      const lat = Math.random() * 180 + 90;
      let lon = Math.random() * 5;
      let lenBase = 4 + Math.floor(Math.random() * 5);
      if (Math.random() < 0.3) {
        lon = Math.random() * 30 - 50;
        lenBase = 3 + Math.floor(Math.random() * 3);
      }
      const pts = [];
      for (let j = 0; j < lenBase; j++) {
        const p = mapPoint(lat, lon - j * 5, 500 * this.introLinesAltitude);
        pts.push(new Vector3(p.x, p.y, p.z));
      }
      this.introLines.add(new Line(new BufferGeometry().setFromPoints(pts), this.introLinesMaterial));
    }
    this.scene.add(this.introLines);
  }

  destroy(callback) {
    this.active = false;
    setTimeout(() => {
      this.ctx.destroyed = true;
      this.tweens.clear();
      const disposed = new Set();
      this.scene.traverse((o) => {
        if (o.geometry && !disposed.has(o.geometry)) { disposed.add(o.geometry); o.geometry.dispose(); }
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) {
          if (disposed.has(m)) continue;
          disposed.add(m);
          if (m.map && !disposed.has(m.map)) { disposed.add(m.map); m.map.dispose(); }
          m.dispose();
        }
      });
      if (this.ctx.markerTexture) this.ctx.markerTexture.dispose();
      while (this.scene.children.length > 0) this.scene.remove(this.scene.children[0]);
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (typeof callback === 'function') callback();
    }, 1000);
  }

  addPin(lat, lon, text) {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    text = typeof text === 'string' ? text : '';
    const opts = { lineColor: this.pinColor, topColor: this.pinColor, font: this.font };
    let altitude = 1.2;
    if (text.length === 0) altitude -= 0.05 + Math.random() * 0.05;

    const pin = new Pin(lat, lon, text, altitude, this.ctx, opts);
    this.pins.push(pin);

    const pos = latLon2d(lat, lon);
    pin.pos_ = { x: parseInt(pos.x, 10), y: parseInt(pos.y, 10) };
    pin.rad_ = text.length > 0 ? pos.rad : 1;

    if (text.length > 0) {
      const collisions = this.pins.filter((p) => collides(pin, p));
      let collisionCount = 0;
      let tooYoungCount = 0;
      const hidePins = [];
      for (const c of collisions) {
        if (c.text.length > 0) {
          collisionCount++;
          if (c.age() > 5000) hidePins.push(c);
          else tooYoungCount++;
        }
      }
      const demote = (p) => {
        p.hideLabel();
        p.hideSmoke();
        p.hideTop();
        p.changeAltitude(Math.random() * 0.05 + 1.1);
      };
      if (collisionCount > 0 && tooYoungCount === 0) hidePins.forEach(demote);
      else if (collisionCount > 0) demote(pin);
    }

    if (this.pins.length > this.maxPins) this.pins.shift().remove();
    return pin;
  }

  addMarker(lat, lon, text, connected) {
    const opts = { markerColor: this.markerColor, lineColor: this.markerColor, font: this.font };
    const label = typeof text === 'string' ? text : '';
    let previous = null;
    if (typeof connected === 'boolean' && connected) previous = this.markers[this.markers.length - 1] || null;
    else if (connected && typeof connected === 'object') previous = connected;
    const marker = new Marker(lat, lon, label, 1.2, previous, this.ctx, opts);
    this.markers.push(marker);
    if (this.markers.length > this.maxMarkers) this.markers.shift().remove();
    return marker;
  }

  addSatellite(lat, lon, altitude, opts, texture, animator) {
    /* texture and animator are optimisations so redundant assets are not regenerated:
       as in the original, they are the first satellite's canvas and texture */
    const o = { ...(opts || {}) };
    if (o.coreColor === undefined) o.coreColor = this.satelliteColor;
    const satellite = new Satellite(lat, lon, altitude, this.scene, o, texture, animator);
    const key = satellite.toString();
    if (!this.satellites[key]) this.satellites[key] = satellite;
    satellite.onRemove(() => { delete this.satellites[key]; });
    return satellite;
  }

  addConstellation(sats, opts) {
    const constellation = [];
    sats.forEach((s, i) => {
      const sat = i === 0
        ? this.addSatellite(s.lat, s.lon, s.altitude, opts)
        : this.addSatellite(s.lat, s.lon, s.altitude, opts, constellation[0].canvas, constellation[0].texture);
      constellation.push(sat);
    });
    return constellation;
  }

  setMaxPins(maxPins) {
    this.maxPins = maxPins;
    while (this.pins.length > this.maxPins) this.pins.shift().remove();
  }

  setMaxMarkers(maxMarkers) {
    this.maxMarkers = maxMarkers;
    while (this.markers.length > this.maxMarkers) this.markers.shift().remove();
  }

  setBaseColor(color) {
    this.baseColor = color;
    if (this.scene) this.createParticles();
  }

  /** Applies to markers added afterwards (as in the original). */
  setMarkerColor(color) {
    this.markerColor = color;
    if (this.ctx) this.ctx.markerTexture = null;   // existing markers keep (and own) the old texture
  }

  /** Applies to pins added afterwards (as in the original). */
  setPinColor(color) {
    this.pinColor = color;
  }

  setScale(scale) {
    this.scale = scale;
    this.cameraDistance = 1700 / scale;
    if (this.scene && this.scene.fog) {
      this.scene.fog.near = this.cameraDistance;
      this.scene.fog.far = this.cameraDistance + 300;
      this.createParticles();
      this.camera.far = this.cameraDistance + 300;
      this.camera.updateProjectionMatrix();
    }
  }

  tick() {
    if (!this.camera || this.ctx.destroyed) return;
    const now = Date.now();
    if (!this.firstRunTime) this.firstRunTime = now;
    this.addInitialData();
    this.tweens.update();

    if (!this.lastRenderDate) this.lastRenderDate = now;
    if (!this.firstRenderDate) this.firstRenderDate = now;
    this.totalRunTime = now - this.firstRenderDate;
    const renderTime = now - this.lastRenderDate;
    this.lastRenderDate = now;

    // dayLength = Infinity gives 0: no rotation
    const rotateCameraBy = renderTime > 0 ? (2 * Math.PI) / (this.dayLength / renderTime) : 0;
    this.cameraAngle += rotateCameraBy;

    if (!this.active) this.cameraDistance += (1000 * renderTime / 1000);

    this.camera.position.set(
      this.cameraDistance * Math.cos(this.cameraAngle) * Math.cos(this.viewAngle),
      Math.sin(this.viewAngle) * this.cameraDistance,
      this.cameraDistance * Math.sin(this.cameraAngle) * Math.cos(this.viewAngle),
    );

    for (const key of Object.keys(this.satellites)) this.satellites[key].tick(this.camera.position, this.cameraAngle, renderTime);

    if (this.introLines) {
      if (this.introLinesDuration > this.totalRunTime) {
        // kept as in the original: the later branch overrides the fade-in, so lines start at full opacity
        const f = this.totalRunTime / this.introLinesDuration;
        if (f < 0.1) this.introLinesMaterial.opacity = f * (1 / 0.1) - 0.2;
        if (f > 0.8) this.introLinesMaterial.opacity = Math.max(1 - f, 0) * (1 / 0.2);
        else this.introLinesMaterial.opacity = 1;
        this.introLines.rotateY((2 * Math.PI) / (this.introLinesDuration / Math.max(renderTime, 1e-6)));
      } else {
        this.scene.remove(this.introLines);
        this.introLines.children.forEach((l) => l.geometry.dispose());
        this.introLinesMaterial.dispose();
        this.introLines = null;
      }
    }

    this.pointUniforms.currentTime.value = this.totalRunTime;
    this.smokeProvider.tick(this.totalRunTime);

    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  addInitialData() {
    if (this.data.length === 0) return;
    let next;
    while (this.data.length > 0 && this.firstRunTime + (next = this.data.pop()).when < Date.now()) {
      this.addPin(next.lat, next.lng, next.label);
      next = null;
    }
    if (next && this.firstRunTime + next.when >= Date.now()) this.data.push(next);
  }
}

export default Globe;
