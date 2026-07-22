import { useEffect, useRef, useCallback } from 'react';

// ─── Shader Source ───────────────────────────────────────────────────────────

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec2 u_pointerVel;
uniform float u_pointerActive;
uniform vec4 u_ripples[6]; // xy = origin, z = age (0-1), w = strength
uniform float u_rippleCount;
uniform float u_isMobile;

// ─── Simplex-style noise ─────────────────────────────────────────────────────
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Reduced complexity for mobile
float fbmMobile(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 2; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = uv * aspect;
  
  float t = u_time * 0.15; // Slow time for calm movement
  
  // ─── Background Layers ─────────────────────────────────────────────────────
  
  // Layer 1: Near-black base
  vec3 col = vec3(0.016, 0.016, 0.018);
  
  // Layer 2: Large off-white radial illumination (top-right, partly outside viewport)
  vec2 lightPos1 = vec2(0.78, 0.82);
  float d1 = length((uv - lightPos1) * aspect);
  col += vec3(0.055) * smoothstep(0.9, 0.0, d1);
  
  // Layer 3: Graphite light field (bottom-left)
  vec2 lightPos2 = vec2(0.15, 0.12);
  float d2 = length((uv - lightPos2) * aspect);
  col += vec3(0.035) * smoothstep(1.0, 0.0, d2);
  
  // Layer 4: Blurred geometric shapes for refraction visibility
  float geo1 = smoothstep(0.42, 0.38, length((uv - vec2(0.3, 0.65)) * aspect * vec2(1.4, 1.0)));
  float geo2 = smoothstep(0.35, 0.30, length((uv - vec2(0.72, 0.3)) * aspect * vec2(1.0, 1.5)));
  col += vec3(0.025) * geo1;
  col += vec3(0.020) * geo2;
  
  // ─── Liquid Surface Displacement ──────────────────────────────────────────
  
  float noiseScale = u_isMobile > 0.5 ? 2.2 : 2.8;
  vec2 noiseCoord = p * noiseScale;
  
  // Calm surface movement
  float surfaceNoise;
  if (u_isMobile > 0.5) {
    surfaceNoise = fbmMobile(noiseCoord + t * 0.3);
  } else {
    surfaceNoise = fbm(noiseCoord + t * 0.3);
  }
  
  // Secondary slower layer for depth
  float surfaceNoise2 = snoise(noiseCoord * 0.5 - t * 0.2) * 0.5;
  
  float totalSurface = surfaceNoise * 0.6 + surfaceNoise2 * 0.4;
  
  // ─── Pointer Interaction ───────────────────────────────────────────────────
  
  vec2 displacement = vec2(0.0);
  
  if (u_pointerActive > 0.5) {
    vec2 pointerUV = u_pointer * aspect;
    vec2 diff = p - pointerUV;
    float dist = length(diff);
    
    // Influence radius ~120px normalized
    float radius = 0.14;
    float influence = smoothstep(radius, 0.0, dist);
    
    // Displacement based on pointer velocity (inertia feel)
    vec2 velDir = u_pointerVel * 0.008;
    float velMag = length(velDir);
    velMag = min(velMag, 0.012); // Clamp max displacement
    
    displacement += normalize(diff + 0.001) * influence * velMag * 2.0;
    displacement += velDir * influence * 1.5;
    
    // Subtle local depression
    displacement -= diff * influence * 0.015;
  }
  
  // ─── Click Ripples ─────────────────────────────────────────────────────────
  
  float rippleDisp = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_rippleCount) break;
    vec4 ripple = u_ripples[i];
    vec2 rippleOrigin = ripple.xy * aspect;
    float age = ripple.z;
    float strength = ripple.w;
    
    if (age > 0.0 && age < 1.0) {
      float dist = length(p - rippleOrigin);
      float maxRadius = 0.35;
      float currentRadius = age * maxRadius;
      float ringWidth = 0.06 + age * 0.04;
      
      // Ring-shaped displacement
      float ring = exp(-pow((dist - currentRadius) / ringWidth, 2.0));
      
      // Amplitude fades with age (ease-out damping)
      float amplitude = strength * (1.0 - age) * (1.0 - age) * 0.025;
      
      // Sine modulation for natural wave
      float wave = sin(dist * 40.0 - age * 12.0) * 0.5 + 0.5;
      
      rippleDisp += ring * amplitude * wave;
      
      // Radial displacement for refraction
      vec2 dir = normalize(p - rippleOrigin + 0.0001);
      displacement += dir * ring * amplitude * 0.8;
    }
  }
  
  // ─── Apply Displacement to Background (Refraction) ─────────────────────────
  
  vec2 refractedUV = uv + displacement + totalSurface * 0.008;
  
  // Re-sample background with displaced UVs
  vec3 refractedCol = vec3(0.016, 0.016, 0.018);
  
  vec2 rLightPos1 = vec2(0.78, 0.82);
  float rd1 = length((refractedUV - rLightPos1) * aspect);
  refractedCol += vec3(0.055) * smoothstep(0.9, 0.0, rd1);
  
  vec2 rLightPos2 = vec2(0.15, 0.12);
  float rd2 = length((refractedUV - rLightPos2) * aspect);
  refractedCol += vec3(0.035) * smoothstep(1.0, 0.0, rd2);
  
  float rgeo1 = smoothstep(0.42, 0.38, length((refractedUV - vec2(0.3, 0.65)) * aspect * vec2(1.4, 1.0)));
  float rgeo2 = smoothstep(0.35, 0.30, length((refractedUV - vec2(0.72, 0.3)) * aspect * vec2(1.0, 1.5)));
  refractedCol += vec3(0.025) * rgeo1;
  refractedCol += vec3(0.020) * rgeo2;
  
  // Blend refracted with base
  col = mix(col, refractedCol, 0.7);
  
  // ─── Specular Highlights & Caustics ────────────────────────────────────────
  
  // Approximate surface normal from noise gradient
  float eps = 0.01;
  float nx = fbm((p + vec2(eps, 0.0)) * noiseScale + t * 0.3) - 
             fbm((p - vec2(eps, 0.0)) * noiseScale + t * 0.3);
  float ny = fbm((p + vec2(0.0, eps)) * noiseScale + t * 0.3) - 
             fbm((p - vec2(0.0, eps)) * noiseScale + t * 0.3);
  vec2 normal = vec2(nx, ny) * 2.0 + displacement * 8.0;
  
  // Specular from top-right light
  vec2 lightDir = normalize(vec2(0.5, 0.7));
  float spec = pow(max(dot(normalize(normal + 0.001), lightDir), 0.0), 12.0);
  col += vec3(0.06) * spec;
  
  // Faint caustic highlights
  float caustic = pow(abs(snoise(p * 5.0 + t * 0.5 + normal * 2.0)), 3.0);
  col += vec3(0.018) * caustic;
  
  // Ripple highlights
  col += vec3(0.04) * abs(rippleDisp) * 3.0;
  
  // ─── Fresnel Edge Response ─────────────────────────────────────────────────
  float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float fresnel = smoothstep(0.3, 0.0, edgeDist) * 0.03;
  col += vec3(fresnel);
  
  // ─── Vignette ──────────────────────────────────────────────────────────────
  float vig = 1.0 - smoothstep(0.4, 1.1, length((uv - 0.5) * aspect * 0.9));
  col *= mix(0.55, 1.0, vig);
  
  // ─── Noise Grain (1-3%) ────────────────────────────────────────────────────
  float grain = fract(sin(dot(uv * u_resolution, vec2(12.9898, 78.233)) + u_time) * 43758.5453);
  col += (grain - 0.5) * 0.018;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Reduced Motion Static Shader ────────────────────────────────────────────

