import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, AppState, Animated, PanResponder, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import MenuCard from './MenuCard';

const RotatingModeView = ({ menuItems, theme, navigation, rotationDirection, toggleRotationDirection }) => {
    const screenWidth = Dimensions.get('window').width;
    const [isInteracting, setIsInteracting] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState(0.7);

    const cardWidth = 330;
    const scrollViewPadding = (screenWidth - cardWidth) / 2;
    
    const scrollViewRef = useRef(null);
    const animationFrameRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollPositionRef = useRef(0);
    const menuCardRefs = useRef({});

    // 自动旋转动画
    useEffect(() => {
        if (isInteracting || menuItems.length === 0) return;
        const blockWidth = menuItems.length * cardWidth;
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(() => {
                if (!isInteracting) {
                    const direction = rotationDirection === 'clockwise' ? 1 : -1;
                    let newX = scrollPositionRef.current + direction * rotationSpeed;
                    if (direction === 1 && newX >= blockWidth * 2) { newX -= blockWidth; }
                    else if (direction === -1 && newX <= blockWidth) { newX += blockWidth; }
                    scrollViewRef.current?.scrollTo({ x: newX, animated: false });
                }
                animate();
            });
        };
        const timeoutId = setTimeout(animate, 2000); // 停止交互2秒后恢复自动旋转
        return () => {
             clearTimeout(timeoutId);
             if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isInteracting, rotationDirection, menuItems, rotationSpeed]);

    // 初始定位 & AppState 监听
    useEffect(() => { /* ... (remains the same) ... */ }, [menuItems]);

    // 1. 重构 PanResponder
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                setIsInteracting(true); // 开始交互，停止自动旋转
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            },
            onPanResponderMove: (evt, gestureState) => {
                 scrollViewRef.current?.scrollTo({ x: scrollPositionRef.current - gestureState.dx, animated: false });
            },
            onPanResponderRelease: (evt, gestureState) => {
                // 2. 意图判断
                const isClick = Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;

                if (isClick) {
                    const centerCardIndex = Math.round(scrollPositionRef.current / cardWidth);
                    const centerCardRef = menuCardRefs.current[centerCardIndex];
                    centerCardRef?.handlePress(); // 3. 手动触发卡片点击
                } else {
                    // 4. 惯性推力动画
                    const velocity = gestureState.vx;
                    Animated.decay(scrollX, { 
                        velocity: velocity,
                        deceleration: 0.997,
                        useNativeDriver: false, 
                    }).start(() => {
                       // Decay animation finished
                    });
                }
                 // 延迟后恢复自动旋转
                setTimeout(() => setIsInteracting(false), 2000);
            },
        })
    ).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } }}],
        { useNativeDriver: false, listener: (event) => { scrollPositionRef.current = event.nativeEvent.contentOffset.x; } }
    );

    if (menuItems.length === 0) return null;
    const duplicatedItems = [...menuItems, ...menuItems, ...menuItems];

    return (
        <View style={styles.rotatingModeContainer}>
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={cardWidth}
                snapToAlignment="start"
                style={styles.rotatingScrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: scrollViewPadding }}
                {...panResponder.panHandlers}
            >
                {duplicatedItems.map((item, index) => (
                    <MenuCard
                        ref={ref => menuCardRefs.current[index] = ref} // 5. 获取卡片引用
                        key={`${item.id}-${index}`}
                        item={item}
                        onPress={() => navigation.navigate(item.screen)}
                        style={{ width: cardWidth, height: 320, paddingVertical: 20, justifyContent: 'center', alignItems: 'center' }}
                        scrollX={scrollX}
                        index={index}
                    />
                ))}
            </Animated.ScrollView>
             <View style={styles.controlsContainer}>
                <TouchableOpacity style={[styles.directionButton, { backgroundColor: theme.primary }]} onPress={toggleRotationDirection}>
                    <Text style={styles.directionButtonText}>🔄</Text>
                </TouchableOpacity>
                <View style={styles.sliderContainer}>
                    <Text style={{ color: theme.text, fontSize: 12 }}>速度</Text>
                    <Slider style={{ flex: 1, height: 40 }} minimumValue={0.2} maximumValue={2.0} step={0.1} value={rotationSpeed} onValueChange={setRotationSpeed} minimumTrackTintColor={theme.primary} maximumTrackTintColor={theme.border} thumbTintColor={theme.primary} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rotatingModeContainer: { height: 420, justifyContent: 'center', alignItems: 'center' },
    rotatingScrollView: { flexGrow: 0 },
    controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', position: 'absolute', bottom: 10, paddingHorizontal: 10, backgroundColor: '#00000030', borderRadius: 30 },
    sliderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    directionButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    directionButtonText: { fontSize: 24 },
});

export default RotatingModeView;
