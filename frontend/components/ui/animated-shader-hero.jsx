'use client';

import React, { useRef, useEffect } from 'react';

// Reusable Shader Background Hook
const useShaderBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const rendererRef = useRef(null);
  const pointersRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * (window.devicePixelRatio || 1));

    // WebGL Renderer class
    class WebGLRenderer {
      constructor(canvasEl, scaleVal) {
        this.canvas = canvasEl;
        this.scale = scaleVal;
        this.gl = canvasEl.getContext('webgl2');
        if (this.gl) {
          this.gl.viewport(0, 0, canvasEl.width * scaleVal, canvasEl.height * scaleVal);
        }
        this.shaderSource = defaultShaderSource;
        this.mouseMove = [0, 0];
        this.mouseCoords = [0, 0];
        this.pointerCoords = [0, 0];
        this.nbrOfPointers = 0;
        this.vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
        this.vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;
      }

      updateShader(source) {
        this.reset();
        this.shaderSource = source;
        this.setup();
        this.init();
      }

      updateMove(deltas) {
        this.mouseMove = deltas;
      }

      updateMouse(coords) {
        this.mouseCoords = coords;
      }

      updatePointerCoords(coords) {
        this.pointerCoords = coords;
      }

      updatePointerCount(nbr) {
        this.nbrOfPointers = nbr;
      }

      updateScale(scaleVal) {
        this.scale = scaleVal;
        if (this.gl) {
          this.gl.viewport(0, 0, this.canvas.width * scaleVal, this.canvas.height * scaleVal);
        }
      }

      compile(shader, source) {
        const gl = this.gl;
        if (!gl) return;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const error = gl.getShaderInfoLog(shader);
          console.error('Shader compilation error:', error);
        }
      }

      test(source) {
        const gl = this.gl;
        if (!gl) return null;
        let result = null;
        const shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          result = gl.getShaderInfoLog(shader);
        }
        gl.deleteShader(shader);
        return result;
      }

      reset() {
        const gl = this.gl;
        if (!gl) return;
        if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
          if (this.vs) {
            gl.detachShader(this.program, this.vs);
            gl.deleteShader(this.vs);
          }
          if (this.fs) {
            gl.detachShader(this.program, this.fs);
            gl.deleteShader(this.fs);
          }
          gl.deleteProgram(this.program);
        }
      }

      setup() {
        const gl = this.gl;
        if (!gl) return;
        this.vs = gl.createShader(gl.VERTEX_SHADER);
        this.fs = gl.createShader(gl.FRAGMENT_SHADER);
        this.compile(this.vs, this.vertexSrc);
        this.compile(this.fs, this.shaderSource);
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(this.program));
        }
      }

      init() {
        const gl = this.gl;
        if (!gl) return;
        const program = this.program;
        
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        program.resolution = gl.getUniformLocation(program, 'resolution');
        program.time = gl.getUniformLocation(program, 'time');
        program.move = gl.getUniformLocation(program, 'move');
        program.touch = gl.getUniformLocation(program, 'touch');
        program.pointerCount = gl.getUniformLocation(program, 'pointerCount');
        program.pointers = gl.getUniformLocation(program, 'pointers');
      }

      render(now = 0) {
        const gl = this.gl;
        if (!gl) return;
        const program = this.program;
        
        if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        
        gl.uniform2f(program.resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(program.time, now * 1e-3);
        gl.uniform2f(program.move, ...this.mouseMove);
        gl.uniform2f(program.touch, ...this.mouseCoords);
        gl.uniform1i(program.pointerCount, this.nbrOfPointers);
        gl.uniform2fv(program.pointers, this.pointerCoords);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }

    // Pointer Handler class with clean destroy
    class PointerHandler {
      constructor(element, scaleVal) {
        this.scale = scaleVal;
        this.active = false;
        this.pointers = new Map();
        this.lastCoords = [0, 0];
        this.moves = [0, 0];
        
        const map = (el, sc, x, y) => [x * sc, el.height - y * sc];

        this.onDown = (e) => {
          this.active = true;
          this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        };

        this.onUp = (e) => {
          if (this.count === 1) {
            this.lastCoords = this.first;
          }
          this.pointers.delete(e.pointerId);
          this.active = this.pointers.size > 0;
        };

        this.onMove = (e) => {
          if (!this.active) return;
          this.lastCoords = [e.clientX, e.clientY];
          this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
          this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
        };

        window.addEventListener('pointerdown', this.onDown);
        window.addEventListener('pointerup', this.onUp);
        window.addEventListener('pointermove', this.onMove);
      }

      destroy() {
        window.removeEventListener('pointerdown', this.onDown);
        window.removeEventListener('pointerup', this.onUp);
        window.removeEventListener('pointermove', this.onMove);
      }

      getScale() {
        return this.scale;
      }

      updateScale(scaleVal) {
        this.scale = scaleVal;
      }

      get count() {
        return this.pointers.size;
      }

      get move() {
        return this.moves;
      }

      get coords() {
        return this.pointers.size > 0 
          ? Array.from(this.pointers.values()).flat() 
          : [0, 0];
      }

      get first() {
        return this.pointers.size > 0 ? this.pointers.values().next().value : this.lastCoords;
      }
    }

    const resize = () => {
      if (!canvasRef.current || typeof window === 'undefined') return;
      
      const canvasEl = canvasRef.current;
      const currentDpr = Math.max(1, 0.5 * (window.devicePixelRatio || 1));
      
      canvasEl.width = window.innerWidth * currentDpr;
      canvasEl.height = window.innerHeight * currentDpr;
      
      if (rendererRef.current) {
        rendererRef.current.updateScale(currentDpr);
      }
    };

    const loop = (now) => {
      if (!rendererRef.current || !pointersRef.current) return;
      
      rendererRef.current.updateMouse(pointersRef.current.first);
      rendererRef.current.updatePointerCount(pointersRef.current.count);
      rendererRef.current.updatePointerCoords(pointersRef.current.coords);
      rendererRef.current.updateMove(pointersRef.current.move);
      rendererRef.current.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    
    rendererRef.current.setup();
    rendererRef.current.init();
    
    resize();
    
    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }
    
    loop(0);
    
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pointersRef.current) {
        pointersRef.current.destroy();
      }
      if (rendererRef.current) {
        rendererRef.current.reset();
      }
    };
  }, []);

  return canvasRef;
};

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution

