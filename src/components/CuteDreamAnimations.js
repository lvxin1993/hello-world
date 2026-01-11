import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

/**
 * 一个纯粹的、用于展示动画和描述的组件。
 * 它不关心具体的动画内容，只负责渲染传入的 source 和 description。
 */
const CuteDreamAnimations = ({ isVisible, source, description }) => {
  const { theme } = useThemeContext();

  if (!isVisible || !source) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image 
        source={source} 
        style={styles.animation}
        resizeMode="contain"
      />
      {description && (
        <Text style={[styles.description, { color: theme.textSecondary || '#666' }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CuteDreamAnimations;