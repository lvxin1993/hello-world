import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TestApp() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>SleepWell 测试应用</Text>
        <Text style={styles.subtitle}>应用已成功启动！</Text>
        <Text style={styles.content}>这是一个简化版的测试界面，用于验证应用的基本渲染功能。</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});