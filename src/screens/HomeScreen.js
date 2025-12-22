import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';

const HomeScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { currentMode, rotationDirection, toggleRotationDirection, customMenuItems, selectedCard, setSelectedCardId } = useModeContext();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // --- 旋转模式状态 (最终修复版) ---
  const [isRotationPaused, setIsRotationPaused] = useState(false);
  const scrollViewRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const intervalRef = useRef(null);

  // 修复：当组件加载时，滚动到中间区域
  useEffect(() => {
    if (currentMode === MODE_ROTATING) {
        // 等待布局完成后再滚动
        setTimeout(() => {
            const menuItems = customMenuItems.filter(item => item.visible);
            if (scrollViewRef.current && menuItems.length > 0) {
                const blockWidth = menuItems.length * 330; // 330 = item width + margin
                scrollViewRef.current.scrollTo({ x: blockWidth, animated: false });
            }
        }, 100);
    }
  }, [currentMode, customMenuItems]);

  // 自动滚动效果 (最终修复版)
  useEffect(() => {
    if (currentMode === MODE_ROTATING && !isRotationPaused) {
      const direction = rotationDirection === 'clockwise' ? 1 : -1;
      const menuItems = customMenuItems.filter(item => item.visible);
      const blockWidth = menuItems.length * 330;

      intervalRef.current = setInterval(() => {
        let newX = scrollPositionRef.current + direction;

        // "传送门" 逻辑
        if (direction === 1 && newX >= blockWidth * 2) { // 向右滚动超出边界
          newX -= blockWidth;
          scrollViewRef.current?.scrollTo({ x: newX, animated: false });
        } else if (direction === -1 && newX <= blockWidth / 2) { // 向左滚动超出边界
          newX += blockWidth;
          scrollViewRef.current?.scrollTo({ x: newX, animated: false });
        }

        scrollViewRef.current?.scrollTo({ x: newX, animated: false });
      }, 15); // 约 60fps
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentMode, rotationDirection, isRotationPaused, customMenuItems]);

  const pauseRotation = useCallback(() => setIsRotationPaused(true), []);
  const resumeRotation = useCallback(() => setIsRotationPaused(false), []);

  const handleScroll = (event) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.x;
  };

  // --- 传统模式渲染 ---
  const renderCardMode = () => (
    <View style={styles.traditionalModeContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>功能卡片</Text>
      </View>
      <View style={styles.menuGrid}>
        {customMenuItems.filter(item => item.visible).map((item) => (
          <View key={item.id} style={styles.traditionalMenuItemWrapper}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  // --- 旋转模式渲染 ---
  const renderRotatingMode = () => {
    const menuItems = customMenuItems.filter(item => item.visible);
    if (menuItems.length === 0) return null;
    const duplicatedItems = [...menuItems, ...menuItems, ...menuItems];

    return (
      <View style={styles.rotatingModeContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={330}
          snapToAlignment="center"
          style={styles.rotatingScrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onTouchStart={pauseRotation}
          onMomentumScrollEnd={resumeRotation}
          onScrollEndDrag={resumeRotation}
        >
          {duplicatedItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={[styles.rotatingItem, { backgroundColor: theme.card }]}>
              <TouchableOpacity style={styles.rotatingCard} onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={[styles.directionButton, { backgroundColor: theme.primary }]} onPress={toggleRotationDirection}>
          <Text style={styles.directionButtonText}>{rotationDirection === 'clockwise' ? '逆时针' : '顺时针'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- 抓牌模式渲染 ---
  const renderCardGrabMode = () => {
    const fanRadius = 200;
    const fanAngle = Math.PI / 2;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const visibleItems = customMenuItems.filter(item => item.visible);
    const totalCards = visibleItems.length;

    return (
      <View style={styles.cardGrabModeContainer}>
        {visibleItems.map((item, index) => {
          const isSelected = selectedCard === item.id;
          const cardAngle = totalCards <= 1 ? 0 : (index - (totalCards - 1) / 2) * (fanAngle / (totalCards - 1));
          const x = centerX + Math.sin(cardAngle) * fanRadius - 60;
          const y = centerY + Math.cos(cardAngle) * fanRadius - 100;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.cardGrabItem,
                {
                  backgroundColor: theme.card,
                  zIndex: isSelected ? totalCards + 1 : totalCards - index,
                  opacity: isSelected ? 1 : 0.7,
                  transform: [
                    { translateX: x }, 
                    { translateY: y }, 
                    { rotate: `${cardAngle * (180 / Math.PI)}deg` },
                    { scale: isSelected ? 1.2 : 1 },
                  ],
                }
              ]}
              onPressIn={() => setSelectedCardId(item.id)}
              onPressOut={() => { navigation.navigate(item.screen); setSelectedCardId(null); }}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.menuItemTitle, { color: theme.text, fontSize: 16 }]}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case MODE_TRADITIONAL: return renderCardMode();
      case MODE_ROTATING: return renderRotatingMode();
      case MODE_CARD_GRAB: return renderCardGrabMode();
      default: return renderCardMode();
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>SleepWell</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>助你拥有良好睡眠</Text>
      </View>
      {renderCurrentMode()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: 5 },
  traditionalMenuItemWrapper: { width: '50%', padding: 5, marginBottom: 10 },
  menuItem: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  icon: { fontSize: 40, marginBottom: 12 },
  menuItemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  menuItemDescription: { fontSize: 14, textAlign: 'center' },
  traditionalModeContainer: { padding: 10 },
  rotatingModeContainer: { height: 320, justifyContent: 'center', alignItems: 'center' },
  rotatingScrollView: { flexGrow: 0 },
  rotatingItem: { width: 250, height: 250, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginHorizontal: 40, marginVertical: 20 },
  rotatingCard: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 },
  directionButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  directionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  cardGrabModeContainer: { flex: 1, minHeight: 500, position: 'relative' },
  cardGrabItem: { position: 'absolute', width: 120, height: 180, padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});

export default HomeScreen;