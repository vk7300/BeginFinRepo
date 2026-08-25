import React, { useEffect, useRef } from 'react';

export const StockChartBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseY = useRef(0.5); // ranges 0.0 to 1.0 (0 is top, 1 is bottom)
  const historyRef = useRef<number[]>([]);

  // Initialize smooth starting data
  if (historyRef.current.length === 0) {
    historyRef.current = Array.from({ length: 80 }, (_, i) => 
      0.5 + Math.sin(i * 0.1) * 0.15 + (Math.random() - 0.5) * 0.05
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let blinkPhase = 0;
    const lastMoveTime = { current: Date.now() };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.height === 0) return;
      // Convert client Y coordinate to relative 0-1 canvas coordinate
      const relativeY = (e.clientY - rect.top) / rect.height;
      mouseY.current = Math.max(0.01, Math.min(0.99, relativeY));
      lastMoveTime.current = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Dynamic high-DPI sizing
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Detect if user is idle (not moving cursor)
      const isIdle = Date.now() - lastMoveTime.current > 1500;
      
      let targetVal: number;
      if (isIdle) {
        // Slow organic continuous fluctuation
        const timeFactor = Date.now() * 0.0008;
        targetVal = 0.5 + Math.sin(timeFactor) * 0.25 + Math.cos(timeFactor * 1.6) * 0.08;
        // Smoothly interpolate mouseY towards the corresponding idle height to match color nicely
        mouseY.current += ((1 - targetVal) - mouseY.current) * 0.02;
      } else {
        // Active cursor tracking
        targetVal = 1 - mouseY.current;
      }

      // Smoothly interpolate the cursor and append state with a slower, highly cinematic damping factor
      const history = historyRef.current;
      const lastVal = history[history.length - 1];
      const nextVal = lastVal + (targetVal - lastVal) * 0.035; // Slower cinematic interpolation
      
      history.push(nextVal);
      if (history.length > 80) {
        history.shift();
      }

      // Dynamic styling based on current cursor region
      const isUp = mouseY.current < 0.5;
      const intensity = Math.abs(mouseY.current - 0.5) * 2;
      const r = isUp ? 16 : 244;
      const g = isUp ? 185 : 63;
      const b = isUp ? 129 : 94;

      const strokeColor = `rgba(${r}, ${g}, ${b}, 0.75)`;
      const glowGradient = ctx.createLinearGradient(0, 0, 0, height);
      glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
      glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

      // 1. Draw horizontal micro guidelines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const y = (height / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Draw curve path
      ctx.beginPath();
      const getX = (index: number) => {
        return (index / (history.length - 1)) * width;
      };
      const getY = (val: number) => {
        // Map 0-1 scale safely to centered height viewport
        return height - (val * (height * 0.7) + (height * 0.15));
      };

      ctx.moveTo(getX(0), getY(history[0]));
      for (let i = 1; i < history.length; i++) {
        const cx = (getX(i - 1) + getX(i)) / 2;
        const cy = (getY(history[i - 1]) + getY(history[i])) / 2;
        ctx.quadraticCurveTo(getX(i - 1), getY(history[i - 1]), cx, cy);
      }
      const lastIdx = history.length - 1;
      ctx.lineTo(getX(lastIdx), getY(history[lastIdx]));

      // Stroke graph line
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Gradient Fill Area
      ctx.lineTo(getX(lastIdx), height);
      ctx.lineTo(getX(0), height);
      ctx.closePath();
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // 3. Blinking / Pulsating leading node at the cursor's historical focal point
      blinkPhase = (blinkPhase + 0.07) % (Math.PI * 2);
      const blinkAlpha = 0.4 + Math.sin(blinkPhase) * 0.45;
      
      const lastX = getX(lastIdx);
      const lastY = getY(history[lastIdx]);

      // Outer ripple
      ctx.beginPath();
      ctx.arc(lastX, lastY, 11, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${blinkAlpha * 0.25})`;
      ctx.fill();

      // Core glow
      ctx.beginPath();
      ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${blinkAlpha * 0.6})`;
      ctx.fill();

      // Bright solid point
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow representation

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none select-none" />;
};
