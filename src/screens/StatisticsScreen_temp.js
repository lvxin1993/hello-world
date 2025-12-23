import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext';
import { useDreamJournalContext } from '../context/DreamJournalContext';
import StatisticsCard from '../components/StatisticsCard';
import StatsOverview from '../components/StatsOverview';

const StatisticsScreen = ({ route }) => {
  const { theme } = useThemeContext();
  const [activeTab, setActiveTab] = useState('overview');
  
  // 如果从路由参数传入tab，则切换到对应tab
  React.useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'overview' && [styles.activeTab, { backgroundColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'overview' ? '#fff' : theme.text }
        ]}>
          总览
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'sleep' && [styles.activeTab, { backgroundColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('sleep')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'sleep' ? '#fff' : theme.text }
        ]}>
          睡眠
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'dreams' && [styles.activeTab, { backgroundColor: theme.primary }]
        ]}
        onPress={() => setActiveTab('dreams')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'dreams' ? '#fff' : theme.text }
        ]}>
          梦境
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleBackToHome = () => {
    route?.params?.navigation?.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 返回主页按钮 */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: theme.card }]} 
        onPress={handleBackToHome}
      >
        <Ionicons name="home-outline" size={24} color={theme.text} />
        <Text style={[styles.backButtonText, { color: theme.text }]}>返回主页</Text>
      </TouchableOpacity>
      
      {renderTabButtons()}
      {activeTab === 'overview' && <StatsOverview navigation={route?.params?.navigation} />}
      {activeTab === 'sleep' && <SleepDetails />}
      {activeTab === 'dreams' && <DreamDetails />}
    </View>
  );
};

// 睡眠详细统计组件
const SleepDetails = () => {
  const { theme } = useThemeContext();
  const { calculateSleepStats } = useSleepContext();
  const sleepStats = calculateSleepStats();

  const sleepCards = [
    {
      title: '总睡眠天数',
      value: sleepStats.totalSleepDays,
      icon: '🌙',
      gradientColors: ['#667eea', '#764ba2'],
      subtitle: '累计记录'
    },
    {
      title: '平均睡眠',
      value: sleepStats.averageSleepTime.toFixed(1),
      unit: '小时',
      icon: '⏰',
      gradientColors: ['#f093fb', '#f5576c'],
      subtitle: '每日平均'
    },
    {
      title: '本周平均',
      value: sleepStats.thisWeekAverage.toFixed(1),
      unit: '小时',
      icon: '📊',
      gradientColors: ['#4facfe', '#00f2fe'],
      subtitle: '最近7天'
    },
    {
      title: '连续睡眠',
      value: sleepStats.bestStreak,
      unit: '天',
      icon: '🔥',
      gradientColors: ['#fa709a', '#fee140'],
      subtitle: '最佳记录'
    },
    {
      title: '深度睡眠',
      value: sleepStats.deepSleepPercentage,
      icon: '😴',
      gradientColors: ['#a8edea', '#fed6e3'],
      subtitle: '睡眠质量'
    }
  ];

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.cardGrid}>
        {sleepCards.map((card, index) => (
          <StatisticsCard key={`sleep-${index}`} {...card} />
        ))}
      </View>
      
      <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>睡眠趋势分析</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: theme.textSecondary }}>📈 睡眠时长趋势图</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// 梦境详细统计组件
const DreamDetails = () => {
  const { theme } = useThemeContext();
  const { dreamEntries } = useDreamJournalContext();

  // 计算梦境统计数据
  const calculateDreamStats = () => {
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
  };

  const dreamStats = calculateDreamStats();

  const dreamCards = [
    {
      title: '梦境记录',
      value: dreamStats.totalDreamEntries,
      icon: '💭',
      gradientColors: ['#a8edea', '#fed6e3'],
      subtitle: '总记录数'
    },
    {
      title: '月均梦境',
      value: dreamStats.averageMonthlyDreams.toFixed(1),
      icon: '📅',
      gradientColors: ['#ffecd2', '#fcb69f'],
      subtitle: '每月平均'
    },
    {
      title: '分析次数',
      value: dreamStats.analysisCount,
      icon: '🔬',
      gradientColors: ['#ff9a9e', '#fecfef'],
      subtitle: 'AI科学分析'
    },
    {
      title: '梦境类型',
      value: Object.keys(dreamStats.dreamTypeDistribution).length,
      icon: '🎭',
      gradientColors: ['#fbc2eb', '#a6c1ee'],
      subtitle: '类型多样性'
    },
    {
      title: '情绪种类',
      value: Object.keys(dreamStats.commonEmotions).length,
      icon: '😊',
      gradientColors: ['#fdcbf1', '#e6dee9'],
      subtitle: '情感丰富度'
    }
  ];

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.cardGrid}>
        {dreamCards.map((card, index) => (
          <StatisticsCard key={`dream-${index}`} {...card} />
        ))}
      </View>
      
      {/* 梦境类型分布 */}
      {Object.keys(dreamStats.dreamTypeDistribution).length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.card, marginTop: 20 }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>梦境类型分布</Text>
          <View style={styles.dreamTypeContainer}>
            {Object.entries(dreamStats.dreamTypeDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
              <View key={type} style={styles.dreamTypeItem}>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{type}</Text>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* 情绪分布 */}
      {Object.keys(dreamStats.commonEmotions).length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.card, marginTop: 20 }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>常见情绪分布</Text>
          <View style={styles.dreamTypeContainer}>
            {Object.entries(dreamStats.commonEmotions)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5) // 只显示前5个最常见的情绪
              .map(([emotion, count]) => (
              <View key={emotion} style={styles.dreamTypeItem}>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{emotion}</Text>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    marginBottom: 20,
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
  dreamTypeContainer: {
    gap: 12,
  },
  dreamTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
});

export default StatisticsScreen;
