import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const GrabModeView = ({ data, onCardPress }) => {
  const { theme } = useThemeContext();

  // 未来实现抓取模式的占位符
  return (
    <View style={styles.container}>
      <Text style={[styles.placeholderText, { color: theme.text }]}>
        抓取模式正在开发中...
      </Text>
      <Text style={[styles.placeholderSubText, { color: theme.text }]}>
        敬请期待一个有趣的交互体验！
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderSubText: {
    fontSize: 16,
    opacity: 0.7,
  },
});

export default GrabModeView;