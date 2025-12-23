import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Text, StyleSheet, Animated, Pressable, View, Platform } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';

// ... CardContent and CardBackContent remain the same ...
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


// 1. 使用 forwardRef 包裹组件定义
const MenuCard = forwardRef(({ item, onPress, style, scrollX, index }, ref) => {
  const { theme } = useThemeContext();

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressAnimation = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(pressAnimation, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressAnimation, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();

  const handlePress = () => {
    Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onPress();
      flipAnimation.setValue(0);
    });
  };

  // 2. 使用 useImperativeHandle 暴露 handlePress 方法
  useImperativeHandle(ref, () => ({
    handlePress
  }));

  const frontInterpolate = flipAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnimation.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  const inputRange = [(index - 1) * 330, index * 330, (index + 1) * 330];
  const isWeb = Platform.OS === 'web';

  const centerScale = !isWeb && scrollX ? scrollX.interpolate({ inputRange, outputRange: [0.85, 1.1, 0.85], extrapolate: 'clamp' }) : 1;
  const translateY = !isWeb && scrollX ? scrollX.interpolate({ inputRange, outputRange: [40, 0, 40], extrapolate: 'clamp' }) : 0;
  const opacity = scrollX ? scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' }) : 1;

  const combinedScale = isWeb ? pressAnimation : Animated.multiply(centerScale, pressAnimation);

  const tint = theme.mode === 'dark' ? 'dark' : 'light';

  return (
    <Animated.View style={{
        opacity: opacity,
        transform: [{ scale: combinedScale }, { translateY: isWeb ? 0 : translateY }],
        width: '100%',
        height: '100%',
    }}>
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut} style={{flex: 1}}>
        <View style={[styles.menuItem, style]}>
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
  menuItem: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  blurContainer: { ...StyleSheet.absoluteFillObject },
  cardSide: { flex: 1, width: '100%', height: '100%', borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 20 },
  animatedCardSide: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' },
  cardBack: {},
  icon: { fontSize: 45, marginBottom: 15 },
  menuItemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  menuItemDescription: { fontSize: 14, textAlign: 'center', lineHeight: 18 },
});

export default MenuCard;
