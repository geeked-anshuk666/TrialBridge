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
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float st=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    st+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return st;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.2,-st.y));
	uv*=1.-.2*(sin(T*.15)*.5+.5);
	for (float i=1.; i<10.; i++) {
		uv+=.08*cos(i*vec2(.1+.01*i, .8)+i*i+T*.25+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		col+=.0008/d*(cos(sin(i)*vec3(0.8,1.8,3.2))+1.);
		float b=noise(i+p+bg*1.5);
		col+=.0012*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col=mix(col,vec3(bg*.04,bg*.08,bg*.18),d);
	}
	O=vec4(col,1);
}`;

export default function AnimatedShaderHero() {
  const canvasRef = useShaderBackground();

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#060710',
        display: 'block',
      }}
    />
  );
}

