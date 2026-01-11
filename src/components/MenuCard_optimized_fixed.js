import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Text, StyleSheet, Animated, Pressable, View, Platform } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';

// CardContent和CardBackContent保持不变
const CardContent = ({ item, theme }) => (
  <>
    <Text style={styles.icon}>{item.icon}</Text>
    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
    <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
  </>
);
const CardBackContent = ({ item, theme }) => (
    <>
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={[styles.menuItemTitle, { color: theme.text }]}>即将前往...</Text>
    </>
);

// 使用forwardRef包裹组件定义 - 优化版本
const MenuCard = forwardRef(({ item, onPress, style, scrollX, index, isSelected }, ref) => {
  const { theme } = useThemeContext();

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressAnimation = useRef(new Animated.Value(1)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;

  // 优化按压动画效果
  const onPressIn = () => Animated.spring(pressAnimation, { 
    toValue: 0.93, // 增加按压深度
    tension: 150, // 增加弹性
    friction: 12,
    useNativeDriver: true 
  }).start();
  
  const onPressOut = () => Animated.spring(pressAnimation, { 
    toValue: 1, 
    friction: 10, 
    tension: 120, 
    useNativeDriver: true 
  }).start();

  // 选中状态动画 - 新增
  useEffect(() => {
    Animated.spring(selectionAnimation, {
      toValue: isSelected ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 400, // 加快翻转速度
        useNativeDriver: true,
      }),
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      onPress();
    });
  };

  // 使用useImperativeHandle暴露handlePress方法
  useImperativeHandle(ref, () => ({
    handlePress
  }));

  // 翻转动画插值
  const frontInterpolate = flipAnimation.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '180deg'] 
  });
  const backInterpolate = flipAnimation.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['180deg', '360deg'] 
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  // 输入范围和插值器优化
  const inputRange = [(index - 1) * 330, index * 330, (index + 1) * 330];
  const isWeb = Platform.OS === 'web';

  // 优化缩放和动画效果
  const centerScale = !isWeb && scrollX ? scrollX.interpolate({ 
    inputRange, 
    outputRange: [0.85, 1.15, 0.85], // 增加最大缩放
    extrapolate: 'clamp' 
  }) : 1;
  
  const translateY = !isWeb && scrollX ? scrollX.interpolate({ 
    inputRange, 
    outputRange: [30, 0, 30], // 增加移动距离
    extrapolate: 'clamp' 
  }) : 0;
  
  const opacity = scrollX ? scrollX.interpolate({ 
    inputRange, 
    outputRange: [0.6, 1, 0.6], 
    extrapolate: 'clamp' 
  }) : 1;

  // 选中状态的额外效果
  const selectionScale = selectionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05] // 选中时轻微放大
  });

  const selectionOpacity = selectionAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1] // 选中时提高透明度
  });

  const combinedScale = isWeb ? pressAnimation : Animated.multiply(
    Animated.multiply(centerScale, pressAnimation), 
    selectionScale
  );

  const tint = theme.mode === 'dark' ? 'dark' : 'light';

  return (
    <Animated.View style={{
        opacity: Animated.multiply(opacity, selectionOpacity),
        transform: [{ 
          scale: combinedScale
        }, { 
          translateY: isWeb ? 0 : translateY 
        }],
        width: '100%',
        height: '100%',
    }}>
      <Pressable 
        onPress={handlePress} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        style={{flex: 1}}
      >
        <View style={[
          styles.menuItem, 
          style,
          // 选中状态的边框效果
          isSelected && {
            borderWidth: 2,
            borderColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }
        ]}>
            <BlurView intensity={90} tint={tint} style={styles.blurContainer} />
            
            <Animated.View style={[styles.animatedCardSide, frontAnimatedStyle]}>
                <CardContent item={item} theme={theme} />
            </Animated.View>
            
            <Animated.View style={[styles.animatedCardSide, styles.cardBack, backAnimatedStyle]}>
                <CardBackContent item={item} theme={theme} />
            </Animated.View>
            
            {/* 选中状态指示器 - 新增 */}
            {isSelected && (
              <View style={[
                styles.selectionGlow,
                { backgroundColor: theme.primary }
              ]} />
            )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  menuItem: { 
    flex: 1, 
    borderRadius: 24, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  blurContainer: { ...StyleSheet.absoluteFillObject },
  cardSide: { 
    flex: 1, 
    width: '100%', 
    height: '100%', 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  animatedCardSide: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backfaceVisibility: 'hidden' 
  },
  cardBack: {},
  icon: { fontSize: 45, marginBottom: 15 },
  menuItemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  menuItemDescription: { fontSize: 14, textAlign: 'center', lineHeight: 18 },
  // 新增选中状态样式
  selectionGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    opacity: 0.2,
    zIndex: -1,
  },
});

export default MenuCard;
