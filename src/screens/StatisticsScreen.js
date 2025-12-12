import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const StatisticsScreen = () => {
  const { theme } = useThemeContext();

  // 模拟睡眠统计数据
  const stats = {
    totalSleepDays: 45,
    averageSleepTime: '7.2小时',
    bestStreak: 12,
    thisWeekAverage: '6.8小时',
    deepSleepPercentage: '45%',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>睡眠统计</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalSleepDays}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>总睡眠天数</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.averageSleepTime}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>平均睡眠时间</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.bestStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>最佳连续睡眠</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.thisWeekAverage}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>本周平均</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.deepSleepPercentage}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>深度睡眠比例</Text>
        </View>
      </View>
      
      <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>最近7天睡眠趋势</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: theme.textSecondary }}>📊 睡眠趋势图表</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  chartContainer: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
});

export default StatisticsScreen;
