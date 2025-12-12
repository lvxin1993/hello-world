import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const CommunityScreen = () => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>社区运动</Text>
      <View style={[styles.content, { backgroundColor: theme.card }]}>
        <Text style={[styles.description, { color: theme.text }]}>社区功能开发中...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default CommunityScreen;
