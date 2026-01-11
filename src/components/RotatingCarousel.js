import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.7;
const SPACING = 10;
const FULL_SIZE = ITEM_SIZE + SPACING * 2;

const RotatingCarousel = ({ data, onCardPress }) => {
  const { theme } = useThemeContext();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const intervalRef = useRef(null); // Ref to hold the interval

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(3000); // 默认3秒

  // 自动播放逻辑 (更稳定的版本)
  useEffect(() => {
    // 清除旧的 interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 如果开启自动播放，则设置新的 interval
    if (autoplay && data.length > 0) {
      intervalRef.current = setInterval(() => {
        // 使用功能性更新或 Ref 来获取最新的 index, 这里直接用 state，因为 onViewableItemsChanged 会更新它
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % data.length;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return prevIndex; // 让 onViewableItemsChanged 成为 index 的唯一真实来源
        });
      }, autoplaySpeed);
    }

    // 组件卸载时清除 interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, autoplaySpeed, data.length]); // 只在这些关键依赖改变时重新运行

  // 滚动时更新当前索引
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % data.length;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.text }]}>还没有梦境记录哦，快去添加吧！</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * FULL_SIZE, index * FULL_SIZE, (index + 1) * FULL_SIZE];
    const translateY = scrollX.interpolate({ inputRange, outputRange: [50, 0, 50], extrapolate: 'clamp' });
    const rotateY = scrollX.interpolate({ inputRange, outputRange: ['-45deg', '0deg', '45deg'], extrapolate: 'clamp' });

    return (
      <TouchableOpacity onPress={() => onCardPress(item)} activeOpacity={0.9}>
        <Animated.View style={[styles.itemContainer, { transform: [{ translateY }, { perspective: 1000 }, { rotateY }] }]}>
          <View style={[styles.itemContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.itemContentText, { color: theme.text }]} numberOfLines={5}>{item.content}</Text>
            <Text style={[styles.itemDate, { color: theme.text }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FULL_SIZE}
        decelerationRate="fast"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContentContainer}
      />
      <View style={[styles.controlsContainer, {backgroundColor: theme.background}]}>
        <View style={styles.navigationButtons}>
            <TouchableOpacity style={[styles.navButton, {backgroundColor: theme.primary}]} onPress={handlePrev}><Text style={styles.navButtonText}>← 左</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.navButton, {backgroundColor: theme.primary}]} onPress={handleNext}><Text style={styles.navButtonText}>右 →</Text></TouchableOpacity>
        </View>
        <View style={styles.autoplayRow}>
          <Text style={{color: theme.text}}>自动播放</Text>
          <Switch value={autoplay} onValueChange={setAutoplay} trackColor={{false: '#767577', true: theme.secondary}} thumbColor={autoplay ? theme.primary : '#f4f3f4'}/>
        </View>
        <Text style={{color: theme.text}}>速度: { (autoplaySpeed / 1000).toFixed(1) }s</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={500} // 0.5s
          maximumValue={5000} // 5s
          step={500}
          value={autoplaySpeed}
          onValueChange={setAutoplaySpeed}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
          disabled={!autoplay}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContentContainer: { alignItems: 'center', paddingTop: 30, paddingHorizontal: (width - FULL_SIZE) / 2 },
  itemContainer: { width: ITEM_SIZE, height: 280, margin: SPACING },
  itemContent: { flex: 1, borderRadius: 12, padding: 20, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  itemTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  itemContentText: { fontSize: 16, lineHeight: 24, marginBottom: 15 },
  itemDate: { fontSize: 12, opacity: 0.7, position: 'absolute', bottom: 20, alignSelf: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, opacity: 0.7 },
  controlsContainer: { padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: -3}, shadowRadius: 5 },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  navButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  autoplayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
});

export default RotatingCarousel;
