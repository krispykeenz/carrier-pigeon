import { View, StyleSheet, ViewStyle, type DimensionValue } from "react-native";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPercent = `${clamped * 100}%` as DimensionValue;
  const dynamicStyle: ViewStyle = { width: widthPercent };

  return (
    <View style={styles.track}>
      <View style={[styles.fill, dynamicStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#E4E7DC",
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2C6E49",
  },
});