const STATIC_FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  
  // Static dark base
  vec3 col = vec3(0.016, 0.016, 0.018);
  
  // Static radial lights
  float d1 = length((uv - vec2(0.78, 0.82)) * aspect);
  col += vec3(0.055) * smoothstep(0.9, 0.0, d1);
  
  float d2 = length((uv - vec2(0.15, 0.12)) * aspect);
  col += vec3(0.035) * smoothstep(1.0, 0.0, d2);
  
  // Static geometric shapes
  float geo1 = smoothstep(0.42, 0.38, length((uv - vec2(0.3, 0.65)) * aspect * vec2(1.4, 1.0)));
  float geo2 = smoothstep(0.35, 0.30, length((uv - vec2(0.72, 0.3)) * aspect * vec2(1.0, 1.5)));
  col += vec3(0.025) * geo1;
  col += vec3(0.020) * geo2;
  
  // Vignette
  float vig = 1.0 - smoothstep(0.4, 1.1, length((uv - 0.5) * aspect * 0.9));
  col *= mix(0.55, 1.0, vig);
  
  // Subtle grain
  float grain = fract(sin(dot(uv * u_resolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.012;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── WebGL Helpers ───────────────────────────────────────────────────────────

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const LiquidGlassBackground = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef({});
  const startTimeRef = useRef(Date.now());
  const pointerRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, active: false });
  const smoothPointerRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0 });
  const ripplesRef = useRef([]);
  const isVisibleRef = useRef(true);
  const isMobileRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const lastPointerTimeRef = useRef(0);

  const MAX_RIPPLES = 6;
  const RIPPLE_DURATION = 1200; // ms

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return false;

    const isStatic = reducedMotionRef.current;
    const fragSource = isStatic ? STATIC_FRAGMENT_SHADER : FRAGMENT_SHADER;
    const program = createProgram(gl, VERTEX_SHADER, fragSource);
    if (!program) return false;

    // Full-screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Cache uniform locations
    const uniforms = {};
    const uniformNames = isStatic
      ? ['u_resolution']
      : ['u_time', 'u_resolution', 'u_pointer', 'u_pointerVel', 'u_pointerActive',
         'u_ripples[0]', 'u_rippleCount', 'u_isMobile'];

    uniformNames.forEach(name => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    // For ripple array, get all 6 locations
    if (!isStatic) {
      for (let i = 0; i < MAX_RIPPLES; i++) {
        uniforms[`u_ripples[${i}]`] = gl.getUniformLocation(program, `u_ripples[${i}]`);
      }
    }

    glRef.current = gl;
    programRef.current = program;
    uniformsRef.current = uniforms;

    return true;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    // Clamp DPR for performance
    const dpr = Math.min(window.devicePixelRatio || 1, isMobileRef.current ? 1.5 : 2);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !uniforms.u_resolution) return;

    const canvas = canvasRef.current;
    const time = (Date.now() - startTimeRef.current) / 1000;

    // Smooth pointer interpolation (inertia)
    const sp = smoothPointerRef.current;
    const tp = pointerRef.current;
    const lerp = 0.08;
    sp.x += (tp.x - sp.x) * lerp;
    sp.y += (tp.y - sp.y) * lerp;
    sp.vx += (tp.vx - sp.vx) * 0.06;
    sp.vy += (tp.vy - sp.vy) * 0.06;

    // Decay pointer velocity
    tp.vx *= 0.92;
    tp.vy *= 0.92;

    // Deactivate pointer after inactivity
    if (Date.now() - lastPointerTimeRef.current > 2000) {
      tp.active = false;
    }

    gl.uniform2f(uniforms['u_resolution'], canvas.width, canvas.height);

    if (!reducedMotionRef.current) {
      gl.uniform1f(uniforms['u_time'], time);
      gl.uniform2f(uniforms['u_pointer'], sp.x, sp.y);
      gl.uniform2f(uniforms['u_pointerVel'], sp.vx, sp.vy);
      gl.uniform1f(uniforms['u_pointerActive'], tp.active ? 1.0 : 0.0);
      gl.uniform1f(uniforms['u_isMobile'], isMobileRef.current ? 1.0 : 0.0);

      // Update ripples
      const now = Date.now();
      const activeRipples = ripplesRef.current.filter(r => now - r.start < RIPPLE_DURATION);
      ripplesRef.current = activeRipples;

      gl.uniform1f(uniforms['u_rippleCount'], activeRipples.length);
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const loc = uniforms[`u_ripples[${i}]`];
        if (!loc) continue;
        if (i < activeRipples.length) {
          const r = activeRipples[i];
          const age = (now - r.start) / RIPPLE_DURATION;
          gl.uniform4f(loc, r.x, r.y, age, r.strength);
        } else {
          gl.uniform4f(loc, 0, 0, 0, 0);
        }
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, []);

  const animate = useCallback(() => {
    if (!isVisibleRef.current) return;
    render();
    rafRef.current = requestAnimationFrame(animate);
  }, [render]);

  useEffect(() => {
    // Detect preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;
    isMobileRef.current = window.matchMedia('(pointer: coarse)').matches ||
                          window.innerWidth < 768;

    const success = initWebGL();
    if (!success) {
      // Fallback: canvas stays transparent, CSS background handles it
      return;
    }

    resize();

    // Start animation (or render single static frame)
    if (reducedMotionRef.current) {
      render(); // Single frame
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }

    // ─── Event Handlers ──────────────────────────────────────────────────────

    const handlePointerMove = (e) => {
      if (reducedMotionRef.current || isMobileRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      const prev = pointerRef.current;
      const now = performance.now();
      const dt = Math.max(now - (lastPointerTimeRef.current || now), 1);

      prev.vx = ((x - prev.x) / dt) * 16; // Normalize to ~frame
      prev.vy = ((y - prev.y) / dt) * 16;
      prev.x = x;
      prev.y = y;
      prev.active = true;
      lastPointerTimeRef.current = Date.now();
    };

    const handlePointerDown = (e) => {
      if (reducedMotionRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      // Limit ripple creation rate
      const now = Date.now();
      const recentRipples = ripplesRef.current.filter(r => now - r.start < 200);
      if (recentRipples.length >= 3) return;

      ripplesRef.current.push({
        x, y,
        start: now,
        strength: isMobileRef.current ? 0.6 : 1.0,
      });

      // Keep max ripples
      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current = ripplesRef.current.slice(-MAX_RIPPLES);
      }
    };

    const handleTouchStart = (e) => {
      if (reducedMotionRef.current) return;
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handlePointerDown(touch);
    };

    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current && !reducedMotionRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handleResize = () => {
      resize();
      if (reducedMotionRef.current) render();
    };

    const handleMotionChange = (e) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        // Stop animation, re-init with static shader
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        // Re-create program with static shader
        const gl = glRef.current;
        if (gl) {
          const program = createProgram(gl, VERTEX_SHADER, STATIC_FRAGMENT_SHADER);
          if (program) {
            gl.useProgram(program);
            const uniforms = { u_resolution: gl.getUniformLocation(program, 'u_resolution') };
            uniformsRef.current = uniforms;
            programRef.current = program;
            render();
          }
        }
      }
    };

    // Attach listeners
    if (!isMobileRef.current) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    if (isMobileRef.current) {
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize, { passive: true });
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);

      // Cleanup WebGL
      const gl = glRef.current;
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }, [initWebGL, resize, render, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ display: 'block' }}
    />
  );
};
