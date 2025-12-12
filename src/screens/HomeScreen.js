import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_CUSTOM, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';

const HomeScreen = ({ navigation }) => {
  const { theme, getTheme } = useThemeContext();
  const {
    currentMode,
    toggleMode,
    rotationDirection,
    toggleRotationDirection,
    customMenuItems,
    hiddenMenuItems,
    toggleCardVisibility,
    restoreHiddenCard,
    selectedCard,
    setSelectedCardId
  } = useModeContext();
  const [menuItems] = useState([
    {
      id: 'timer',
      title: '睡眠定时器',
      description: '设置睡眠提醒时间',
      icon: '⏰',
      screen: 'SleepTimer',
    },
    {
      id: 'sound',
      title: '音效库',
      description: '选择助眠音效',
      icon: '🎵',
      screen: 'SoundLibrary',
    },
    {
      id: 'statistics',
      title: '统计数据',
      description: '查看睡眠统计',
      icon: '📊',
      screen: 'Statistics',
    },
    {
      id: 'visual',
      title: '视觉辅助',
      description: '助眠视觉效果',
      icon: '🌈',
      screen: 'VisualAid',
    },
    {
      id: 'dream',
      title: '梦境日志',
      description: '记录梦境',
      icon: '📝',
      screen: 'DreamJournal',
    },
    {
      id: 'community',
      title: '社区',
      description: '加入睡眠社区',
      icon: '👥',
      screen: 'Community',
    },
    {
      id: 'profile',
      title: '个人资料',
      description: '管理个人信息',
      icon: '👤',
      screen: 'Profile',
    },
    {
      id: 'settings',
      title: '设置',
      description: '调整应用设置',
      icon: '⚙️',
      screen: 'Settings',
    },
    {
      id: 'feedback',
      title: '反馈意见',
      description: '向我们反馈您的建议',
      icon: '💬',
      screen: 'Feedback',
    },
  ]);
  
  // 旋转动画值
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // 转动模式自动滚动效果
  const isPaused = useRef(false);
  const scrollViewRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const lastScrollPosition = useRef(0);
  const scrollVelocity = useRef(0);
  const lastTimestamp = useRef(0);
  const rotationSpeed = useRef(15); // 默认滚动速度，每15毫秒滚动1像素

  // 自动滚动效果
  useEffect(() => {
    if (currentMode === MODE_ROTATING && !isPaused.current) {
      const direction = rotationDirection === 'clockwise' ? 1 : -1;
      
      // 创建自动滚动间隔
      const interval = setInterval(() => {
        if (scrollViewRef.current && !isPaused.current) {
          scrollViewRef.current.scrollBy({ x: direction * 1, y: 0, animated: false });
        }
      }, rotationSpeed.current);
      
      autoScrollInterval.current = interval;
      
      return () => {
        clearInterval(interval);
      };
    }
    
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [currentMode, rotationDirection, isPaused.current, rotationSpeed.current]);

  // 暂停滚动
  const pauseRotation = () => {
    isPaused.current = true;
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  // 恢复滚动
  const resumeRotation = () => {
    isPaused.current = false;
    // 重新触发useEffect
    rotationSpeed.current = rotationSpeed.current;
  };

  // 处理滚动事件，计算速度
  const handleScroll = (event) => {
    const timestamp = event.nativeEvent.timestamp;
    const scrollX = event.nativeEvent.contentOffset.x;
    
    if (lastTimestamp.current > 0) {
      const deltaTime = timestamp - lastTimestamp.current;
      const deltaScroll = scrollX - lastScrollPosition.current;
      
      // 计算滚动速度 (像素/秒)
      scrollVelocity.current = (deltaScroll / deltaTime) * 1000;
      
      // 根据滚动速度调整自动滚动速度
      const maxSpeed = 5; // 最快速度，每5毫秒滚动1像素（数字越小速度越快）
      const minSpeed = 30; // 最慢速度，每30毫秒滚动1像素（数字越大速度越慢）
      
      // 将速度映射到滚动速度范围
      const speedFactor = Math.abs(scrollVelocity.current) / 1000; // 假设最大触摸速度为1000像素/秒
      // 速度越快，间隔时间越短，滚动速度越快
      rotationSpeed.current = Math.max(minSpeed - speedFactor * (minSpeed - maxSpeed), maxSpeed);
      
      // 根据滚动方向调整旋转方向
      if (scrollVelocity.current > 0) {
        // 向右滚动，顺时针
        if (rotationDirection !== 'clockwise') {
          toggleRotationDirection();
        }
      } else if (scrollVelocity.current < 0) {
        // 向左滚动，逆时针
        if (rotationDirection === 'clockwise') {
          toggleRotationDirection();
        }
      }
    }
    
    lastScrollPosition.current = scrollX;
    lastTimestamp.current = timestamp;
  };

  // 处理滚动结束事件
  const handleScrollEnd = () => {
    resumeRotation();
  };

  // 自定义模式编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 拖拽手势处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isEditing,
      onMoveShouldSetPanResponder: () => isEditing,
      onPanResponderGrant: (evt, gestureState) => {
        // 开始拖拽
        const { locationX, locationY } = evt.nativeEvent;
        // 这里可以根据触摸位置确定拖拽的卡片索引
        // 简化实现，实际项目中需要根据位置计算
      },
      onPanResponderMove: (evt, gestureState) => {
        // 拖拽中
        // 这里可以添加拖拽视觉效果，如透明度变化、缩放等
      },
      onPanResponderRelease: (evt, gestureState) => {
        // 结束拖拽
        // 简化实现，实际项目中需要根据最终位置重新排序
      },
    })
  ).current;

  // 传统模式渲染
  const renderCardMode = () => {
    return (
      <View style={styles.traditionalModeContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            功能卡片
          </Text>
        </View>
        
        <View style={styles.menuGrid}>
          {customMenuItems.map((item, index) => (
            <View 
              key={item.id} 
              style={styles.traditionalMenuItemWrapper}
            >
              <TouchableOpacity
                style={[
                  styles.menuItem, 
                  { backgroundColor: theme.card }
                ]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 转动模式渲染
  const renderRotatingMode = () => {
    return (
      <View 
        style={styles.rotatingModeContainer}
        onTouchStart={pauseRotation}
        onTouchEnd={resumeRotation}
        onMouseEnter={pauseRotation}
        onMouseLeave={resumeRotation}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={330} // 卡片宽度(250) + 左右间距(40*2)
          snapToAlignment="center"
          style={styles.rotatingScrollView}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16} // 60fps
        >
          {/* 复制菜单数组三次，实现更好的无限滚动效果 */}
          {[...menuItems, ...menuItems, ...menuItems].map((item, index) => {
            return (
              <View
                key={`${item.id}-${index}`}
                style={[
                  styles.rotatingItem,
                  {
                    backgroundColor: theme.card,
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.rotatingCard}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.menuItemDescription, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={[styles.directionButton, { backgroundColor: theme.primary }]}
          onPress={toggleRotationDirection}
        >
          <Text style={styles.directionButtonText}>
            {rotationDirection === 'clockwise' ? '逆时针' : '顺时针'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 抓牌模式渲染
  const renderCardGrabMode = () => {
    // 扇形布局参数
    const fanRadius = 200; // 增加扇形半径，适应细长卡片
    const fanAngle = Math.PI / 2; // 增加扇形角度 (90度)，让卡片分布更开
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    return (
      <View style={styles.cardGrabModeContainer}>
        {menuItems.map((item, index) => {
          const isSelected = selectedCard === item.id;
          
          // 计算扇形位置
          const totalCards = menuItems.length;
          const cardAngle = (index - totalCards / 2 + 0.5) * fanAngle / (totalCards - 1);
          const x = centerX + Math.sin(cardAngle) * fanRadius - 60; // 60是细长卡片宽度的一半 (120/2)
          const y = centerY + Math.cos(cardAngle) * fanRadius - 100; // 100是细长卡片高度的一半 (200/2)
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.cardGrabItem,
                {
                  backgroundColor: theme.card,
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { rotate: `${cardAngle * (180 / Math.PI)}deg` }
                  ],
                  zIndex: isSelected ? menuItems.length + 1 : menuItems.length - index,
                  opacity: isSelected ? 1 : 0.7,
                  scale: isSelected ? 1.2 : 1,
                }
              ]}
              onPressIn={() => setSelectedCardId(item.id)}
              onPressOut={() => {
                navigation.navigate(item.screen);
                setSelectedCardId(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.menuItemTitle, { color: theme.text, fontSize: 16 }]}>{item.title}</Text>
              <Text style={[styles.menuItemDescription, { color: theme.textSecondary, fontSize: 12 }]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 根据当前模式渲染对应布局
  const renderCurrentMode = () => {
    switch (currentMode) {
      case MODE_TRADITIONAL:
        return renderCardMode();
      case MODE_ROTATING:
        return renderRotatingMode();
      case MODE_CARD_GRAB:
        return renderCardGrabMode();
      default:
        return renderCardMode();
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>SleepWell</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>助你拥有良好睡眠</Text>
      </View>



      {/* 渲染当前模式 */}
      {renderCurrentMode()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  menuItem: {
    width: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  menuItemDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  // 自定义模式样式
  customModeContainer: {
    padding: 10,
  },
  customMenuItemWrapper: {
    width: '45%',
    position: 'relative',
  },
  // 传统模式样式
  traditionalModeContainer: {
    padding: 10,
  },
  traditionalMenuItemWrapper: {
    width: '45%',
    position: 'relative',
  },
  // 编辑模式样式
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 添加按钮样式
  addButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // 没有卡片提示样式
  noCardsText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hiddenCardsSection: {
    marginTop: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  hiddenCardsContainer: {
    paddingVertical: 10,
  },
  hiddenCardItem: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 15,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  restoreButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  // 转动模式样式
  rotatingModeContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rotatingScrollView: {
    flexGrow: 0,
  },
  rotatingItem: {
    width: 250, // 固定卡片宽度
    height: 250,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 40, // 固定卡片间距
    marginVertical: 20,
  },
  rotatingCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  directionButton: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 抓牌模式样式
  cardGrabModeContainer: {
    height: 450,
    padding: 20,
    justifyContent: 'center',
  },
  cardGrabItem: {
    position: 'absolute',
    width: 120,
    height: 200,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transition: 'all 0.3s ease',
  },
});

export default HomeScreen;
