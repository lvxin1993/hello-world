import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Text, StyleSheet, Animated, Pressable, View, Platform } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// ... CardContent and CardBackContent remain the same ...
const CardContent = ({ item, theme }) => (
  <>
    <View style={styles.iconContainer}>
      {typeof item.icon === 'string' && item.icon.includes && (item.icon.includes('-') || item.icon === 'logo-github') ? (
         <Ionicons name={item.icon} size={40} color={theme.text} />
      ) : (
         <Text style={styles.icon}>{item.icon}</Text>
      )}
    </View>
    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
    <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
  </>
);
const CardBackContent = ({ item, theme }) => (
    <>
        <View style={styles.iconContainer}>
           <Ionicons name="arrow-forward-circle-outline" size={40} color={theme.text} />
        </View>
        <Text style={[styles.menuItemTitle, { color: theme.text }]}>即将前往...</Text>
    </>
);


// 1. 使用 forwardRef 包裹组件定义
const MenuCard = forwardRef(({ item, onPress, style, scrollX, index, cardWidth = 330, isSelected }, ref) => {
  const { theme } = useThemeContext();

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressAnimation = useRef(new Animated.Value(1)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;

  // 优化按压动画效果
  const onPressIn = () => Animated.spring(pressAnimation, { 
    toValue: 0.93, 
    tension: 150, 
    friction: 12,
    useNativeDriver: true 
  }).start();
  
  const onPressOut = () => Animated.spring(pressAnimation, { 
    toValue: 1, 
    friction: 10, 
    tension: 120, 
    useNativeDriver: true 
  }).start();

  // 选中状态动画
  React.useEffect(() => {
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
        duration: 400,
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

  useImperativeHandle(ref, () => ({
    handlePress
  }));

  const frontInterpolate = flipAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnimation.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  // 动态计算 input range
  const inputRange = [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth];
  const isWeb = Platform.OS === 'web';

  // 增强缩放效果 - 移除 Web 限制并调整缩放比例
  const centerScale = scrollX ? scrollX.interpolate({ 
    inputRange, 
    outputRange: [0.8, 1.1, 0.8], // 减小最大缩放比例，防止卡片过大
    extrapolate: 'clamp' 
  }) : 1;
  
  const translateY = scrollX ? scrollX.interpolate({ 
    inputRange, 
    outputRange: [20, 0, 20], 
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
    outputRange: [1, 1.05]
  });

  const combinedScale = isWeb ? Animated.multiply(centerScale, pressAnimation) : Animated.multiply(
    Animated.multiply(centerScale, pressAnimation),
    selectionScale
  );

  const tint = theme.mode === 'dark' ? 'dark' : 'light';

  return (
    <Animated.View style={{
        opacity: opacity,
        transform: [{ scale: combinedScale }, { translateY: translateY }],
        width: '100%',
        height: '100%',
        zIndex: isSelected ? 10 : 1 // 确保选中项在最上层
    }}>
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={{flex: 1}}>
        <View style={[
          styles.menuItem, 
          style,
          isSelected && {
            borderWidth: 2,
            borderColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          }
        ]}>
            <BlurView intensity={90} tint={tint} style={styles.blurContainer} />
            <Animated.View style={[styles.animatedCardSide, frontAnimatedStyle]}>
                <CardContent item={item} theme={theme} />
            </Animated.View>
            <Animated.View style={[styles.animatedCardSide, styles.cardBack, backAnimatedStyle]}>
                <CardBackContent item={item} theme={theme} />
            </Animated.View>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    })
  },
  blurContainer: { ...StyleSheet.absoluteFillObject },
  cardSide: { flex: 1, width: '100%', height: '100%', borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 20 },
  animatedCardSide: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 20 },
  cardBack: {},
  iconContainer: { marginBottom: 15, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40 },
  menuItemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  menuItemDescription: { fontSize: 13, textAlign: 'center', lineHeight: 18, opacity: 0.8 },
});

export default MenuCard;
