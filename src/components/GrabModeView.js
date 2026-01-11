import React, { useRef, useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder, 
  useWindowDimensions,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 配置常量
const CARD_CONFIG = {
  width: 120,
  height: 200,
  fanRadius: 280, // 增加半径，让扇形更开阔
  maxRotateAngle: 40, // 增加最大旋转角度
  selectionThresholdRatio: 0.15, // 相对于屏幕尺寸的选择阈值比例
  selectedScale: 1.25, // 稍微增加选中放大比例
  selectedLift: -50, // 增加选中抬升高度
  pullToOpenThreshold: -80, // 上滑触发进入的阈值 (负数表示向上)
  lockDragThreshold: -20, // 锁定为垂直拖拽模式的阈值
};

// GrabCard 组件 - 使用 forwardRef 暴露动画方法
const GrabCard = forwardRef(({ item, theme, isSelected, layout, onPress, dragY }, ref) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    playReleaseAnimation: (callback) => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, { 
            toValue: 1.6, 
            friction: 4, 
            useNativeDriver: true 
          }),
          Animated.timing(opacityAnim, { 
            toValue: 0, 
            duration: 250, 
            useNativeDriver: true 
          })
        ]),
      ]).start(callback);
    }
  }));

  // 选中状态动画 - 立即响应
  useEffect(() => {
    // 基础位移：选中时抬升，未选中归零
    const baseTranslateY = isSelected ? CARD_CONFIG.selectedLift : 0;
    
    Animated.parallel([
      Animated.spring(scaleAnim, { 
        toValue: isSelected ? CARD_CONFIG.selectedScale : 1, 
        friction: 6, // 稍微增加摩擦力，减少晃动
        tension: 60, // 增加张力，响应更快
        useNativeDriver: true 
      }),
      Animated.spring(translateAnim, { 
        toValue: baseTranslateY, 
        friction: 6, 
        tension: 60,
        useNativeDriver: true 
      })
    ]).start();
  }, [isSelected]);

  if (!layout) return null;

  // 组合位移：基础位移 + 拖拽产生的额外位移
  // 只有当前选中的卡片会响应 dragY
  const translateY = isSelected 
    ? Animated.add(translateAnim, dragY || 0) 
    : translateAnim;

  return (
    <Animated.View
      style={[
        styles.cardGrabItem,
        {
          backgroundColor: theme.card,
          opacity: opacityAnim,
          // 动态计算 zIndex：确保选中卡片在最前，其他按扇形排列
          zIndex: isSelected ? 9999 : (layout.totalCards * 2 - layout.index * 2),
          // 关键修复：确保绝对定位起点正确
          top: 0,
          left: 0,
          // 选中样式增强
          borderColor: isSelected ? theme.primary : 'transparent',
          borderWidth: isSelected ? 1 : 0,
          shadowOpacity: isSelected ? 0.3 : 0.1,
          shadowRadius: isSelected ? 8 : 4,
          elevation: isSelected ? 8 : 3,
          transform: [
            // { perspective: 1000 }, // 暂时移除透视，防止渲染异常
            { translateX: layout.x },
            { translateY: layout.y },
            { rotate: layout.rotate },
            { rotateY: layout.rotateY || '0deg' },
            { scale: scaleAnim },
            { translateY: translateY } // 应用组合位移
          ],
        }
      ]}
    >
      <View style={styles.cardContent}>
        {typeof item.icon === 'string' && item.icon.includes && 
         (item.icon.includes('-') || item.icon === 'logo-github') ? (
          <Ionicons 
            name={item.icon} 
            size={40} 
            color={isSelected ? theme.primary : theme.text} // 选中时图标变色
            style={styles.icon} 
          />
        ) : (
          <Text style={[styles.iconText, { color: isSelected ? theme.primary : theme.text }]}>
            {item.icon}
          </Text>
        )}
        <Text style={[
          styles.menuItemTitle, 
          { color: theme.text, opacity: isSelected ? 1 : 0.8 }
        ]}>
          {item.title}
        </Text>
      </View>
    </Animated.View>
  );
});

