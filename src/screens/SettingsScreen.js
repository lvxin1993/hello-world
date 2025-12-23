import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';
import { useSleepContext } from '../context/SleepContext';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveSize, spacing } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons'; // 1. 导入图标库

const SettingsScreen = () => {
  const { theme, toggleTheme, currentTheme } = useThemeContext();
  const {
    currentMode,
    toggleMode,
    rotationDirection,
    toggleRotationDirection,
    customMenuItems,
    hiddenMenuItems,
    toggleCardVisibility,
    restoreHiddenCard,
    reorderCards,
    pinCard
  } = useModeContext();
  const navigation = useNavigation();
  const { sleepRecord, updateSleepRecord } = useSleepContext();
  
  const [showHiddenCards, setShowHiddenCards] = useState(true);
  
  const visibleCards = customMenuItems.filter(item => item.visible);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* 2. 添加自定义 Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>设置</Text>
            <View style={styles.headerButton} />{/* 占位，保持标题居中 */}
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
            {/* Theme Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>主题</Text>
                <TouchableOpacity 
                style={[styles.optionButton, { backgroundColor: theme.card }]} 
                onPress={toggleTheme}
                >
                <Text style={[styles.optionText, { color: theme.text }]}>
                    {currentTheme === 'light' ? '切换到深色主题' : '切换到浅色主题'}
                </Text>
                </TouchableOpacity>
            </View>
            
            {/* Mode Section */}
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
                        styles.optionText, 
                        { color: currentMode === MODE_TRADITIONAL ? '#fff' : theme.text }
                        ]}>传统</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                        styles.optionButton, 
                        { backgroundColor: currentMode === MODE_ROTATING ? theme.primary : theme.card }
                        ]} 
                        onPress={() => toggleMode(MODE_ROTATING)}
                    >
                        <Text style={[
                        styles.optionText, 
                        { color: currentMode === MODE_ROTATING ? '#fff' : theme.text }
                        ]}>旋转</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                        styles.optionButton, 
                        { backgroundColor: currentMode === MODE_CARD_GRAB ? theme.primary : theme.card }
                        ]} 
                        onPress={() => toggleMode(MODE_CARD_GRAB)}
                    >
                        <Text style={[
                        styles.optionText, 
                        { color: currentMode === MODE_CARD_GRAB ? '#fff' : theme.text }
                        ]}>抓取</Text>
                    </TouchableOpacity>
                </View>
                
                {currentMode === MODE_ROTATING && (
                <TouchableOpacity 
                    style={[styles.optionButtonWide, { backgroundColor: theme.card, marginTop: spacing(15) }]} 
                    onPress={toggleRotationDirection}
                >
                    <Text style={[styles.optionText, { color: theme.text }]}>
                    旋转方向: {rotationDirection === 'clockwise' ? '顺时针' : '逆时针'}
                    </Text>
                </TouchableOpacity>
                )}
            </View>
      
            {/* ... rest of the settings page remains the same ... */}
            <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>我的卡片</Text>
        
        <View style={styles.cardManagementSection}>
          <View style={[styles.cardSectionHeader, { backgroundColor: theme.card }]}>
            <View style={styles.cardSectionHeaderContent}>
              <Text style={[styles.cardSectionTitle, { color: theme.text }]}>可见卡片</Text>
              <Text style={[styles.cardCount, { color: theme.textSecondary }]}>({visibleCards.length})</Text>
            </View>
          </View>
          
          {visibleCards.length > 0 ? (
            <View style={styles.cardList}>
              {visibleCards.map((card, index) => (
                <View key={card.id} style={[styles.cardItem, { backgroundColor: theme.card }]}>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{card.description}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.pinButton]} 
                      onPress={() => pinCard(index)}
                    >
                      <Text style={styles.actionButtonText}>置顶</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.hideButton]} 
                      onPress={() => toggleCardVisibility(card.id)}
                    >
                      <Text style={styles.actionButtonText}>隐藏</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noCardsText, { color: theme.textSecondary }]}>没有可见卡片</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.cardSectionHeader, { backgroundColor: theme.card, marginTop: spacing(20) }]} 
          onPress={() => setShowHiddenCards(!showHiddenCards)}
        >
          <View style={styles.cardSectionHeaderContent}>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>隐藏卡片</Text>
            <Text style={[styles.cardCount, { color: theme.textSecondary }]}>({hiddenMenuItems.length})</Text>
          </View>
          <Text style={[styles.arrowIcon, { color: theme.textSecondary }]}>
            {showHiddenCards ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {showHiddenCards && hiddenMenuItems.length > 0 && (
          <View style={styles.cardList}>
            {hiddenMenuItems.map((card, index) => (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: theme.card, opacity: 0.8 }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
                  <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{card.description}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.restoreButton]} 
                    onPress={() => restoreHiddenCard(card.id)}
                  >
                    <Text style={styles.actionButtonText}>恢复</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {showHiddenCards && hiddenMenuItems.length === 0 && (
          <Text style={[styles.noCardsText, { color: theme.textSecondary }]}>没有隐藏卡片</Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>睡眠设置</Text>
        <TouchableOpacity 
          style={[styles.optionButtonWide, { backgroundColor: theme.card }]} 
          onPress={() => navigation.navigate('SleepTimer')}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>睡眠定时器</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>关于</Text>
        <View style={styles.aboutInfo}>
          <Text style={[styles.aboutText, { color: theme.text }]}>版本: 1.0.0</Text>
          <Text style={[styles.aboutText, { color: theme.text }]}>开发者: 梦境探索团队</Text>
        </View>
      </View>
        </ScrollView>
    </View>
  );
};

// 3. 更新 StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, 
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e020'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerButton: {
      padding: 5,
      minWidth: 30, // 确保按钮有最小宽度
  },
  contentContainer: {
    padding: spacing(20),
    paddingBottom: spacing(40),
  },
  section: { marginBottom: spacing(30) },
  sectionTitle: { fontSize: responsiveFontSize(20), fontWeight: 'bold', marginBottom: spacing(15) },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionButton: { width: '32%', padding: spacing(15), borderRadius: responsiveSize(12), marginBottom: spacing(15), alignItems: 'center', elevation: 3 },
  optionButtonWide: { width: '100%', padding: spacing(15), borderRadius: responsiveSize(12), marginBottom: spacing(15), alignItems: 'center', elevation: 3 },
  optionText: { fontSize: responsiveFontSize(16), fontWeight: '500' },
  aboutInfo: { padding: spacing(15), borderRadius: responsiveSize(12) },
  aboutText: { fontSize: responsiveFontSize(16), marginBottom: spacing(5) },
  cardManagementSection: { marginBottom: 20 },
  cardSectionTitle: { fontSize: 16, fontWeight: 'bold' },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardDescription: { fontSize: 14 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  hideButton: { backgroundColor: '#E0E0E0' },
  pinButton: { backgroundColor: '#4A90E2' },
  restoreButton: { backgroundColor: '#4CAF50' },
  actionButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  noCardsText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: 20 },
  cardSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 10 },
  cardSectionHeaderContent: { flexDirection: 'row', alignItems: 'center' },
  cardCount: { fontSize: 14, marginLeft: 8 },
  arrowIcon: { fontSize: 14, fontWeight: 'bold' },
  cardList: { marginLeft: 10 },
});

export default SettingsScreen;