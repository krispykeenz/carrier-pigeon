import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface FeatherPenProps {
  height?: number;
}

export function FeatherPen({ height = 64 }: FeatherPenProps) {
  const width = height * 0.36;

  return (
    <Svg width={width} height={height} viewBox="0 0 36 100">
      <Defs>
        <LinearGradient id="pen-body" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#4B4F5C" />
          <Stop offset="100%" stopColor="#2C2F3A" />
        </LinearGradient>
        <LinearGradient id="pen-feather" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#E8D9C5" />
          <Stop offset="100%" stopColor="#C9B59B" />
        </LinearGradient>
        <LinearGradient id="pen-grip" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#C6935B" />
          <Stop offset="100%" stopColor="#9E6B38" />
        </LinearGradient>
      </Defs>

      <Path
        d="M12 8 C6 26, 4 46, 6 66 C8 86, 14 98, 18 98 C22 98, 28 86, 30 66 C32 46, 30 24, 24 6"
        fill="url(#pen-feather)"
      />

      <Path
        d="M15 60 L21 60 C23.4 60, 26 62, 26 64.5 C26 66.5, 24 68, 21 68 L15 68 C11.6 68, 10 66, 10 64 C10 61.6, 12.6 60, 15 60 Z"
        fill="url(#pen-grip)"
      />

      <Path
        d="M14 68 L22 68 L22 90 C22 94, 19 96, 18 96 C17 96, 14 94, 14 90 Z"
        fill="#1F212A"
      />

      <Path
        d="M14 88 L22 88 L20 96 C20 98, 18 100, 18 100 C18 100, 16 98, 16 96 Z"
        fill="#C0C3CC"
      />

      <Path
        d="M18 8 C14 26, 12 44, 12 60 L24 60 C24 44, 22 24, 18 6"
        fill="url(#pen-body)"
      />

      <Path
        d="M12 28 C10 30, 8 38, 8 46 C8 54, 10 60, 12 60"
        stroke="rgba(70, 52, 32, 0.25)"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M24 28 C26 30, 28 38, 28 46 C28 54, 26 60, 24 60"
        stroke="rgba(70, 52, 32, 0.25)"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />

      <Path
        d="M16 92 L20 92 L18 100 Z"
        fill="#989CA8"
      />
    </Svg>
  );
}