// 辅助函数：计算卡片布局
const calculateCardLayouts = (visibleItems, containerWidth, containerHeight) => {
  if (visibleItems.length === 0) return {};
  
  const layouts = {};
  const { fanRadius, width, height, maxRotateAngle } = CARD_CONFIG;
  
  // 单卡片特殊处理
  if (visibleItems.length === 1) {
    layouts[visibleItems[0].id] = {
      x: containerWidth / 2 - width / 2,
      // 调整 Y 轴位置，确保在容器中间偏下
      y: containerHeight * 0.45, 
      rotate: '0deg',
      rotateY: '0deg',
      index: 0,
      totalCards: 1,
    };
    return layouts;
  }
  
  // 多卡片扇形排列 - 优化参数
  // 增加总角度，让扇形更开阔
  const fanAngle = Math.PI / 1.5; 
  const centerIndex = (visibleItems.length - 1) / 2;
  const maxRadians = (maxRotateAngle * Math.PI) / 180; // 转换为弧度
  
  visibleItems.forEach((item, index) => {
    // 计算基础角度
    let cardAngle = (index - centerIndex) * (fanAngle / (visibleItems.length - 1));
    
    // 限制最大旋转角度
    if (Math.abs(cardAngle) > maxRadians) {
      cardAngle = cardAngle > 0 ? maxRadians : -maxRadians;
    }
    
    // 计算位置 - 优化坐标公式
    // X轴：围绕容器中心点分布
    const x = containerWidth / 2 + Math.sin(cardAngle) * fanRadius - width / 2;
    
    // Y轴：优化拱形曲线
    // 使用 cos 函数创造中间高两边低的拱形
    // 增加 yOffset 确保卡片整体可见
    const yOffset = containerHeight * 0.45;
    // 调整系数使曲线更明显
    const y = yOffset - Math.cos(cardAngle) * (fanRadius * 0.4) + (Math.abs(index - centerIndex) * 15);
    
    layouts[item.id] = {
      x,
      y,
      rotate: `${(cardAngle * 180 / Math.PI)}deg`,
      rotateY: `${(cardAngle * 180 / Math.PI)}deg`, // 使用 deg 提高兼容性
      index,
      totalCards: visibleItems.length,
    };
  });
  
  return layouts;
};

