import { memo, useMemo } from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import type { PigeonVariantId } from "@/constants/pigeons";
import { getPigeonVariantById } from "@/constants/pigeons";

interface PigeonIllustrationProps {
  variant: PigeonVariantId;
  size?: number;
}

export const PigeonIllustration = memo(function PigeonIllustration({ variant, size = 120 }: PigeonIllustrationProps) {
  const variantData = useMemo(() => getPigeonVariantById(variant), [variant]);
  const gradientId = useMemo(() => `pigeon-bg-${variant}-${size}`, [variant, size]);

  const { palette } = variantData;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={palette.backgroundStart} />
          <Stop offset="100%" stopColor={palette.backgroundEnd} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={120} height={120} rx={28} fill={`url(#${gradientId})`} />

      <Ellipse cx={32} cy={28} rx={16} ry={12} fill={palette.accent} opacity={0.4} />
      <Path
        d="M18 78 C32 66, 50 62, 66 76"
        stroke={palette.trail}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        opacity={0.45}
      />

      <G transform="translate(22, 30)">
        <Path
          d="M32 16 C22 16, 12 24, 12 38 C12 58, 32 70, 54 68 C70 66, 82 54, 82 40 C82 24, 68 14, 52 12 Z"
          fill={palette.body}
        />
        <Path
          d="M48 32 C38 34, 30 46, 34 56 C46 62, 66 52, 70 36"
          fill={palette.wing}
          opacity={0.9}
        />
        <Path
          d="M80 44 C88 48, 102 48, 110 40 C104 38, 96 34, 88 36"
          fill={palette.wing}
        />
        <Path
          d="M78 30 C86 30, 94 26, 98 20 C90 18, 80 24, 78 28"
          fill={palette.beak}
        />
        <Circle cx={66} cy={32} r={4.2} fill={palette.eye} />
        <Circle cx={64.6} cy={31.2} r={1.2} fill="white" />
      </G>

      {variant === "storyteller" && (
        <Path
          d="M44 88 C40 96, 48 104, 62 106 C52 100, 54 96, 58 92"
          stroke={palette.accessory}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {variant === "express" && (
        <G>
          <Path
            d="M34 62 C24 64, 18 70, 20 78"
            stroke={palette.accessory}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M28 86 L20 94"
            stroke={palette.trail}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>
      )}

      {variant === "comet" && (
        <G>
          <Path
            d="M18 54 C8 56, 4 70, 16 80 C10 70, 18 66, 28 66"
            stroke={palette.accent}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
          <Rect x={74} y={54} width={18} height={8} rx={3} fill={palette.accessory} />
          <Rect x={74} y={54} width={6} height={8} rx={3} fill="#0F101F" opacity={0.4} />
          <Path d="M92 58 L100 56" stroke={palette.accent} strokeWidth={3} strokeLinecap="round" />
        </G>
      )}
    </Svg>
  );
});

interface PigeonGlyphProps {
  variant: PigeonVariantId;
  x: number;
  y: number;
  scale?: number;
}

export const PigeonGlyph = memo(function PigeonGlyph({ variant, x, y, scale = 1 }: PigeonGlyphProps) {
  const { palette } = useMemo(() => getPigeonVariantById(variant), [variant]);

  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Path
        d="M-10 -4 C-14 -8, -20 -6, -20 0 C-20 8, -10 12, 0 12 C8 12, 14 6, 14 0 C14 -8, 6 -12, -2 -12 Z"
        fill={palette.body}
      />
      <Path d="M2 -2 C-4 0, -6 6, -2 10 C6 8, 10 2, 12 -4" fill={palette.wing} />
      <Path d="M12 -2 C16 -4, 18 -6, 20 -10 C16 -10, 12 -6, 10 -4" fill={palette.beak} />
      <Circle cx={6} cy={-4} r={1.6} fill={palette.eye} />

      {variant === "express" && (
        <Path d="M-16 6 L-22 10" stroke={palette.trail} strokeWidth={1.5} strokeLinecap="round" />
      )}
      {variant === "comet" && (
        <G>
          <Rect x={3.5} y={-6.5} width={6} height={3} rx={1.2} fill={palette.accessory} />
          <Path
            d="M-24 -2 L-18 0 L-22 6"
            fill="none"
            stroke={palette.accent}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </G>
      )}
      {variant === "storyteller" && (
        <Path
          d="M-14 4 C-18 2, -22 4, -22 8"
          stroke={palette.accessory}
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </G>
  );
});
