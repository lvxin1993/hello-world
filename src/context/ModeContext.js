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
    { id: 'sound', title: '聆听', description: '纯净音效与有声读物', icon: '🎧', screen: 'ListeningHub', visible: true },
    { id: 'statistics', title: '统计数据', description: '查看睡眠和梦境统计', icon: '📊', screen: 'Statistics', visible: true },
    { id: 'visual', title: '视觉辅助', description: '助眠视觉效果', icon: '🌈', screen: 'VisualAid', visible: true },
    // 1. 优化命名
    { id: 'dream', title: '梦境空间', description: '记录、分析并探索你的梦境世界', icon: '📝', screen: 'DreamJournal', visible: true },
    { id: 'community', title: '社区', description: '加入睡眠社区', icon: '👥', screen: 'Community', visible: true },
    { id: 'profile', title: '个人资料', description: '管理个人信息', icon: '👤', screen: 'Profile', visible: true },
    { id: 'settings', title: '设置', description: '调整应用设置', icon: '⚙️', screen: 'Settings', visible: true },
    { id: 'feedback', title: '反馈意见', description: '通过邮箱或微信联系我们', icon: '💬', screen: 'Feedback', visible: true },
  ]);
  const [hiddenMenuItems, setHiddenMenuItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // ... (rest of the context functions remain the same)
  const toggleMode = (mode) => {
    setCurrentMode(mode);
    setSelectedCard(null); // 切换模式时重置选中卡片
  };

  const toggleRotationDirection = () => {
    setRotationDirection(prev => 
      prev === ROTATION_DIRECTION_CLOCKWISE 
        ? ROTATION_DIRECTION_COUNTER_CLOCKWISE 
        : ROTATION_DIRECTION_CLOCKWISE
    );
  };

   const toggleCardVisibility = (cardId) => {
     if (cardId === 'settings') {
       return;
     }
     const currentCard = customMenuItems.find(item => item.id === cardId);
     if (currentCard) {
       if (currentCard.visible) {
         setCustomMenuItems(prev => prev.map(item =>
           item.id === cardId ? { ...item, visible: false } : item
         ));
         setHiddenMenuItems(prev => [...prev, { ...currentCard, visible: false }]);
       } else {
         setCustomMenuItems(prev => prev.map(item =>
           item.id === cardId ? { ...item, visible: true } : item
         ));
         setHiddenMenuItems(prev => prev.filter(item => item.id !== cardId));
       }
     }
   };

  const restoreHiddenCard = (cardId) => {
    setHiddenMenuItems(prev => {
      const cardToRestore = prev.find(item => item.id === cardId);
      if (cardToRestore) {
        setCustomMenuItems(prevCustom => [...prevCustom, { ...cardToRestore, visible: true }]);
      }
      return prev.filter(item => item.id !== cardId);
    });
  };

  const reorderCards = (startIndex, endIndex) => {
    setCustomMenuItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const pinCard = (index) => {
    setCustomMenuItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(index, 1);
      result.unshift(removed);
      return result;
    });
  };

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
        pinCard,
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
