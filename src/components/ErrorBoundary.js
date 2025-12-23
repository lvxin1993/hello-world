import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Updates from 'expo-updates';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以便下一次渲染可以显示降级后的 UI
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    // 尝试重新加载应用
    Updates.reloadAsync();
  };

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <View style={styles.container}>
          <Text style={styles.title}>哎呀，出错了！</Text>
          <Text style={styles.subtitle}>应用遇到了一些小问题，请尝试刷新。</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
          </View>
          <Button title="刷新应用" onPress={this.handleReload} color="#1e90ff" />
        </View>
      );
    }

    return this.props.children; 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d9534f',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
      width: '100%',
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#e9ecef',
      marginBottom: 20,
  },
  errorText: {
    color: '#495057',
    fontSize: 12,
  }
});

export default ErrorBoundary;
