import React, { useEffect, useRef } from 'react';

const MAX_RIPPLES = 4;
const RIPPLE_DURATION_MS = 1150;

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
uniform vec2 u_pointerVelocity;
uniform float u_pointerActive;
uniform float u_mobile;
uniform vec4 u_ripples[${MAX_RIPPLES}];
uniform float u_rippleCount;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    amplitude *= 0.5;
  }

  return value;
}

vec3 backgroundAt(vec2 uv, vec2 aspect) {
  vec3 color = vec3(0.010, 0.011, 0.014);

  float topLight = length((uv - vec2(0.80, 0.82)) * aspect);
  color += vec3(0.105) * (1.0 - smoothstep(0.0, 0.88, topLight));

  float lowerLight = length((uv - vec2(0.12, 0.18)) * aspect);
  color += vec3(0.060) * (1.0 - smoothstep(0.0, 0.72, lowerLight));

  vec2 ellipsePoint = (uv - vec2(0.67, 0.34)) * aspect * vec2(0.82, 1.48);
  float ellipse = 1.0 - smoothstep(0.25, 0.44, length(ellipsePoint));
  color += vec3(0.043) * ellipse;

  float diagonal = exp(-pow((uv.x + uv.y - 1.18) * 3.2, 2.0));
  color += vec3(0.020) * diagonal;

  return color;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;

  float mobileFactor = clamp(u_mobile, 0.0, 1.0);
  float calmNoise = fbm(p * mix(2.65, 2.10, mobileFactor) + vec2(u_time * 0.055, -u_time * 0.040));
  float secondNoise = valueNoise(p * 5.4 - vec2(u_time * 0.035, u_time * 0.025));

  vec2 displacement = vec2(
    calmNoise - 0.5,
    secondNoise - 0.5
  ) * mix(0.010, 0.005, mobileFactor);

  vec2 pointerPoint = (u_pointer - 0.5) * aspect;
  vec2 pointerDelta = p - pointerPoint;
  float pointerDistance = length(pointerDelta);
  vec2 pointerDirection = pointerDelta / max(pointerDistance, 0.001);

  // Hover is intentionally strong and does not depend only on cursor speed.
  // A stationary pointer still creates a visible oscillating liquid membrane.
  float hoverRadius = mix(0.255, 0.205, mobileFactor);
  float hoverField = (1.0 - smoothstep(0.0, hoverRadius, pointerDistance)) * u_pointerActive;
  float velocityMagnitude = min(length(u_pointerVelocity) * 30.0, 1.0);

  float hoverWave = sin(
    pointerDistance * 82.0
    - u_time * 13.0
    + calmNoise * 4.0
  );

  float innerWave = sin(
    pointerDistance * 42.0
    - u_time * 8.5
  );

  // Baseline lens deformation makes normal hover clearly visible.
  displacement += pointerDirection * hoverField * 0.026;
  displacement += pointerDirection * hoverWave * hoverField * 0.015;
  displacement += pointerDirection * innerWave * hoverField * hoverField * 0.009;

  // Directional drag creates a wake when the mouse moves.
  displacement += u_pointerVelocity * hoverField * 0.52;
  displacement += pointerDirection * hoverWave * hoverField * velocityMagnitude * 0.014;

  float rippleHighlight = 0.0;

  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (float(i) < u_rippleCount) {
      vec4 ripple = u_ripples[i];
      vec2 ripplePoint = (ripple.xy - 0.5) * aspect;
      vec2 rippleDelta = p - ripplePoint;
      float rippleDistance = length(rippleDelta);
      vec2 rippleDirection = rippleDelta / max(rippleDistance, 0.001);
      float age = clamp(ripple.z, 0.0, 1.0);

      float radius = age * 0.52;
      float width = 0.025 + age * 0.035;
      float ringDistance = abs(rippleDistance - radius);
      float ring = 1.0 - smoothstep(width, width * 2.2, ringDistance);
      float damping = (1.0 - age) * (1.0 - age);
      float wave = sin((rippleDistance - radius) * 92.0);
      float amplitude = ripple.w * damping * 0.030;

      displacement += rippleDirection * ring * amplitude * (0.72 + wave * 0.28);
      rippleHighlight += ring * damping * ripple.w;
    }
  }

  vec2 refractedUv = clamp(uv + displacement, vec2(0.002), vec2(0.998));
  vec3 color = backgroundAt(refractedUv, aspect);

  // Stronger moving specular pattern under the cursor so users can feel hover.
  float hoverLight = hoverField
    * (0.42 + 0.58 * abs(hoverWave))
    * (0.085 + velocityMagnitude * 0.055);
  color += vec3(hoverLight);

  float centerGlint = pow(max(1.0 - pointerDistance / hoverRadius, 0.0), 3.0);
  color += vec3(0.035) * centerGlint * u_pointerActive;
  color += vec3(0.072) * rippleHighlight;

  float caustic = abs(sin((calmNoise + secondNoise) * 9.0 + u_time * 0.75));
  color += vec3(0.015) * caustic * mix(1.0, 0.35, mobileFactor);

  float vignetteDistance = length((uv - 0.5) * aspect * 0.82);
  float vignette = 1.0 - smoothstep(0.30, 0.92, vignetteDistance);
  color *= mix(0.58, 1.0, vignette);

  float grain = hash21(uv * u_resolution + u_time * 17.0) - 0.5;
  color += grain * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[LiquidGlass] Shader compilation failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[LiquidGlass] Program linking failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export const LiquidGlassBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance'
    });

    // AuthLayout already provides a CSS fallback behind this canvas.
    if (!gl) return undefined;

    const program = createProgram(gl);
    if (!program) return undefined;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
      ]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
      pointerVelocity: gl.getUniformLocation(program, 'u_pointerVelocity'),
      pointerActive: gl.getUniformLocation(program, 'u_pointerActive'),
      mobile: gl.getUniformLocation(program, 'u_mobile'),
      ripples: gl.getUniformLocation(program, 'u_ripples[0]'),
      rippleCount: gl.getUniformLocation(program, 'u_rippleCount')
    };

    const pointer = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      velocityX: 0,
      velocityY: 0,
      targetVelocityX: 0,
      targetVelocityY: 0,
      active: false,
      strength: 0
    };

    const ripples = [];
    const rippleData = new Float32Array(MAX_RIPPLES * 4);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let reducedMotion = motionQuery.matches;
    let isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    let animationFrame = null;
    let lastRippleTime = 0;
    const startedAt = performance.now();

    const resize = () => {
      isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.8);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now) => {
      resize();

      const targetStrength = pointer.active && !reducedMotion && !isMobile ? 1 : 0;
      pointer.strength += (targetStrength - pointer.strength) * 0.13;
      pointer.x += (pointer.targetX - pointer.x) * 0.18;
      pointer.y += (pointer.targetY - pointer.y) * 0.18;
      pointer.velocityX += (pointer.targetVelocityX - pointer.velocityX) * 0.24;
      pointer.velocityY += (pointer.targetVelocityY - pointer.velocityY) * 0.24;
      pointer.targetVelocityX *= 0.80;
      pointer.targetVelocityY *= 0.80;

      gl.useProgram(program);
      gl.uniform1f(uniforms.time, reducedMotion ? 0 : (now - startedAt) / 1000);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.uniform2f(uniforms.pointerVelocity, pointer.velocityX, pointer.velocityY);
      gl.uniform1f(uniforms.pointerActive, pointer.strength);
      gl.uniform1f(uniforms.mobile, isMobile ? 1 : 0);

      rippleData.fill(0);
      const activeRipples = ripples.filter((ripple) => now - ripple.startedAt < RIPPLE_DURATION_MS);
      ripples.length = 0;
      ripples.push(...activeRipples);

      activeRipples.forEach((ripple, index) => {
        const offset = index * 4;
        rippleData[offset] = ripple.x;
        rippleData[offset + 1] = ripple.y;
        rippleData[offset + 2] = (now - ripple.startedAt) / RIPPLE_DURATION_MS;
        rippleData[offset + 3] = ripple.strength;
      });

      gl.uniform4fv(uniforms.ripples, rippleData);
      gl.uniform1f(uniforms.rippleCount, activeRipples.length);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const frame = (now) => {
      animationFrame = null;
      draw(now);

      if (!document.hidden && !reducedMotion) {
        animationFrame = requestAnimationFrame(frame);
      }
    };

    const startAnimation = () => {
      if (animationFrame === null && !document.hidden && !reducedMotion) {
        animationFrame = requestAnimationFrame(frame);
      }
    };

    const stopAnimation = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    const getNormalizedPosition = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1),
        y: clamp(1 - (clientY - rect.top) / Math.max(rect.height, 1), 0, 1)
      };
    };

    const handlePointerMove = (event) => {
      if (reducedMotion || isMobile) return;

      const next = getNormalizedPosition(event.clientX, event.clientY);
      pointer.targetVelocityX = clamp(next.x - pointer.targetX, -0.032, 0.032);
      pointer.targetVelocityY = clamp(next.y - pointer.targetY, -0.032, 0.032);
      pointer.targetX = next.x;
      pointer.targetY = next.y;
      pointer.active = true;
      startAnimation();
    };

    const handlePointerDown = (event) => {
      if (reducedMotion) return;

      const now = performance.now();
      if (now - lastRippleTime < 90) return;
      lastRippleTime = now;

      const next = getNormalizedPosition(event.clientX, event.clientY);
      ripples.push({
        x: next.x,
        y: next.y,
        startedAt: now,
        strength: event.pointerType === 'touch' ? 0.72 : 1
      });

      if (ripples.length > MAX_RIPPLES) {
        ripples.splice(0, ripples.length - MAX_RIPPLES);
      }

      startAnimation();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (reducedMotion) {
        draw(performance.now());
      } else {
        startAnimation();
      }
    };

    const handleMotionChange = (event) => {
      reducedMotion = event.matches;
      pointer.active = false;

      if (reducedMotion) {
        stopAnimation();
        draw(performance.now());
      } else {
        startAnimation();
      }
    };

    const handleResize = () => {
      resize();
      draw(performance.now());
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize, { passive: true });
    motionQuery.addEventListener('change', handleMotionChange);

    resize();
    draw(performance.now());
    startAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('blur', handlePointerLeave);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);

      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);

      const loseContext = gl.getExtension('WEBGL_lose_context');
      loseContext?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 block h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
};
