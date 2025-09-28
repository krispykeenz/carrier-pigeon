import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text } from 'react-native';
import type { PigeonVariantId } from '@/constants/pigeons';
import { PigeonIllustration } from '@/components/pigeon/PigeonIllustration';

interface PigeonDepartureAnimationProps {
  variant: PigeonVariantId;
  pigeonName: string;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PigeonDepartureAnimation({ variant, pigeonName, onComplete }: PigeonDepartureAnimationProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    overlayOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        onComplete();
        return;
      }

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 260,
        delay: 120,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    });
  }, [onComplete, overlayOpacity, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, SCREEN_WIDTH * 0.75],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [60, -220],
  });

  const trailTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_WIDTH * 0.7],
  });

  const trailTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [40, -200],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '10deg'],
  });

  const trailScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 1.2],
  });

  const trailOpacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.2, 0.6, 0],
  });

  const messageOpacity = progress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayOpacity }]}> 
      <Animated.View
        style={[
          styles.trail,
          {
            opacity: trailOpacity,
            transform: [
              { translateX: trailTranslateX },
              { translateY: trailTranslateY },
              { scaleX: trailScale },
              { scaleY: trailScale },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.pigeon,
          {
            transform: [{ translateX }, { translateY }, { rotate }],
          },
        ]}
      >
        <PigeonIllustration variant={variant} size={120} />
      </Animated.View>

      <Animated.View style={[styles.captionContainer, { opacity: messageOpacity }]}> 
        <Text style={styles.caption}>Safe travels, {pigeonName}!</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 20,
    justifyContent: 'flex-start',
  },
  pigeon: {
    position: 'absolute',
    bottom: 48,
    left: -40,
  },
  trail: {
    position: 'absolute',
    bottom: 54,
    left: -60,
    width: 180,
    height: 60,
    borderRadius: 60,
    backgroundColor: 'rgba(122, 168, 199, 0.25)',
    transform: [{ skewX: '-12deg' }],
  },
  captionContainer: {
    position: 'absolute',
    bottom: 32,
    right: 28,
    backgroundColor: 'rgba(252, 249, 242, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3D2F',
  },
});
