import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, AppState, Animated, PanResponder, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import MenuCard from './MenuCard_optimized_fixed';

const RotatingModeView = ({ menuItems, theme, navigation, rotationDirection, toggleRotationDirection }) => {
    const screenWidth = Dimensions.get('window').width;
    const [isInteracting, setIsInteracting] = useState(false);
    const [rotationSpeed, setRotationSpeed] = useState(0.7);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const cardWidth = 330;
    const scrollViewPadding = (screenWidth - cardWidth) / 2;
    
    const scrollViewRef = useRef(null);
    const animationFrameRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollPositionRef = useRef(0);
    const menuCardRefs = useRef({});
    const lastInteractionTimeRef = useRef(0);

    // 触摸反馈动画 - 新增
    const touchFeedbackRef = useRef(new Animated.Value(0)).current;

    // 自动旋转动画 - 优化版本
    useEffect(() => {
        if (isInteracting || menuItems.length === 0) return;
        const blockWidth = menuItems.length * cardWidth;
        let lastTime = Date.now();
        
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(() => {
                if (!isInteracting) {
                    const currentTime = Date.now();
                    const deltaTime = (currentTime - lastTime) / 1000; // 转换为秒
                    lastTime = currentTime;
                    
                    const direction = rotationDirection === 'clockwise' ? 1 : -1;
                    let newX = scrollPositionRef.current + direction * rotationSpeed * deltaTime * 60; // 基于帧率的平滑速度
                    
                    if (direction === 1 && newX >= blockWidth * 2) { newX -= blockWidth; }
                    else if (direction === -1 && newX <= blockWidth) { newX += blockWidth; }
                    
                    scrollViewRef.current?.scrollTo({ x: newX, animated: false });
                }
                animate();
            });
        };
        
        const timeoutId = setTimeout(animate, 3000); // 延长自动旋转恢复时间
        return () => {
             clearTimeout(timeoutId);
             if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isInteracting, rotationDirection, menuItems, rotationSpeed]);

    // 初始定位 - 优化
    useEffect(() => {
        if (menuItems.length > 0 && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: cardWidth, animated: false }); // 从中间开始
            setSelectedIndex(0);
        }
    }, [menuItems]);

    // 改进的手势识别 - 核心优化
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: (evt, gestureState) => {
                setIsInteracting(true);
                lastInteractionTimeRef.current = Date.now();
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                
                // 触摸反馈动画 - 新增
                Animated.spring(touchFeedbackRef, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
            },
            onPanResponderMove: (evt, gestureState) => {
                const newX = scrollPositionRef.current - gestureState.dx;
                scrollViewRef.current?.scrollTo({ x: newX, animated: false });
            },
            onPanResponderRelease: (evt, gestureState) => {
                // 改进的意图判断 - 增加阈值
                const isClick = Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8;
                const centerCardIndex = Math.round(scrollPositionRef.current / cardWidth);

                if (isClick) {
                    // 点击反馈增强
                    setSelectedIndex(centerCardIndex % menuItems.length);
                    const centerCardRef = menuCardRefs.current[centerCardIndex];
                    centerCardRef?.handlePress();
                } else {
                    // 改进的惯性动画 - 核心优化
                    const velocity = gestureState.vx;
                    const isFastSwipe = Math.abs(velocity) > 0.5;
                    
                    if (isFastSwipe) {
                        // 快速滑动的捕捉对齐
                        const targetIndex = velocity > 0 ? centerCardIndex + 1 : centerCardIndex - 1;
                        const targetX = targetIndex * cardWidth;
                        
                        Animated.spring(scrollX, {
                            toValue: targetX,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        }).start();
                    } else {
                        // 正常惯性滚动 - 优化参数
                        Animated.decay(scrollX, {
                            velocity: velocity,
                            deceleration: 0.95, // 调高减速度让滚动更快停止
                            useNativeDriver: true,
                        }).start(() => {
                            // 滚动结束后捕捉到最近的卡片
                            const snapIndex = Math.round(scrollPositionRef.current / cardWidth);
                            const snapX = snapIndex * cardWidth;
                            Animated.spring(scrollX, {
                                toValue: snapX,
                                tension: 100,
                                friction: 8,
                                useNativeDriver: true,
                            }).start();
                        });
                    }
                }
                
                // 恢复触摸反馈
                Animated.spring(touchFeedbackRef, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                
                // 延长自动旋转恢复时间
                setTimeout(() => setIsInteracting(false), 3000);
            },
        })
    ).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } }}],
        { 
            useNativeDriver: true, // 改为true提升性能
            listener: (event) => { 
                scrollPositionRef.current = event.nativeEvent.contentOffset.x;
                const currentIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
                setSelectedIndex(currentIndex % menuItems.length);
            } 
        }
    );

    if (menuItems.length === 0) return null;
    const duplicatedItems = [...menuItems, ...menuItems, ...menuItems];

    return (
        <View style={styles.rotatingModeContainer}>
            {/* 旋转方向指示器 - 新增 */}
            <View style={[styles.directionIndicator, { backgroundColor: theme.primary }]}>
                <Text style={styles.directionIndicatorText}>
                    {rotationDirection === 'clockwise' ? '↻' : '↺'}
                </Text>
            </View>

            {/* 选中状态指示器 - 新增 */}
            <View style={styles.selectionIndicator}>
                {menuItems.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicatorDot,
                            { backgroundColor: selectedIndex === index ? theme.primary : theme.border }
                        ]}
                    />
                ))}
            </View>

            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={cardWidth}
                snapToAlignment="center" // 改为center提升对齐效果
                style={[styles.rotatingScrollView, {
                    transform: [{ scale: Animated.add(1, touchFeedbackRef.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.02] // 微妙的缩放反馈
                    })) }]
                }]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: scrollViewPadding }}
                {...panResponder.panHandlers}
            >
                {duplicatedItems.map((item, index) => (
                    <MenuCard
                        ref={ref => menuCardRefs.current[index] = ref}
                        key={`${item.id}-${index}`}
                        item={item}
                        onPress={() => navigation.navigate(item.screen)}
                        style={{ width: cardWidth, height: 320, paddingVertical: 20, justifyContent: 'center', alignItems: 'center' }}
                        scrollX={scrollX}
                        index={index}
                        isSelected={selectedIndex === index % menuItems.length} // 新增选中状态传递
                    />
                ))}
            </Animated.ScrollView>
            
            <View style={[styles.controlsContainer, { backgroundColor: theme.background === '#1a1a1a' ? '#00000050' : '#ffffff50' }]}>
                <TouchableOpacity 
                    style={[styles.directionButton, { backgroundColor: theme.primary }]} 
                    onPress={toggleRotationDirection}
                    onPressIn={() => {
                        Animated.spring(touchFeedbackRef, {
                            toValue: 0.5,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        }).start();
                    }}
                    onPressOut={() => {
                        Animated.spring(touchFeedbackRef, {
                            toValue: 0,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        }).start();
                    }}
                >
                    <Text style={styles.directionButtonText}>🔄</Text>
                </TouchableOpacity>
                
                <View style={styles.sliderContainer}>
                    <Text style={{ color: theme.text, fontSize: 12 }}>速度</Text>
                    <Slider 
                        style={{ flex: 1, height: 40 }} 
                        minimumValue={0.2} 
                        maximumValue={2.0} 
                        step={0.1} 
                        value={rotationSpeed} 
                        onValueChange={setRotationSpeed} 
                        minimumTrackTintColor={theme.primary} 
                        maximumTrackTintColor={theme.border} 
                        thumbTintColor={theme.primary} 
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rotatingModeContainer: { 
        height: 420, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
    },
    rotatingScrollView: { 
        flexGrow: 0,
    },
    // 新增样式
    directionIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    directionIndicatorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectionIndicator: {
        position: 'absolute',
        bottom: 80,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        opacity: 0.7,
    },
    controlsContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '80%', 
        position: 'absolute', 
        bottom: 10, 
        paddingHorizontal: 10, 
        borderRadius: 30 
    },
    sliderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    directionButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    directionButtonText: { fontSize: 24 },
});

export default RotatingModeView;
