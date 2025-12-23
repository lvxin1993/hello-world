import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const MiniChart = ({ 
  data = [], 
  color = '#667eea', 
  height = 60, 
  width = screenWidth * 0.4,
  showPoints = true,
  strokeWidth = 2,
  fillColor = 'rgba(102, 126, 234, 0.1)'
}) => {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.container, { height, width }]}>
        <View style={[styles.placeholder, { backgroundColor: fillColor }]}>
          <View style={styles.placeholderLine} />
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 20) + 10;
    const y = height - ((value - minValue) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  // 创建填充区域路径
  const fillPath = `${pathData} L ${width - 10},${height - 10} L 10,${height - 10} Z`;

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg height={height} width={width}>
        {/* 填充区域 */}
        <Path
          d={fillPath}
          fill={fillColor}
        />
        {/* 线条 */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 数据点 */}
        {showPoints && points.map((point, index) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={3}
              fill={color}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLine: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1,
  },
});

export default MiniChart;
