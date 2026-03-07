import React from 'react';
import { Text, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface GradientTextProps {
  text: string;
  colors: readonly [string, string, ...string[]];
  style: TextStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export default function GradientText({
  text, colors, style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{text}</Text>}>
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
