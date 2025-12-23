import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// 计算卡片大小，确保屏幕内有4个卡片
const SPACING = 8;
const CARD_WIDTH = (width - 32 - SPACING * 5) / 4;
const CARD_HEIGHT = 150;
const MAX_ROTATION = 15;
const MAX_TRANSLATE = 8;

const DreamEntryCard = ({ item, onDetail, onAnalyze, onDelete, index }) => {
  const { theme } = useThemeContext();
  // 固定卡片尺寸，确保屏幕内有4个卡片
  const cardDimensions = { width: CARD_WIDTH, height: CARD_HEIGHT };

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // 重力效果动画值
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const gravityX = useRef(new Animated.Value(0)).current;
  const gravityY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 100, useNativeDriver: true }).start();
  }, [fadeAnim, slideAnim, index]);

  // 重置动画值
  const resetTransform = () => {
    Animated.parallel([
      Animated.spring(rotateX, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(rotateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(gravityX, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(gravityY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  // 计算重力效果
  const calculateGravity = (x, y) => {
    // 计算触摸点相对于卡片中心的位置（-1 到 1 范围）
    const { width, height } = cardDimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 归一化坐标到 [-1, 1] 范围
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;
    
    // 计算旋转角度
    const rotationX = normalizedY * MAX_ROTATION;
    const rotationY = -normalizedX * MAX_ROTATION;
    
    // 计算位移
    const gravityXVal = normalizedX * MAX_TRANSLATE;
    const gravityYVal = normalizedY * MAX_TRANSLATE;
    
    // 应用变换
    Animated.parallel([
      Animated.timing(rotateX, { toValue: rotationX, duration: 100, useNativeDriver: true }),
      Animated.timing(rotateY, { toValue: rotationY, duration: 100, useNativeDriver: true }),
      Animated.timing(gravityX, { toValue: gravityXVal, duration: 100, useNativeDriver: true }),
      Animated.timing(gravityY, { toValue: gravityYVal, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // 创建 PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        calculateGravity(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        calculateGravity(locationX, locationY);
      },
      onPanResponderRelease: resetTransform,
      onPanResponderTerminate: resetTransform,
    })
  ).current;

  // 旋转模式：根据索引添加旋转效果
  const getRotation = () => {
    // 让卡片在水平排列时产生不同的旋转角度
    const rotationOffset = (index % 4) * 5 - 7.5;
    return rotateY.interpolate({ 
      inputRange: [-10, 10], 
      outputRange: [`${rotationOffset - 10}deg`, `${rotationOffset + 10}deg`] 
    });
  };

  return (
    <Animated.View 
      style={[
        styles.entryCard, 
        {
          backgroundColor: theme.card,
          opacity: fadeAnim, 
          transform: [
            { translateX: gravityX },
            { translateY: slideAnim.interpolate({ 
                inputRange: [0, 1], 
                outputRange: [20, 0] 
              }) },
            { rotateX: rotateX.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] }) },
            { rotateY: getRotation() },
            { translateY: gravityY }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={onDetail} activeOpacity={0.7}>
        <Text style={[styles.entryTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.entryDate, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={[styles.entryContent, { color: theme.textSecondary }]} numberOfLines={3}>{item.content}</Text>
      </TouchableOpacity>
      
      {/* 终极修复：使用 flex 均分空间 */}
      <View style={styles.entryActions}>
        <TouchableOpacity style={styles.actionButtonContainer} onPress={onDetail}>
            <Ionicons name="eye-outline" size={18} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.primary, marginLeft: 5 }]}>查看</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonContainer} onPress={onAnalyze}>
            <Ionicons name="sparkles-outline" size={18} color={theme.secondary} />
            <Text style={[styles.actionButtonText, { color: theme.secondary, marginLeft: 5 }]}>分析</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonContainer} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color={theme.error} />
            <Text style={[styles.actionButtonText, { color: theme.error, marginLeft: 5 }]}>删除</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  entryCard: {
    borderRadius: 12,
    padding: 12,
    marginRight: SPACING,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  entryTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  entryDate: { fontSize: 10, marginBottom: 6 },
  entryContent: { fontSize: 12, lineHeight: 16 },
  entryActions: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', // 确保两端对齐
      borderTopWidth: 1, 
      borderTopColor: '#e0e0e020', 
      marginTop: 8, 
      paddingTop: 8,
    },
  actionButtonContainer: { 
      flex: 1, // 关键：让每个按钮容器均分空间
      flexDirection: 'row', 
      justifyContent: 'center', // 内部居中
      alignItems: 'center' 
    },
  actionButtonText: { fontSize: 12, fontWeight: '500' },
});

export default DreamEntryCard;
