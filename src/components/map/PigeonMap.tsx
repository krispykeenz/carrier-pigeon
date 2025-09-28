import Svg, { Circle, Line } from "react-native-svg";
import { Image, StyleSheet, Text, View } from "react-native";
import type { ResolvedLocation } from "@/types/location";
import { getPigeonVariantBySpeed } from "@/constants/pigeons";
import { PigeonGlyph } from "@/components/pigeon/PigeonIllustration";

interface Props {
  sender: ResolvedLocation;
  recipient: ResolvedLocation;
  progress: number;
  pigeonName?: string | null;
  pigeonSpeedKmh: number;
}

const MAP_WIDTH = 6040;
const MAP_HEIGHT = 3643;
const worldMap = require("@/img/4925.jpg");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function projectLatLon(latitude: number, longitude: number, width: number, height: number) {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return {
    x: clamp(x, 0, width),
    y: clamp(y, 0, height),
  };
}

function projectPoint(location: ResolvedLocation, width: number, height: number) {
  return projectLatLon(location.latitude, location.longitude, width, height);
}

export function PigeonMap({ sender, recipient, progress, pigeonName, pigeonSpeedKmh }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const start = projectPoint(sender, MAP_WIDTH, MAP_HEIGHT);
  const end = projectPoint(recipient, MAP_WIDTH, MAP_HEIGHT);

  const pigeonX = start.x + (end.x - start.x) * clamped;
  const pigeonY = start.y + (end.y - start.y) * clamped;

  const variant = getPigeonVariantBySpeed(pigeonSpeedKmh);

  return (
    <View style={styles.container}>
      <Image source={worldMap} style={styles.mapImage} resizeMode="cover" />
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
        <Line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={variant.palette.trail}
          strokeWidth={2}
          strokeDasharray="6 6"
        />

        <Circle cx={start.x} cy={start.y} r={5} fill="#2C6E49" />
        <Circle cx={end.x} cy={end.y} r={5} fill="#C05746" />

        <PigeonGlyph variant={variant.id} x={pigeonX} y={pigeonY} scale={0.75} />
      </Svg>
      <View style={styles.captionRow}>
        <Text style={styles.captionLabel}>{sender.label}</Text>
        <Text style={styles.captionDivider}>-&gt;</Text>
        <Text style={styles.captionLabel}>{recipient.label}</Text>
      </View>
      {pigeonName && <Text style={styles.pigeonTag}>Currently in flight: {pigeonName}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: MAP_WIDTH / MAP_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E9F2F7",
    marginTop: 16,
    marginBottom: 12,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  captionRow: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  captionLabel: {
    fontWeight: "600",
    color: "#1F2A30",
    fontSize: 12,
  },
  captionDivider: {
    color: "#6D7B73",
    fontSize: 12,
  },
  pigeonTag: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(44, 62, 47, 0.85)",
    color: "#F8F6F0",
    fontWeight: "600",
  },
});
