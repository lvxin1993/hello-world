import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import StatsOverview from '../components/StatsOverview';

const StatisticsScreen = ({ navigation }) => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. 添加自定义 Header */}
      <View style={[styles.header, { borderBottomColor: theme.border + '50'}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>统计数据</Text>
        <View style={styles.headerButton} />{/* 占位符，保持标题居中 */}
      </View>

      {/* 2. 渲染 StatsOverview 组件 */}
      <StatsOverview navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, 
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  headerButton: { 
      padding: 5, 
      minWidth: 30 
    },
});

export default StatisticsScreen;