// GrabModeView 主组件
const GrabModeView = ({ menuItems, theme, selectedCard, setSelectedCardId, navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [containerDimensions, setContainerDimensions] = useState({ width: screenWidth, height: screenHeight });
  
  const cardLayouts = useRef({});
  const cardRefs = useRef({}); // 存储所有卡片的 ref
  const containerViewRef = useRef(null); // 容器组件引用
  const containerLayout = useRef({ x: 0, y: 0, width: 0, height: 0 }); // 容器布局
  
  // 交互状态
  const [lockedCardId, setLockedCardId] = useState(null); // 当前锁定的卡片（处于垂直拖拽模式）
  const dragY = useRef(new Animated.Value(0)).current; // 垂直拖拽的位移值
  const dragYRef = useRef(0); // 用于逻辑判断的实时值
  
  // 监听 dragY 变化
  useEffect(() => {
    const id = dragY.addListener(({ value }) => {
      dragYRef.current = value;
    });
    return () => dragY.removeListener(id);
  }, []);

  // 获取可见项目
  const visibleItems = useMemo(() => 
    menuItems.filter(item => item.visible), 
    [menuItems]
  );
  
  // 计算卡片布局（缓存）
  const currentLayouts = useMemo(() => 
    calculateCardLayouts(visibleItems, containerDimensions.width, containerDimensions.height),
    [visibleItems, containerDimensions]
  );
  
  // 更新布局引用
  useEffect(() => {
    cardLayouts.current = currentLayouts;
  }, [currentLayouts]);
  
  // 计算选择阈值
  const selectionThreshold = useMemo(
    () => Math.min(screenWidth, screenHeight) * CARD_CONFIG.selectionThresholdRatio,
    [screenWidth, screenHeight]
  );
  
  // 查找悬停的卡片
  const findHoveredCard = useCallback((pageX, pageY) => {
    // 如果已锁定卡片，则不进行切换
    if (lockedCardId) return;

    // 将 pageX/pageY 转换为相对于容器的坐标
    const relativeX = pageX - containerLayout.current.x;
    const relativeY = pageY - containerLayout.current.y;
    
    let closestCardId = null;
    let minDistance = Infinity;
    
    Object.keys(cardLayouts.current).forEach(id => {
      const layout = cardLayouts.current[id];
      if (!layout) return;
      
      // 计算卡片中心点
      const centerX = layout.x + CARD_CONFIG.width / 2;
      const centerY = layout.y + CARD_CONFIG.height / 2;
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
      );
      
      // 更新最近卡片
      if (distance < minDistance && distance < selectionThreshold) {
        minDistance = distance;
        closestCardId = id;
      }
    });
    
    // 设置选中卡片
    if (closestCardId && selectedCard !== closestCardId) {
      setSelectedCardId(closestCardId);
    } else if (!closestCardId && selectedCard) {
      // 只有距离过远才取消选中，增加一点粘性
      if (minDistance > selectionThreshold * 1.5) {
        setSelectedCardId(null);
      }
    }
  }, [selectedCard, selectionThreshold, setSelectedCardId, lockedCardId]);
  
  // PanResponder 配置
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        // 立即触发一次选中检测，确保点击即选中
        findHoveredCard(
          evt.nativeEvent.pageX, 
          evt.nativeEvent.pageY
        );
        // 重置拖拽状态
        dragY.setValue(0);
        setLockedCardId(null);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        
        // 逻辑分支：锁定模式 vs 切换模式
        if (lockedCardId) {
          // --- 锁定模式：只处理垂直拖拽 ---
          // 限制向下拖拽（不能低于原位太多）
          const newDragY = dy < 0 ? dy : dy * 0.3; 
          dragY.setValue(newDragY);
        } else {
          // --- 切换模式：检测是否应该进入锁定模式 ---
          // 条件：有选中卡片 + 向上滑动明显 + 垂直位移大于水平位移
          if (selectedCard && dy < CARD_CONFIG.lockDragThreshold && Math.abs(dy) > Math.abs(dx)) {
            setLockedCardId(selectedCard);
            // 初始赋予当前的 dy 值，保证平滑过渡
            dragY.setValue(dy);
          } else {
            // 继续常规的卡片切换检测
            findHoveredCard(
              evt.nativeEvent.pageX, 
              evt.nativeEvent.pageY
            );
          }
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        
        if (selectedCard) {
          // 判断是否触发进入：必须是锁定状态 且 上滑距离超过阈值
          const shouldEnter = lockedCardId === selectedCard && dy < CARD_CONFIG.pullToOpenThreshold;
          
          if (shouldEnter) {
            const selectedItem = visibleItems.find(item => item.id === selectedCard);
            if (selectedItem) {
              // 播放释放动画并跳转
              const cardRef = cardRefs.current[selectedCard];
              if (cardRef && cardRef.playReleaseAnimation) {
                cardRef.playReleaseAnimation(() => {
                  navigation.navigate(selectedItem.screen);
                  // 动画完成后重置状态
                  setTimeout(() => {
                    setSelectedCardId(null);
                    setLockedCardId(null);
                    dragY.setValue(0);
                  }, 100);
                });
              } else {
                navigation.navigate(selectedItem.screen);
              }
            }
          } else {
            // 未触发进入，回弹复位
            Animated.spring(dragY, {
              toValue: 0,
              friction: 5,
              useNativeDriver: true
            }).start(() => {
              setLockedCardId(null);
            });
          }
        } else {
          setSelectedCardId(null);
          setLockedCardId(null);
        }
      },
      
      onPanResponderTerminate: () => {
        setSelectedCardId(null);
        setLockedCardId(null);
        dragY.setValue(0);
      },
    })
  ).current;
  
  // 空状态处理
  if (visibleItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="folder-open-outline" size={60} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          暂无可用的抓取卡片
        </Text>
      </View>
    );
  }
  
  return (
    <View 
      ref={containerViewRef}
      style={[
        styles.cardGrabModeContainer, 
        { backgroundColor: theme.background }
      ]} 
      {...panResponder.panHandlers}
      onLayout={() => {
        if (containerViewRef.current) {
          containerViewRef.current.measure((x, y, width, height, pageX, pageY) => {
            containerLayout.current = { x: pageX, y: pageY, width, height };
            if (width > 0 && height > 0 && (width !== containerDimensions.width || height !== containerDimensions.height)) {
              setContainerDimensions({ width, height });
            }
          });
        }
      }}
    >
      {visibleItems.map((item) => (
        <GrabCard
          key={item.id}
          ref={el => cardRefs.current[item.id] = el}
          item={item}
          theme={theme}
          isSelected={selectedCard === item.id}
          layout={currentLayouts[item.id]}
          dragY={dragY} // 传入共享的拖拽值
        />
      ))}
      
      {/* 提示文本 - 当用户开始上滑时显示 */}
      {lockedCardId && (
        <Animated.View style={[
          styles.hintContainer, 
          { 
            opacity: dragY.interpolate({
              inputRange: [-150, -50],
              outputRange: [1, 0],
              extrapolate: 'clamp'
            }) 
          }
        ]}>
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            松手进入
          </Text>
          <Ionicons name="arrow-up" size={20} color={theme.textSecondary} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 容器样式
  cardGrabModeContainer: { 
    flex: 1, 
    minHeight: 500, 
    position: 'relative',
    paddingTop: 50,
    overflow: 'visible',
  },
  
  // 提示容器
  hintContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  hintText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  
  // 卡片样式
  cardGrabItem: { 
    position: 'absolute', 
    width: CARD_CONFIG.width, 
    height: CARD_CONFIG.height, 
    padding: 15, 
    borderRadius: 20, // 增加圆角
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
  },
  
  // 卡片内容
  cardContent: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
  },
  
  // 图标
  icon: { 
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40, 
    marginBottom: 16,
  },
  
  // 标题
  menuItemTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8, 
    textAlign: 'center',
  },
});

export default GrabModeView;