float hash(float n) { return fract(sin(n) * 43758.5453123); }

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0;
    return mix(mix(hash(n), hash(n + 1.0), f.x),
               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
    f += 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.1250 * noise(p); p = m * p * 2.01;
    f += 0.0625 * noise(p);
    return f;
}

void main() {
    vec2 uv = (FC - 0.5 * R) / R.y;
    
    // Deep midnight blue cosmic nebula background
    vec2 st = uv * 1.4;
    float q = fbm(st + vec2(T * 0.02, T * 0.015));
    float r = fbm(st + q * 1.3 + vec2(T * 0.015, -T * 0.03));
    
    vec3 baseColor = vec3(0.01, 0.025, 0.08);
    vec3 cloudColor1 = vec3(0.03, 0.10, 0.28);
    vec3 cloudColor2 = vec3(0.06, 0.18, 0.45);
    
    vec3 color = mix(baseColor, cloudColor1, q);
    color = mix(color, cloudColor2, r * 0.85);
    
    // Horizontal Shooting Meteors / Light Streaks
    for (float i = 1.0; i <= 14.0; i += 1.0) {
        float speed = 0.45 + hash(i * 13.5) * 0.75;
        float yPos = (hash(i * 37.1) - 0.5) * 1.5;
        float xPos = mod((T * speed + hash(i * 91.3) * 12.0), 3.6) - 1.8;
        
        vec2 head = vec2(xPos, yPos);
        vec2 diff = uv - head;
        
        // Horizontal tail stretching behind head (x < 0 relative to movement)
        if (diff.x < 0.0 && diff.x > -0.65) {
            float tailDist = abs(diff.x);
            float yDist = abs(diff.y);
            
            float trailWidth = 0.0028 + (1.0 - tailDist / 0.65) * 0.002;
            float trailAlpha = smoothstep(trailWidth, 0.0, yDist) * (1.0 - tailDist / 0.65);
            
            vec3 trailColor = mix(vec3(1.0, 0.92, 0.75), vec3(0.4, 0.7, 1.0), tailDist * 1.3);
            color += trailColor * trailAlpha * 1.6;
        }
        
        // Bright glowing meteor head
        float headDist = length(diff);
        float headGlow = 0.0016 / (headDist + 0.0008);
        vec3 headColor = mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.6, 0.2), headDist * 18.0);
        color += headColor * headGlow * 0.85;
    }
    
    O = vec4(color, 1.0);
}`;

export default function AnimatedShaderHero({ children, className = '' }) {
  const canvasRef = useShaderBackground();

  return (
    <section className={`animated-shader-hero ${className} relative overflow-hidden min-h-[100dvh]`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ background: '#060710', zIndex: 0 }}
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}
