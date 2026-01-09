import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, PanResponder, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import MenuCard from './MenuCard';
import { Ionicons } from '@expo/vector-icons';

const RotatingModeView = ({ menuItems, theme, navigation, rotationDirection, toggleRotationDirection }) => {
    const { width: screenWidth } = useWindowDimensions();
    const visibleCount = 3.5;
    const cardWidth = screenWidth * 3 / (4 * visibleCount);
    const spacing = cardWidth / 3;
    const cellWidth = cardWidth + spacing;
    const scrollViewPadding = (screenWidth - cellWidth) / 2;
    const menuLength = menuItems.length;
    
    // Animation Refs
    const scrollViewRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const menuCardRefs = useRef({});
    
    // State Machine
    const mode = useRef('AUTO'); // 'AUTO' | 'DRAGGING' | 'INERTIA' | 'PAUSED'
    const velocity = useRef(1.0); // pixels per frame
    const currentScrollPos = useRef(0);
    const lastGestureX = useRef(0);
    const animationFrameId = useRef(null);
    const lastTimestamp = useRef(0);
    const didInitRef = useRef(false);
    const prevCellWidth = useRef(cellWidth);
    const cellWidthRef = useRef(cellWidth);

    // React State for UI
    const [rotationSpeed, setRotationSpeed] = useState(0.8); // 稍微降低默认速度

    // 初始化位置 - 使用 setImmediate 确保布局完成后滚动
    useEffect(() => {
        if (!didInitRef.current && menuLength > 0) {
            currentScrollPos.current = menuLength * cellWidth;
            const timer = setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ x: currentScrollPos.current, animated: false });
                }
            }, 100);
            didInitRef.current = true;
            return () => clearTimeout(timer);
        }
    }, [menuLength, cellWidth]);

    useEffect(() => {
        if (didInitRef.current && scrollViewRef.current) {
            const ratio = cellWidth / prevCellWidth.current;
            currentScrollPos.current = currentScrollPos.current * ratio;
            scrollViewRef.current.scrollTo({ x: currentScrollPos.current, animated: false });
            scrollX.setValue(currentScrollPos.current);
            prevCellWidth.current = cellWidth;
        }
    }, [cellWidth]);
    useEffect(() => { cellWidthRef.current = cellWidth; }, [cellWidth]);

    // Main Animation Loop
    useEffect(() => {
        let lastTime = Date.now();
        const loop = () => {
            if (!didInitRef.current) {
                animationFrameId.current = requestAnimationFrame(loop);
                return;
            }
            const now = Date.now();
            const dt = (now - lastTime) / 16.67; // Normalize to ~60fps
            lastTime = now;

            const blockWidth = menuLength * cellWidthRef.current;
            const direction = rotationDirection === 'clockwise' ? 1 : -1;
            const targetVelocity = rotationSpeed * direction;

            if (mode.current === 'AUTO') {
                // 平滑趋向目标速度（如果之前有变速）
                velocity.current = velocity.current * 0.95 + targetVelocity * 0.05;
                // 确保有最小速度，避免停滞
                if (Math.abs(velocity.current) < 0.1 && Math.abs(targetVelocity) > 0.1) {
                     velocity.current = targetVelocity * 0.1; 
                }
                currentScrollPos.current += velocity.current * dt;
            } 
            else if (mode.current === 'INERTIA') {
                velocity.current = velocity.current * 0.95;
                currentScrollPos.current += velocity.current * dt;

                if (Math.abs(velocity.current) < 0.5) {
                    mode.current = 'AUTO';
                }
            }
            // DRAGGING 和 PAUSED 模式下不更新位置

            // 无限循环逻辑 (Boundary Check)
            const isMovingRight = velocity.current >= 0;
            if (isMovingRight && currentScrollPos.current >= blockWidth * 2) {
                currentScrollPos.current -= blockWidth;
            } else if (!isMovingRight && currentScrollPos.current <= blockWidth) {
                currentScrollPos.current += blockWidth;
            }
            
            // Apply Scroll
            if (mode.current !== 'DRAGGING' && scrollViewRef.current) {
                if (Platform.OS === 'web') {
                    const node = scrollViewRef.current.getScrollableNode?.();
                    if (node) {
                        node.scrollLeft = currentScrollPos.current;
                    } else {
                        scrollViewRef.current.scrollTo({ x: currentScrollPos.current, animated: false });
                    }
                } else {
                    scrollViewRef.current.scrollTo({ x: currentScrollPos.current, animated: false });
                }
                scrollX.setValue(currentScrollPos.current);
            }

            animationFrameId.current = requestAnimationFrame(loop);
        };

        animationFrameId.current = requestAnimationFrame(loop);
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [rotationDirection, rotationSpeed, menuLength]);


    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                mode.current = 'PAUSED'; // 暂时暂停，等待移动判断
                lastGestureX.current = currentScrollPos.current;
                velocity.current = 0; // Stop momentum
            },
            onPanResponderMove: (evt, gestureState) => {
                // 只有移动距离超过一点点才算拖动，否则算长按暂停
                if (Math.abs(gestureState.dx) > 6) {
                    mode.current = 'DRAGGING';
                    const newPos = lastGestureX.current - gestureState.dx;
                    currentScrollPos.current = newPos;
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollTo({ x: newPos, animated: false });
                        scrollX.setValue(newPos);
                    }
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                // 判断是点击还是拖动释放
                const isClick = Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8;

                if (isClick) {
                    // 如果是点击，恢复自动模式（稍后）并处理点击事件
                    // 实际上点击事件最好由 MenuCard 的 Pressable 处理
                    // 但由于 PanResponder 劫持了触摸，我们需要手动触发
                    // 或者我们让 View 的 pointerEvents 在非拖动时穿透？不，PanResponder 在父级。
                    
                    // 这里我们采用一种策略：如果是点击，不做任何滚动处理，保持 PAUSED 一小会儿然后 AUTO
                    // 点击的具体触发交给 MenuCard 内部（如果 PanResponder 没有阻止的话）
                    // 在 RN 中，父级 PanResponder 如果不 `return false` 给 `onStartShouldSetPanResponderCapture`，子组件可能收不到触摸。
                    // 但我们这里用的是 `onStartShouldSetPanResponder`，是在冒泡阶段。
                    // 如果我们返回 true，子组件的 onPress 可能不会触发。
                    // 解决方案：手动计算点击了哪个卡片。
                    
                    const clickIndex = Math.floor((currentScrollPos.current + gestureState.moveX) / cellWidth); 
                    // 这种计算比较依赖屏幕坐标，比较复杂。
                    // 更简单的方法：让 PanResponder 在 grant 时不立刻拦截，或者在 release 时手动调用。
                    // 现有的 RotatingModeView 实现是通过计算 index 来调用的。
                    
                    // 重新计算中心索引 (近似)
                    // 注意：scrollPos 是 scrollview 的偏移。
                    // 触摸点在屏幕上的位置是 evt.nativeEvent.locationX
                    // 但我们需要的是相对于 ScrollView 内容的坐标。
                    // 内容坐标 = scrollPos + touchX
                    const contentX = currentScrollPos.current + evt.nativeEvent.locationX - scrollViewPadding;
                    const cardIndex = Math.floor(contentX / cellWidth);
                    // 由于 duplicatedItems，我们需要取模找到原始 item
                    // 但为了调用 ref，我们需要真实的 index (在 duplicated 数组中的)
                    // menuCardRefs 是基于 duplicatedItems 索引的。
                    
                    if (menuCardRefs.current[cardIndex]) {
                        menuCardRefs.current[cardIndex].handlePress();
                    }
                    
                    // 恢复
                    setTimeout(() => { mode.current = 'AUTO'; }, 500);
                } else {
                    // 拖动释放，给予加速度
                    // gestureState.vx 是 px/ms 还是 px/frame? 通常是 px/ms。
                    // 我们 loop 是每帧 (约16ms)。
                    // 假设 vx = 0.5 px/ms -> 8 px/frame。
                    // 负号是因为手指向左滑(dx<0)，内容应该向左滚(pos增加)，所以是反的？
                    // ScrollView: 手指向左滑 (dx < 0)，为了跟随手指，scrollPos 应该增加 (显示右边的内容)。
                    // 所以 newPos = initial - dx. (-(-10) = +10). 正确。
                    // 速度同理：vx < 0 (向左挥), velocity 应该 > 0.
                    velocity.current = -gestureState.vx * 16; // 转换为 px/frame 大致估算
                    mode.current = 'INERTIA';
                }
            },
            onPanResponderTerminate: () => {
                mode.current = 'AUTO';
            }
        })
    ).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } }}],
        { useNativeDriver: false } // 必须 false 因为我们在 JS 线程监听
    );

    if (menuItems.length === 0) return null;
    const duplicatedItems = [...menuItems, ...menuItems, ...menuItems];

    return (
        <View style={styles.rotatingModeContainer}>
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.rotatingScrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: scrollViewPadding }}
                scrollEnabled={Platform.OS === 'web' ? true : false}
                {...panResponder.panHandlers}
            >
                {duplicatedItems.map((item, index) => {
                    const inputRange = [
                        (index - 1) * cellWidth,
                        index * cellWidth,
                        (index + 1) * cellWidth
                    ];
                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.95, 1.08, 0.95],
                        extrapolate: 'clamp'
                    });
                    return (
                        <Animated.View 
                            key={`${item.id}-${index}`} 
                            style={{ width: cellWidth, height: 280, justifyContent: 'center', alignItems: 'center', transform: [{ scale }] }}
                        >
                            <MenuCard
                                ref={ref => menuCardRefs.current[index] = ref}
                                item={item}
                                onPress={() => navigation.navigate(item.screen)}
                                style={{ width: cardWidth, height: '100%', paddingVertical: 10 }}
                                scrollX={scrollX}
                                index={index}
                                cardWidth={cardWidth}
                            />
                        </Animated.View>
                    );
                })}
            </Animated.ScrollView>
            
            <View style={styles.controlsContainer}>
                <TouchableOpacity 
                    style={[styles.directionButton, { backgroundColor: theme.primary }]} 
                    onPress={toggleRotationDirection}
                >
                    <Ionicons name={rotationDirection === 'clockwise' ? "refresh" : "refresh-circle"} size={24} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.sliderWrapper}>
                    <Ionicons name="speedometer-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                    <Slider 
                        style={{ flex: 1, height: 40 }} 
                        minimumValue={0.2} 
                        maximumValue={3.0} 
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
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 32,
        marginVertical: 20
    },
    rotatingScrollView: { flexGrow: 0, width: '100%' },
    controlsContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '90%', 
        alignSelf: 'center',
        marginTop: 16,
        paddingHorizontal: 15, 
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.4)', 
        borderRadius: 30
    },
    sliderWrapper: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: 15 
    },
    directionButton: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default RotatingModeView;
