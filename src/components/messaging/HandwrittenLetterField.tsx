import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { HANDWRITTEN_FONT } from '@/constants/fonts';
import { FeatherPen } from '@/components/messaging/FeatherPen';

type Ref = TextInput | null;

interface HandwrittenLetterFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  helperText?: string;
  lines?: number;
}

export const HandwrittenLetterField = forwardRef<Ref, HandwrittenLetterFieldProps>(
  ({ label, helperText, lines = 8, numberOfLines = 8, multiline = true, value, onChangeText, ...rest }, ref) => {
    const scribble = useRef(new Animated.Value(0)).current;
    const penOpacity = useRef(new Animated.Value(0)).current;
    const scribbleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousCount = useRef<number>((value as string | undefined)?.length ?? 0);

    const totalLines = useMemo(() => Math.max(lines, numberOfLines), [lines, numberOfLines]);
    const renderLines = useMemo(() => Array.from({ length: totalLines }), [totalLines]);
    const minHeight = useMemo(() => totalLines * 24 + 16, [totalLines]);

    const fadePenOut = useCallback(() => {
      penOpacity.stopAnimation();
      Animated.timing(penOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }, [penOpacity]);

    const triggerScribble = useCallback(() => {
      penOpacity.stopAnimation();
      Animated.timing(penOpacity, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }).start();

      scribble.stopAnimation();
      scribble.setValue(0);
      Animated.sequence([
        Animated.timing(scribble, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scribble, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      if (scribbleTimeout.current) {
        clearTimeout(scribbleTimeout.current);
      }
      scribbleTimeout.current = setTimeout(fadePenOut, 520);
    }, [fadePenOut, penOpacity, scribble]);

    useEffect(() => {
      const length = (value as string | undefined)?.length ?? 0;
      if (length > 0 && length !== previousCount.current) {
        triggerScribble();
      } else if (length === 0) {
        fadePenOut();
      }
      previousCount.current = length;
      return () => {
        if (scribbleTimeout.current) {
          clearTimeout(scribbleTimeout.current);
          scribbleTimeout.current = null;
        }
      };
    }, [fadePenOut, triggerScribble, value]);

    const handleChange = (text: string) => {
      onChangeText?.(text);
    };

    const penStyle: Animated.WithAnimatedValue<ViewStyle> = {
      opacity: penOpacity,
      transform: [
        {
          translateX: scribble.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8],
          }),
        },
        {
          translateY: scribble.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          }),
        },
        {
          rotate: scribble.interpolate({
            inputRange: [0, 1],
            outputRange: ['-6deg', '4deg'],
          }),
        },
      ],
    };

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.paper}>
          {renderLines.map((_, index) => (
            <View
              pointerEvents="none"
              key={index}
              style={[styles.paperLine, { top: 18 + index * 24 }]}
            />
          ))}
          <TextInput
            ref={ref}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical="top"
            value={value}
            onChangeText={handleChange}
            style={[styles.input, { minHeight }]}
            placeholderTextColor="#B7AD9F"
            {...rest}
          />
          <Animated.View pointerEvents="none" style={[styles.penContainer, penStyle]}>
            <FeatherPen height={56} />
          </Animated.View>
        </View>
        {!!helperText && <Text style={styles.helper}>{helperText}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#2C3D2F',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  paper: {
    position: 'relative',
    backgroundColor: '#FCF9F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4DED2',
    paddingHorizontal: 16,
    paddingVertical: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  paperLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(166, 155, 135, 0.25)',
  },
  input: {
    minHeight: 180,
    fontSize: 18,
    color: '#3B2F2F',
    fontFamily: HANDWRITTEN_FONT,
    lineHeight: 28,
    padding: 0,
  },
  penContainer: {
    position: 'absolute',
    bottom: 14,
    right: 16,
  },
  helper: {
    marginTop: 6,
    color: '#7D776B',
    fontSize: 12,
  },
});
