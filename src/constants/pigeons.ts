export type PigeonVariantId = "storyteller" | "express" | "comet";

export interface PigeonPalette {
  body: string;
  wing: string;
  beak: string;
  eye: string;
  accent: string;
  trail: string;
  accessory?: string;
  backgroundStart: string;
  backgroundEnd: string;
}

export interface PigeonVariant {
  id: PigeonVariantId;
  label: string;
  description: string;
  speed: number;
  palette: PigeonPalette;
}

export const PIGEON_VARIANTS: PigeonVariant[] = [
  {
    id: "storyteller",
    label: "Storyteller (gentle, scenic)",
    description: "Unhurried glides with time to admire the clouds.",
    speed: 40,
    palette: {
      body: "#90A8A4",
      wing: "#B9C9C3",
      beak: "#DFAF6D",
      eye: "#293132",
      accent: "#F0D8A8",
      trail: "#A5C9AA",
      accessory: "#6E8B82",
      backgroundStart: "#F5F1E4",
      backgroundEnd: "#E4F1ED",
    },
  },
  {
    id: "express",
    label: "Express (focused, swift)",
    description: "Confident tempo with upbeat wingbeats.",
    speed: 65,
    palette: {
      body: "#6F87C1",
      wing: "#8FA4E1",
      beak: "#FBB65F",
      eye: "#1F1E2C",
      accent: "#FFD6A0",
      trail: "#7EA8E7",
      accessory: "#EE845C",
      backgroundStart: "#EFF2FF",
      backgroundEnd: "#E2ECFE",
    },
  },
  {
    id: "comet",
    label: "Comet (urgent, relentless)",
    description: "Blazing fast with comet trails and racing shades.",
    speed: 90,
    palette: {
      body: "#4C5BD4",
      wing: "#6E82F2",
      beak: "#FFC857",
      eye: "#10111A",
      accent: "#FF9E3D",
      trail: "#FCB24C",
      accessory: "#1A1B2F",
      backgroundStart: "#EEF0FF",
      backgroundEnd: "#E7F4FF",
    },
  },
];

export const PIGEON_VARIANT_BY_ID = Object.fromEntries(PIGEON_VARIANTS.map((variant) => [variant.id, variant])) as Record<PigeonVariantId, PigeonVariant>;

export function getPigeonVariantById(id: PigeonVariantId): PigeonVariant {
  return PIGEON_VARIANT_BY_ID[id];
}

export function getPigeonVariantBySpeed(speed: number): PigeonVariant {
  const direct = PIGEON_VARIANTS.find((variant) => variant.speed === speed);
  if (direct) return direct;

  return PIGEON_VARIANTS.reduce((closest, variant) => {
    const currentDiff = Math.abs(variant.speed - speed);
    const bestDiff = Math.abs(closest.speed - speed);
    return currentDiff < bestDiff ? variant : closest;
  });
}
