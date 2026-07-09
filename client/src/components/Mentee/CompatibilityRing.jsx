import React from 'react';

// Circular gauge showing a 0-100 compatibility score. Fill is proportional to
// the score and the stroke color interpolates red (low) -> green (high) on
// the HSL hue axis (0deg = red, 120deg = green).
const CompatibilityRing = ({ score = 0, size = 52, strokeWidth = 5 }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = `hsl(${(clamped / 100) * 120}, 75%, 42%)`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold" style={{ color }}>{clamped}%</span>
      </div>
    </div>
  );
};

export default CompatibilityRing;
