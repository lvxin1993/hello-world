import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import MiniChart from './MiniChart';

const { width } = Dimensions.get('window');

const StatisticsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradientColors, 
  onPress,
  style,
  trend = null,
  unit = '',
  chartData = null,
  showChart = false
}) => {
  const { theme } = useThemeContext();

  const renderTrend = () => {
    if (!trend) return null;
    
    return (
      <View style={styles.trendContainer}>
        <Text style={[
          styles.trendText, 
          { 
            color: trend.type === 'up' ? '#4CAF50' : 
                   trend.type === 'down' ? '#FF6B6B' : '#FFA726'
          }
        ]}>
          {trend.type === 'up' ? '↑' : trend.type === 'down' ? '↓' : '→'} 
          {' '}{trend.value}%
        </Text>
      </View>
    );
  };

  const renderMiniChart = () => {
    if (!showChart || !chartData) return null;
    
    return (
      <View style={styles.chartContainer}>
        <MiniChart 
          data={chartData} 
          color="rgba(255, 255, 255, 0.8)"
          fillColor="rgba(255, 255, 255, 0.2)"
          height={40}
          strokeWidth={1.5}
          showPoints={false}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient 
        colors={gradientColors} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>{icon}</Text>
            {renderTrend()}
          </View>
          <Text style={styles.value}>{value}{unit}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {renderMiniChart()}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 40) / 2 - 8,
    height: 140,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginVertical: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  trendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    height: 40,
    marginTop: 8,
  },
});

export default StatisticsCard;
