import React, { useMemo } from 'react';

interface GuillocheBorderProps {
  width?: number;
  height?: number;
  color?: string;
}

export const GuillocheBorder: React.FC<GuillocheBorderProps> = ({
  width = 816,
  height = 1056,
  color = '#8F9CEE',
}) => {
  // Precompute circle coordinates for horizontal and vertical guilloche bands
  const { topBottomCircles, leftRightCircles, topScallop, bottomScallop, leftScallop, rightScallop } = useMemo(() => {
    const tb: number[] = [];
    for (let x = 38; x <= width - 38; x += 8) {
      tb.push(x);
    }

    const lr: number[] = [];
    for (let y = 38; y <= height - 38; y += 8) {
      lr.push(y);
    }

    // Generate undulating scalloped rim paths
    let ts = `M 38 11`;
    let bs = `M 38 ${height - 11}`;
    for (let x = 38; x <= width - 38; x += 12) {
      const mid = x + 6;
      const next = Math.min(x + 12, width - 38);
      ts += ` Q ${mid} 9 ${next} 11`;
      bs += ` Q ${mid} ${height - 9} ${next} ${height - 11}`;
    }

    let ls = `M 11 38`;
    let rs = `M ${width - 11} 38`;
    for (let y = 38; y <= height - 38; y += 12) {
      const mid = y + 6;
      const next = Math.min(y + 12, height - 38);
      ls += ` Q 9 ${mid} 11 ${next}`;
      rs += ` Q ${width - 9} ${mid} ${width - 11} ${next}`;
    }

    return { 
      topBottomCircles: tb, 
      leftRightCircles: lr,
      topScallop: ts,
      bottomScallop: bs,
      leftScallop: ls,
      rightScallop: rs
    };
  }, [width, height]);

  // Rotations for 12-petal corner rosettes
  const rosetteAngles = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165];

  const corners = [
    { cx: 22, cy: 22 },
    { cx: width - 22, cy: 22 },
    { cx: 22, cy: height - 22 },
    { cx: width - 22, cy: height - 22 },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 pointer-events-none select-none"
      style={{ display: 'block' }}
    >
      {/* Outer Fine Hairline Border */}
      <rect
        x="4"
        y="4"
        width={width - 8}
        height={height - 8}
        stroke={color}
        strokeWidth="0.5"
        strokeOpacity="0.25"
      />

      {/* Main Outer Border Line */}
      <rect
        x="7"
        y="7"
        width={width - 14}
        height={height - 14}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Main Inner Border Line */}
      <rect
        x="37"
        y="37"
        width={width - 74}
        height={height - 74}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Inset Hairline Accent */}
      <rect
        x="41"
        y="41"
        width={width - 82}
        height={height - 82}
        stroke={color}
        strokeWidth="0.5"
        strokeOpacity="0.38"
      />

      {/* Top Guilloche Band (Intertwined security circles) */}
      <g stroke={color} fill="none">
        {topBottomCircles.map((x) => (
          <React.Fragment key={`tb-top-${x}`}>
            <circle cx={x} cy={22} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={x} cy={22} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Bottom Guilloche Band */}
      <g stroke={color} fill="none">
        {topBottomCircles.map((x) => (
          <React.Fragment key={`tb-bot-${x}`}>
            <circle cx={x} cy={height - 22} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={x} cy={height - 22} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Left Guilloche Band */}
      <g stroke={color} fill="none">
        {leftRightCircles.map((y) => (
          <React.Fragment key={`lr-left-${y}`}>
            <circle cx={22} cy={y} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={22} cy={y} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Right Guilloche Band */}
      <g stroke={color} fill="none">
        {leftRightCircles.map((y) => (
          <React.Fragment key={`lr-right-${y}`}>
            <circle cx={width - 22} cy={y} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={width - 22} cy={y} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Scalloped Rim Highlights */}
      <path d={topScallop} stroke={color} strokeWidth="0.6" strokeOpacity="0.55" />
      <path d={bottomScallop} stroke={color} strokeWidth="0.6" strokeOpacity="0.55" />
      <path d={leftScallop} stroke={color} strokeWidth="0.6" strokeOpacity="0.55" />
      <path d={rightScallop} stroke={color} strokeWidth="0.6" strokeOpacity="0.55" />

      {/* Four Corner Rosette Medallions */}
      {corners.map((corner, cIdx) => (
        <g key={`corner-${cIdx}`}>
          {/* Concentric Guilloche Rings */}
          <circle cx={corner.cx} cy={corner.cy} r={24} stroke={color} strokeWidth="0.5" strokeOpacity="0.35" />
          <circle cx={corner.cx} cy={corner.cy} r={18} stroke={color} strokeWidth="0.55" strokeOpacity="0.45" />
          <circle cx={corner.cx} cy={corner.cy} r={12} stroke={color} strokeWidth="0.65" strokeOpacity="0.55" />
          <circle cx={corner.cx} cy={corner.cy} r={6} stroke={color} strokeWidth="0.7" strokeOpacity="0.65" />

          {/* Rotated Elliptical Petals */}
          {rosetteAngles.map((deg) => (
            <ellipse
              key={`petal-${cIdx}-${deg}`}
              cx={corner.cx}
              cy={corner.cy}
              rx={15}
              ry={5.5}
              transform={`rotate(${deg} ${corner.cx} ${corner.cy})`}
              stroke={color}
              strokeWidth="0.5"
              strokeOpacity="0.48"
            />
          ))}

          {/* Central Medallion Dot */}
          <circle cx={corner.cx} cy={corner.cy} r={2.2} fill={color} fillOpacity="0.6" />
        </g>
      ))}
    </svg>
  );
};
