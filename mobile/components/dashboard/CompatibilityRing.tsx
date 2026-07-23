import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  score?: number;
  size?: number;
  strokeWidth?: number;
};

// Direct port of the web's CompatibilityRing.jsx — same math, same
// red(0)->green(120) HSL hue interpolation, react-native-svg instead of DOM SVG.
export function CompatibilityRing({ score = 0, size = 52, strokeWidth = 5 }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = `hsl(${(clamped / 100) * 120}, 75%, 42%)`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: 'bold', color }}>{clamped}%</Text>
      </View>
    </View>
  );
}
