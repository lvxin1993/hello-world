import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const MODE_TRADITIONAL = 'traditional';
export const MODE_CUSTOM = 'custom';
export const MODE_ROTATING = 'rotating';
export const MODE_CARD_GRAB = 'cardGrab';

export const ROTATION_DIRECTION_CLOCKWISE = 'clockwise';
export const ROTATION_DIRECTION_COUNTER_CLOCKWISE = 'counterClockwise';

export const ModeContextProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState(MODE_TRADITIONAL);
  const [rotationDirection, setRotationDirection] = useState(ROTATION_DIRECTION_CLOCKWISE);
  const [customMenuItems, setCustomMenuItems] = useState([
    { id: 'timer', title: '睡眠定时器', description: '设置睡眠提醒时间', icon: '⏰', screen: 'SleepTimer', visible: true },
    { id: 'sound', title: '音效库', description: '选择助眠音效', icon: '🎵', screen: 'SoundLibrary', visible: true },
    { id: 'statistics', title: '统计数据', description: '查看睡眠统计', icon: '📊', screen: 'Statistics', visible: true },
    { id: 'visual', title: '视觉辅助', description: '助眠视觉效果', icon: '🌈', screen: 'VisualAid', visible: true },
    { id: 'dream', title: '梦境日志', description: '记录梦境', icon: '📝', screen: 'DreamJournal', visible: true },
    { id: 'community', title: '社区', description: '加入睡眠社区', icon: '👥', screen: 'Community', visible: true },
    { id: 'profile', title: '个人资料', description: '管理个人信息', icon: '👤', screen: 'Profile', visible: true },
    { id: 'settings', title: '设置', description: '调整应用设置', icon: '⚙️', screen: 'Settings', visible: true },
    { id: 'feedback', title: '反馈意见', description: '向我们反馈您的建议', icon: '💬', screen: 'Feedback', visible: true },
  ]);
  const [hiddenMenuItems, setHiddenMenuItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // 切换模式
  const toggleMode = (mode) => {
    setCurrentMode(mode);
    setSelectedCard(null); // 切换模式时重置选中卡片
  };

  // 切换旋转方向
  const toggleRotationDirection = () => {
    setRotationDirection(prev => 
      prev === ROTATION_DIRECTION_CLOCKWISE 
        ? ROTATION_DIRECTION_COUNTER_CLOCKWISE 
        : ROTATION_DIRECTION_CLOCKWISE
    );
  };

  // 切换卡片可见性
  const toggleCardVisibility = (cardId) => {
    // 确保设置卡片不能被删除
    if (cardId === 'settings') {
      return;
    }
    
    setCustomMenuItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === cardId) {
          const newItem = { ...item, visible: !item.visible };
          if (!newItem.visible) {
            setHiddenMenuItems(prevHidden => [...prevHidden, newItem]);
          }
          return newItem;
        }
        return item;
      });
      return updatedItems.filter(item => item.visible);
    });
    
    // 从隐藏列表中移除如果重新显示
    setHiddenMenuItems(prev => prev.filter(item => item.id !== cardId));
  };

  // 将隐藏卡片移回自定义列表
  const restoreHiddenCard = (cardId) => {
    setHiddenMenuItems(prev => {
      const cardToRestore = prev.find(item => item.id === cardId);
      if (cardToRestore) {
        setCustomMenuItems(prevCustom => [...prevCustom, { ...cardToRestore, visible: true }]);
      }
      return prev.filter(item => item.id !== cardId);
    });
  };

  // 重新排序卡片
  const reorderCards = (startIndex, endIndex) => {
    setCustomMenuItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // 设置选中卡片（用于抓牌模式）
  const setSelectedCardId = (cardId) => {
    setSelectedCard(cardId);
  };

  return (
    <ModeContext.Provider
      value={{
        currentMode,
        rotationDirection,
        customMenuItems,
        hiddenMenuItems,
        selectedCard,
        toggleMode,
        toggleRotationDirection,
        toggleCardVisibility,
        restoreHiddenCard,
        reorderCards,
        setSelectedCardId,
        modes: {
          traditional: MODE_TRADITIONAL,
          custom: MODE_CUSTOM,
          rotating: MODE_ROTATING,
          cardGrab: MODE_CARD_GRAB,
        },
        rotationDirections: {
          clockwise: ROTATION_DIRECTION_CLOCKWISE,
          counterClockwise: ROTATION_DIRECTION_COUNTER_CLOCKWISE,
        },
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useModeContext = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useModeContext must be used within a ModeContextProvider');
  }
  return context;
};
