const SimplexNoise = require('simplex-noise');

import { imageToImageData } from '../../util';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { Scene } from 'three/src/scenes/Scene';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Points } from 'three/src/objects/Points';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { _Math } from 'three/src/math/Math';
import { AdditiveBlending } from 'three/src/constants';
// import { OrbitControls } from './OrbitControls';

import vertexSource from './shaders/shader.vert';
import fragmentSource from './shaders/shader.frag';

export default class Canvas {
  constructor({ w, h, dpr, eContainer }) {
    this.simplex = new SimplexNoise(Math.random);

    this.w = w;
    this.h = h;

    this.mouse = new Vector2(.5, .5);

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(dpr);

    eContainer.appendChild(this.renderer.domElement);

    const fov    = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist   = (this.h / 2) / Math.tan(fovRad);
    this.camera = new PerspectiveCamera(fov, this.w / this.h, 1, this.w * 3);
    this.camera.position.z = dist;

    // this.controls = new OrbitControls(this.camera);
    // this.controls.update();

    this.isSpread = false;

    this.loader = new TextureLoader();// テクスチャローダーを作成
    const texture = this.loader.load('/resource/img/logo_128.png', tex => {
      const imageData = imageToImageData(tex.image);
      this.start(imageData);
    });
  }

  start(imageData) {
    const pixels = imageData.data;
    const imgW = imageData.width;
    const imgH = imageData.height;

    const geo = new BufferGeometry();
    this.defaultPositions = [];
    this.randomPositions = [];
    
    this.defaultSizes = [];
    this.randomSizes = [];

    this.rotationIncs = [];
    const rotations = [];

    const colors = [];
    this.easings = [];

    const texIndices = [];

    const baseColor = {
      r: 255 / 255,
      g: 183 / 255,
      b: 225 / 255
    };

    const pixelScale = 4.;

    for(let i = 0; i < (imgW * imgH); ++i) {
      const r = pixels[i * 4    ] / 255;
      const g = pixels[i * 4 + 1] / 255;
      const b = pixels[i * 4 + 2] / 255;
      const a = pixels[i * 4 + 3] / 255;
      if(a < 0.2) continue;

      const isCherry = Math.random() > .9;
      texIndices.push(isCherry ? 1.0 : 0.0);

      let x = (i % imgH) * pixelScale;
      let y = parseInt(i / imgW) * pixelScale;

      x -= imgW * .5 * pixelScale;
      y = -y + imgH * .5 * pixelScale;

      this.defaultPositions.push(x, y, 0.);

      const yy = Math.floor(i / imgW) * .05;
      this.easings.push(.03 + yy * 0.01);

      const bri = b + .3;
      const r1 = baseColor.r * bri;
      const g1 = baseColor.g * bri;
      const b1 = baseColor.b * bri;

      colors.push(r1, g1, b1);

      const tx = _Math.randFloatSpread(this.w * 1.5);
      const ty = _Math.randFloatSpread(this.w * 1.5);
      const tz = _Math.randFloatSpread(this.w * .5);
      this.randomPositions.push(tx, ty, tz);

      const ss = isCherry ? 2 : 1;
      
      this.defaultSizes.push(16 * a);
      this.randomSizes.push((30. + _Math.randFloatSpread(10)) * ss);

      rotations.push(Math.random() * Math.PI);
      const rotInc = (.01 + _Math.randFloat(0, .015)) * ((Math.random() > .5) ? -1 : 1);
      this.rotationIncs.push(rotInc);
    }

    const vertices = this.defaultPositions;
    this.targetPositions = this.defaultPositions;

    const sizes = this.defaultSizes;
    this.targetSizes = this.defaultSizes;

    console.log(vertices.length);

    geo.addAttribute('position', new Float32BufferAttribute(vertices, 3));
    geo.addAttribute('color', new Float32BufferAttribute(colors, 3));
    geo.addAttribute('size', new Float32BufferAttribute(sizes, 1));
    geo.addAttribute('rotation', new Float32BufferAttribute(rotations, 1));
    geo.addAttribute('texIndex', new Float32BufferAttribute(texIndices, 1));
    geo.attributes.position.setDynamic(true);
    geo.attributes.size.setDynamic(true);
    geo.attributes.rotation.setDynamic(true);

    this.uniforms = {
      uTime: {
        value: 0.0
      },
      uMouse: {
        value: new Vector2(.5, .5)
      },
      uSpriteTex0: {
        value: this.loader.load('/resource/img/petal.png')
      },
      uSpriteTex1: {
        value: this.loader.load('/resource/img/cherry.png')
      }
    };

    const mat = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
      transparent: true,
      depthTest: false
    });

    this.points = new Points( geo, mat );

    this.scene = new Scene();
    this.scene.add( this.points );
    
    // 画面に表示
    this.render();

    console.log( this );
  }

  toggleSpread() {
    this.isSpread = !this.isSpread;
    
    if(!this.isSpread) {
      for(let i = 0; i < this.randomPositions.length; ++i) {
        let v = _Math.randFloatSpread(this.w);
        v *= (i % 3 == 2) ? .5 : 1.5;
        this.randomPositions[i] = v;
      }
    }

    this.targetPositions = (this.isSpread) ? this.randomPositions　: this.defaultPositions;
    this.targetSizes = (this.isSpread) ? this.randomSizes : this.defaultSizes;
  }

  get numParticles() {
    return this.points.geometry.attributes.position.array.length;
  }

  render() {
    requestAnimationFrame( () => { this.render(); } );

    // this.controls.update();

    const sec = performance.now() * .001;

    const dpos = this.defaultPositions;
    const tpos = this.targetPositions;
    const rpos = this.randomPositions;
    const pos = this.points.geometry.attributes.position;
    const siz = this.points.geometry.attributes.size;
    const rot = this.points.geometry.attributes.rotation;

    const deadIndices = [];

    const flag = false;

    for(let i = 0; i < pos.array.length; ++i) {
      const e = this.easings[parseInt(i / 4)] * ( this.isSpread ? .1 : 1 );
      pos.array[i] += ( tpos[i] - pos.array[i] ) * e;
      siz.array[i] += ( this.targetSizes[i] - siz.array[i] ) * e;
      rot.array[i] += this.rotationIncs[i];

      if(this.isSpread && i % 3 == 1) {// y
        if(pos.array[i] < -this.w * .5) {
          const rx = _Math.randFloatSpread(this.w * 1.5);
          const ry = _Math.randFloatSpread(this.w) + this.w;
          const rz = _Math.randFloatSpread(this.w * .5);

          pos.array[i - 1] = rx;
          pos.array[i    ] = ry;
          pos.array[i + 1] = rz;

          tpos[i - 1] = rx;
          tpos[i    ] = ry;
          tpos[i + 1] = rz;
        }
        else {// add force
          const np = {
            x: tpos[i - 1],
            y: tpos[i    ],
            z: tpos[i + 1]
          };

          const nx = this.simplex.noise3D(np.x * 0.0001, np.y * 0.0001, sec * .2);
          const nz = this.simplex.noise3D(np.x * 0.0001, np.y * 0.0001, sec * .2 + 123.456789);

          tpos[i - 1] += nx * 1.2;
          tpos[i    ] -= 1.2;// fall down
          tpos[i + 1] += nz * 1.2;
        }
      }
    }

    pos.needsUpdate = true;
    siz.needsUpdate = true;
    rot.needsUpdate = true;

    this.uniforms.uTime.value = sec;
    this.uniforms.uMouse.value.lerp(this.mouse, .2);

    this.renderer.render(this.scene, this.camera);
  }

  resized(w, h) {
    this.w = w;
    this.h = h;
    this.renderer.setSize(this.w, this.h);

    const fov    = this.camera.fov;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist   = (this.h / 2) / Math.tan(fovRad);
    this.camera.position.z = dist;
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }

  mouseMoved(x, y) {
    this.mouse.x =  x - (this.w / 2);
    this.mouse.y = -y + (this.h / 2);
  }

  mousePressed(x, y) {
    this.mouseMoved(x, y);

    this.toggleSpread();
  }
  mouseReleased(x, y) {
    this.mouseMoved(x, y);
  }
};
