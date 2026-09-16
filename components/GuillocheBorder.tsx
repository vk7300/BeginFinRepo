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
    for (let x = 42; x <= width - 42; x += 8) {
      tb.push(x);
    }

    const lr: number[] = [];
    for (let y = 42; y <= height - 42; y += 8) {
      lr.push(y);
    }

    // Generate undulating scalloped rim paths
    let ts = `M 42 13`;
    let bs = `M 42 ${height - 13}`;
    for (let x = 42; x <= width - 42; x += 12) {
      const mid = x + 6;
      const next = Math.min(x + 12, width - 42);
      ts += ` Q ${mid} 11 ${next} 13`;
      bs += ` Q ${mid} ${height - 11} ${next} ${height - 13}`;
    }

    let ls = `M 13 42`;
    let rs = `M ${width - 13} 42`;
    for (let y = 42; y <= height - 42; y += 12) {
      const mid = y + 6;
      const next = Math.min(y + 12, height - 42);
      ls += ` Q 11 ${mid} 13 ${next}`;
      rs += ` Q ${width - 11} ${mid} ${width - 13} ${next}`;
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
    { cx: 26, cy: 26 },
    { cx: width - 26, cy: 26 },
    { cx: 26, cy: height - 26 },
    { cx: width - 26, cy: height - 26 },
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
        x="7"
        y="7"
        width={width - 14}
        height={height - 14}
        stroke={color}
        strokeWidth="0.5"
        strokeOpacity="0.25"
      />

      {/* Main Outer Border Line */}
      <rect
        x="10"
        y="10"
        width={width - 20}
        height={height - 20}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Main Inner Border Line */}
      <rect
        x="42"
        y="42"
        width={width - 84}
        height={height - 84}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Inset Hairline Accent */}
      <rect
        x="46"
        y="46"
        width={width - 92}
        height={height - 92}
        stroke={color}
        strokeWidth="0.5"
        strokeOpacity="0.38"
      />

      {/* Top Guilloche Band (Intertwined security circles) */}
      <g stroke={color} fill="none">
        {topBottomCircles.map((x) => (
          <React.Fragment key={`tb-top-${x}`}>
            <circle cx={x} cy={26} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={x} cy={26} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Bottom Guilloche Band */}
      <g stroke={color} fill="none">
        {topBottomCircles.map((x) => (
          <React.Fragment key={`tb-bot-${x}`}>
            <circle cx={x} cy={height - 26} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={x} cy={height - 26} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Left Guilloche Band */}
      <g stroke={color} fill="none">
        {leftRightCircles.map((y) => (
          <React.Fragment key={`lr-left-${y}`}>
            <circle cx={26} cy={y} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={26} cy={y} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
          </React.Fragment>
        ))}
      </g>

      {/* Right Guilloche Band */}
      <g stroke={color} fill="none">
        {leftRightCircles.map((y) => (
          <React.Fragment key={`lr-right-${y}`}>
            <circle cx={width - 26} cy={y} r={13} strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx={width - 26} cy={y} r={8.5} strokeWidth="0.4" strokeOpacity="0.28" />
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
