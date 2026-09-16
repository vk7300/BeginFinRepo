import React, { useMemo } from 'react';

interface GuillocheBackgroundProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

/**
 * Procedural guilloche watermark background for certificates.
 * Generates an intaglio-grade rosette spirograph and sinusoidal security field.
 */
export const GuillocheBackground: React.FC<GuillocheBackgroundProps> = ({
  width = 816,
  height = 1056,
  color = '#8F9CEE',
  opacity = 0.055,
}) => {
  const cx = width / 2;
  const cy = height / 2 - 15;

  const { rosettes, ribbons } = useMemo(() => {
    const rList: string[] = [];

    // Concentric multi-lobed harmonic guilloche rosette rings
    const lobes = [12, 16, 20, 24];
    for (let i = 0; i < 20; i++) {
      const R = 75 + i * 13; // Radius from 75 to 322
      const A = 10 + (i % 4) * 4.5;
      const k = lobes[i % lobes.length];
      const phase = (i * Math.PI) / 16;
      
      let d = '';
      const steps = 180;
      for (let s = 0; s <= steps; s++) {
        const theta = (s / steps) * 2 * Math.PI;
        const r = R + A * Math.cos(k * theta + phase);
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        if (s === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
      d += ' Z';
      rList.push(d);
    }

    // Interlocking spirograph epitrochoid curve family
    for (let j = 0; j < 8; j++) {
      const R = 135;
      const r = 45;
      const dVal = 44 + j * 5;
      const rot = (j * Math.PI) / 8;
      let d = '';
      const totalSteps = 240;
      for (let s = 0; s <= totalSteps; s++) {
        const t = (s / totalSteps) * 2 * Math.PI;
        const rawX = (R + r) * Math.cos(t) - dVal * Math.cos(((R + r) * t) / r);
        const rawY = (R + r) * Math.sin(t) - dVal * Math.sin(((R + r) * t) / r);
        const x = cx + rawX * Math.cos(rot) - rawY * Math.sin(rot);
        const y = cy + rawX * Math.sin(rot) + rawY * Math.cos(rot);
        if (s === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
      d += ' Z';
      rList.push(d);
    }

    // Subtle background harmonic security ribbons
    const ribList: string[] = [];
    for (let y0 = cy - 350; y0 <= cy + 350; y0 += 32) {
      let d = '';
      for (let x = 64; x <= width - 64; x += 12) {
        const normX = (x - cx) / (width / 2);
        const envelope = Math.max(0, 1 - normX * normX);
        const y = y0 + Math.sin(x * 0.03 + (y0 % 40)) * 6.5 * envelope;
        if (x === 64) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
      ribList.push(d);
    }

    return { rosettes: rList, ribbons: ribList };
  }, [cx, cy, width]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 pointer-events-none select-none z-0"
      style={{ display: 'block', opacity }}
    >
      <g stroke={color} strokeWidth="0.75" fill="none">
        {rosettes.map((d, idx) => (
          <path key={`rosette-${idx}`} d={d} />
        ))}
      </g>
      <g stroke={color} strokeWidth="0.5" fill="none" opacity="0.6">
        {ribbons.map((d, idx) => (
          <path key={`ribbon-${idx}`} d={d} />
        ))}
      </g>
    </svg>
  );
};
