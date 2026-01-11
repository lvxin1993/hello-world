import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';
import MenuCard from '../components/MenuCard';
import RotatingModeView from '../components/RotatingModeView';
import GrabModeView from '../components/GrabModeView';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { currentMode, rotationDirection, toggleRotationDirection, customMenuItems, selectedCard, setSelectedCardId } = useModeContext();
  
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const renderCardMode = () => (
     <Animated.View style={[styles.traditionalModeContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>功能探索</Text>
      </View>
      <View style={styles.menuGrid}>
        {customMenuItems.filter(item => item.visible).map((item, index) => (
          <View key={item.id} style={styles.cardWrapper}>
            <MenuCard 
              item={item} 
              index={index}
              onPress={() => navigation.navigate(item.screen)} 
              style={{flex: 1}} 
            />
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderCurrentMode = () => {
    const visibleItems = customMenuItems.filter(item => item.visible);

    switch (currentMode) {
      case MODE_TRADITIONAL:
        return renderCardMode();
      case MODE_ROTATING:
        return (
          <RotatingModeView 
            menuItems={visibleItems}
            theme={theme}
            navigation={navigation}
            rotationDirection={rotationDirection}
            toggleRotationDirection={toggleRotationDirection}
          />
        );
      case MODE_CARD_GRAB:
        return (
          <GrabModeView 
            menuItems={visibleItems}
            theme={theme}
            navigation={navigation}
            selectedCard={selectedCard}
            setSelectedCardId={setSelectedCardId}
          />
        );
      default:
        return renderCardMode();
    }
  };
  
  const gradientColors = theme.mode === 'dark' 
    ? ['#0f0c29', '#302b63', '#24243e']
    : ['#fdfbfb', '#ebedee']; // 更柔和的亮色渐变

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
        <View style={[styles.decorativeCircle, { top: -100, left: -100, width: 400, height: 400, backgroundColor: theme.primary + '15' }]} />
        <View style={[styles.decorativeCircle, { top: '30%', right: -150, width: 500, height: 500, backgroundColor: theme.secondary + '10' }]} />
        
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: theme.text }]}>{getGreeting()},</Text>
                    <Text style={[styles.title, { color: theme.text }]}>SleepWell</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="moon" size={28} color={theme.primary} />
                </View>
            </View>
            
            <View style={styles.quoteContainer}>
                <Text style={[styles.quoteText, { color: theme.textSecondary }]}>"愿你今晚有个好梦，明天充满活力。"</Text>
            </View>

            {renderCurrentMode()}
        </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
      paddingHorizontal: 24, 
      paddingTop: 60, 
      paddingBottom: 20, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
  },
  greeting: { fontSize: 18, fontWeight: '500', opacity: 0.8, marginBottom: 4 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  quoteContainer: { paddingHorizontal: 24, marginBottom: 30 },
  quoteText: { fontSize: 14, fontStyle: 'italic', opacity: 0.7 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginLeft: 14, marginBottom: 5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 14 },
  cardWrapper: { 
      width: '48%', 
      height: 180, 
      marginBottom: 16,
    },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 10 },
  traditionalModeContainer: { paddingBottom: 20 },
  decorativeCircle: { position: 'absolute', borderRadius: 400, opacity: 0.6 },
});

export default HomeScreen;
