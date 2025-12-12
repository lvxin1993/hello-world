import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';

const SettingsScreen = () => {
  const { getTheme } = useThemeContext();
  const { 
    currentMode, 
    toggleMode, 
    rotationDirection, 
    toggleRotationDirection,
    customMenuItems,
    hiddenMenuItems,
    toggleCardVisibility,
    restoreHiddenCard,
    reorderCards
  } = useModeContext();
  
  const theme = getTheme().colors;
  const [dragFromIndex, setDragFromIndex] = useState(null);
  const [showAllCards, setShowAllCards] = useState(true);
  const [showVisibleCards, setShowVisibleCards] = useState(true);
  const [showHiddenCards, setShowHiddenCards] = useState(true);

  // 置顶卡片
  const pinCard = (index) => {
    if (index === 0) return; // 已经是第一个
    
    // 调用reorderCards函数，将卡片从当前位置移到第一个位置
    reorderCards(index, 0);
  };

  // 展开/全部隐藏卡片
  const toggleAllCardsVisibility = () => {
    if (showAllCards) {
      // 全部隐藏（除了设置卡片）
      customMenuItems.forEach(item => {
        if (item.id !== 'settings') {
          toggleCardVisibility(item.id);
        }
      });
    } else {
      // 全部展开
      hiddenMenuItems.forEach(item => {
        restoreHiddenCard(item.id);
      });
    }
    
    // 切换状态
    setShowAllCards(!showAllCards);
  };

  // 开始拖拽
  const handleLongPress = (index) => {
    setDragFromIndex(index);
    Alert.alert('功能提示', `开始拖拽卡片 ${index}`);
  };

  // 结束拖拽
  const handlePress = (toIndex) => {
    if (dragFromIndex !== null && dragFromIndex !== toIndex) {
      Alert.alert('功能提示', `将卡片从 ${dragFromIndex} 拖到 ${toIndex}`);
      // 实际更新卡片顺序
      reorderCards(dragFromIndex, toIndex);
    }
    setDragFromIndex(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>设置</Text>
      
      {/* 显示模式设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>显示模式</Text>
        <View style={styles.optionGrid}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: currentMode === MODE_TRADITIONAL ? theme.primary : theme.card }
            ]}
            onPress={() => toggleMode(MODE_TRADITIONAL)}
          >
            <Text style={[
              styles.optionButtonText,
              { color: currentMode === MODE_TRADITIONAL ? '#FFFFFF' : theme.text }
            ]}>传统模式</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: currentMode === MODE_ROTATING ? theme.primary : theme.card }
            ]}
            onPress={() => toggleMode(MODE_ROTATING)}
          >
            <Text style={[
              styles.optionButtonText,
              { color: currentMode === MODE_ROTATING ? '#FFFFFF' : theme.text }
            ]}>转动模式</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: currentMode === MODE_CARD_GRAB ? theme.primary : theme.card }
            ]}
            onPress={() => toggleMode(MODE_CARD_GRAB)}
          >
            <Text style={[
              styles.optionButtonText,
              { color: currentMode === MODE_CARD_GRAB ? '#FFFFFF' : theme.text }
            ]}>抓牌模式</Text>
          </TouchableOpacity>
        </View>
        
        {/* 转动模式设置 */}
        {currentMode === MODE_ROTATING && (
          <View style={styles.subSection}>
            <Text style={[styles.subSectionTitle, { color: theme.text }]}>转动方向</Text>
            <TouchableOpacity
              style={[styles.directionButton, { backgroundColor: theme.primary }]}
              onPress={toggleRotationDirection}
            >
              <Text style={styles.directionButtonText}>
                当前: {rotationDirection === 'clockwise' ? '顺时针' : '逆时针'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* 卡片管理设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>卡片管理</Text>
        
        {/* 展开/全部隐藏卡片内容按钮 */}
        <View style={styles.cardControls}>
          <TouchableOpacity
            style={[styles.expandButton, { backgroundColor: theme.primary, marginRight: 10 }]}
            onPress={toggleAllCardsVisibility}
          >
            <Text style={styles.expandButtonText}>
              {showAllCards ? '全部隐藏卡片' : '展开所有卡片'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 显示的卡片 - 可展开/折叠 */}
        <View style={styles.cardManagementSection}>
          {/* 可点击的标题，用于展开/折叠 */}
          <TouchableOpacity
            style={styles.cardSectionHeader}
            onPress={() => setShowVisibleCards(!showVisibleCards)}
          >
            <View style={styles.cardSectionHeaderContent}>
              <Text style={[styles.cardSectionTitle, { color: theme.text }]}>显示的卡片</Text>
              <Text style={[styles.cardCount, { color: theme.textSecondary }]}>({customMenuItems.length})</Text>
            </View>
            <Text style={[styles.arrowIcon, { color: theme.textSecondary }]}>
              {showVisibleCards ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {/* 显示的卡片列表 */}
          {showVisibleCards && (
            <View style={styles.cardList}>
              {customMenuItems.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[styles.cardItem, { backgroundColor: theme.card }]}
                  onPress={() => handlePress(index)}
                  onLongPress={() => handleLongPress(index)}
                  delayLongPress={500}
                >
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    {item.id !== 'settings' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.hideButton, { backgroundColor: theme.secondary }]}
                        onPress={() => toggleCardVisibility(item.id)}
                      >
                        <Text style={styles.actionButtonText}>隐藏</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.pinButton, { backgroundColor: theme.primary }]}
                      onPress={() => pinCard(index)}
                      disabled={index === 0}
                    >
                      <Text style={styles.actionButtonText}>置顶</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        
        {/* 隐藏的卡片 - 可展开/折叠 */}
        <View style={styles.cardManagementSection}>
          {/* 可点击的标题，用于展开/折叠 */}
          <TouchableOpacity
            style={styles.cardSectionHeader}
            onPress={() => setShowHiddenCards(!showHiddenCards)}
          >
            <View style={styles.cardSectionHeaderContent}>
              <Text style={[styles.cardSectionTitle, { color: theme.text }]}>隐藏的卡片</Text>
              <Text style={[styles.cardCount, { color: theme.textSecondary }]}>({hiddenMenuItems.length})</Text>
            </View>
            <Text style={[styles.arrowIcon, { color: theme.textSecondary }]}>
              {showHiddenCards ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {/* 隐藏的卡片列表 */}
          {showHiddenCards && (
            <View style={styles.cardList}>
              {hiddenMenuItems.length > 0 ? (
                hiddenMenuItems.map((item) => (
                  <View key={item.id} style={[styles.cardItem, { backgroundColor: theme.card }]}>
                    <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text, opacity: 0.7 }]}>{item.title}</Text>
                  </View>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.restoreButton, { backgroundColor: theme.primary }]}
                      onPress={() => restoreHiddenCard(item.id)}
                    >
                      <Text style={styles.actionButtonText}>恢复</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.noCardsText, { color: theme.textSecondary }]}>没有隐藏的卡片</Text>
              )}
            </View>
          )}
        </View>
      </View>
      
      {/* 主题设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>主题设置</Text>
        <View style={styles.optionGrid}>
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: theme.card }]}>
            <Text style={[styles.optionButtonText, { color: theme.text }]}>浅色主题</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: theme.card }]}>
            <Text style={[styles.optionButtonText, { color: theme.text }]}>深色主题</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.optionButton, { backgroundColor: theme.card }]}>
            <Text style={[styles.optionButtonText, { color: theme.text }]}>自动主题</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 通知设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>通知设置</Text>
        <View style={styles.optionList}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>睡眠提醒</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>已开启</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>每日统计</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>已开启</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>社区通知</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>已关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 音效设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>音效设置</Text>
        <View style={styles.optionList}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>默认铃声</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>海洋声</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>音量</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>70%</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 关于 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>关于</Text>
        <View style={styles.optionList}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>版本</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: theme.text }]}>开发者</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>SleepWell Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '32%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionList: {
    backgroundColor: 'transparent',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
  },
  optionValue: {
    fontSize: 14,
  },
  directionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  directionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // 卡片管理样式
  cardManagementSection: {
    marginBottom: 20,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideButton: {
    backgroundColor: '#E0E0E0',
  },
  pinButton: {
    backgroundColor: '#4A90E2',
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noCardsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  // 展开/全部隐藏按钮样式
  expandButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 卡片控制按钮容器
  cardControls: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  // 卡片部分标题栏，可点击展开/折叠
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: theme.background,
    marginBottom: 10,
  },
  cardSectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 卡片数量
  cardCount: {
    fontSize: 14,
    marginLeft: 8,
  },
  // 箭头图标
  arrowIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // 卡片列表容器
  cardList: {
    marginLeft: 10,
  },
});

export default SettingsScreen;