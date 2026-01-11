import React, { useMemo } from 'react'; // 1. 导入 useMemo
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext';
import { useDreamJournalContext } from '../context/DreamJournalContext';
import StatisticsCard from './StatisticsCard';

const { width } = Dimensions.get('window');

const StatsOverview = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { sleepRecords, calculateSleepStats } = useSleepContext(); // 依赖 sleepRecords
  const { dreamEntries } = useDreamJournalContext();

  // 2. 使用 useMemo 缓存睡眠统计计算
  const sleepStats = useMemo(() => {
    console.log('Recalculating sleep stats...');
    return calculateSleepStats();
  }, [sleepRecords, calculateSleepStats]);

  // 3. 使用 useMemo 缓存梦境统计计算
  const dreamStats = useMemo(() => {
    console.log('Recalculating dream stats...');
    if (dreamEntries.length === 0) {
      return {
        totalDreamEntries: 0,
        averageMonthlyDreams: 0,
        dreamTypeDistribution: {},
        commonEmotions: {},
        analysisCount: 0
      };
    }

    const totalDreamEntries = dreamEntries.length;
    const now = new Date();
    const firstEntryDate = new Date(dreamEntries[dreamEntries.length - 1].createdAt);
    const monthsDiff = (now.getFullYear() - firstEntryDate.getFullYear()) * 12 + 
                      (now.getMonth() - firstEntryDate.getMonth()) + 1;
    const averageMonthlyDreams = totalDreamEntries / Math.max(monthsDiff, 1);

    const dreamTypeDistribution = dreamEntries.reduce((acc, entry) => {
      if (entry.dreamType) {
        acc[entry.dreamType] = (acc[entry.dreamType] || 0) + 1;
      }
      return acc;
    }, {});

    const commonEmotions = dreamEntries.reduce((acc, entry) => {
      if (entry.emotions && entry.emotions.length > 0) {
        entry.emotions.forEach(emotion => {
          acc[emotion] = (acc[emotion] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const analysisCount = dreamEntries.filter(entry => 
      entry.scientificReport && entry.scientificReport.length > 0
    ).length;

    return {
      totalDreamEntries,
      averageMonthlyDreams,
      dreamTypeDistribution,
      commonEmotions,
      analysisCount
    };
  }, [dreamEntries]);

  // ... (rest of the component remains the same)
  const calculateTrends = () => {
    const sleepTrend = { type: 'up', value: 12 };
    const dreamTrend = { type: 'stable', value: 5 };
    const analysisTrend = { type: 'up', value: 25 };
    return { sleepTrend, dreamTrend, analysisTrend };
  };

  const trends = calculateTrends();

  const generateSleepTrendData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push(Math.random() * 3 + 6);
    }
    return data;
  };

  const sleepCards = [
    { title: '总睡眠天数', value: sleepStats.totalSleepDays, icon: '🌙', gradientColors: ['#667eea', '#764ba2'], onPress: () => navigation?.navigate('Statistics', { tab: 'sleep' }), subtitle: '累计记录' },
    { title: '平均睡眠', value: sleepStats.averageSleepTime.toFixed(1), unit: '小时', icon: '⏰', gradientColors: ['#f093fb', '#f5576c'], onPress: () => navigation?.navigate('Statistics', { tab: 'sleep' }), subtitle: '每日平均', trend: trends.sleepTrend, showChart: true, chartData: generateSleepTrendData() },
    { title: '本周平均', value: sleepStats.thisWeekAverage.toFixed(1), unit: '小时', icon: '📊', gradientColors: ['#4facfe', '#00f2fe'], onPress: () => navigation?.navigate('Statistics', { tab: 'sleep' }), subtitle: '最近7天', showChart: true, chartData: generateSleepTrendData() },
    { title: '连续睡眠', value: sleepStats.bestStreak, unit: '天', icon: '🔥', gradientColors: ['#fa709a', '#fee140'], onPress: () => navigation?.navigate('Statistics', { tab: 'sleep' }), subtitle: '最佳记录' }
  ];

  const generateDreamTrendData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push(Math.random() * 5 + 2);
    }
    return data;
  };

  const dreamCards = [
    { title: '梦境记录', value: dreamStats.totalDreamEntries, icon: '💭', gradientColors: ['#a8edea', '#fed6e3'], onPress: () => navigation?.navigate('DreamJournal'), subtitle: '总记录数', trend: trends.dreamTrend },
    { title: '月均梦境', value: dreamStats.averageMonthlyDreams.toFixed(1), icon: '📅', gradientColors: ['#ffecd2', '#fcb69f'], onPress: () => navigation?.navigate('Statistics', { tab: 'dreams' }), subtitle: '每月平均', showChart: true, chartData: generateDreamTrendData() },
    { title: '分析次数', value: dreamStats.analysisCount, icon: '🔬', gradientColors: ['#ff9a9e', '#fecfef'], onPress: () => navigation?.navigate('Statistics', { tab: 'dreams' }), subtitle: 'AI科学分析', trend: trends.analysisTrend },
    { title: '梦境类型', value: Object.keys(dreamStats.dreamTypeDistribution).length, icon: '🎭', gradientColors: ['#fbc2eb', '#a6c1ee'], onPress: () => navigation?.navigate('Statistics', { tab: 'dreams' }), subtitle: '类型多样性' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>睡眠统计</Text>
        <View style={styles.cardGrid}>
          {sleepCards.map((card, index) => (
            <StatisticsCard key={`sleep-${index}`} {...card} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>梦境日志</Text>
        <View style={styles.cardGrid}>
          {dreamCards.map((card, index) => (
            <StatisticsCard key={`dream-${index}`} {...card} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, paddingHorizontal: 4 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default StatsOverview;