import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';
import MenuCard from '../components/MenuCard';
import RotatingModeView from '../components/RotatingModeView_optimized';
import GrabModeView from '../components/GrabModeView';

const HomeScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { currentMode, rotationDirection, toggleRotationDirection, customMenuItems, selectedCard, setSelectedCardId } = useModeContext();

  const renderCardMode = () => (
     <View style={styles.traditionalModeContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>功能卡片</Text>
      </View>
      <View style={styles.menuGrid}>
        {customMenuItems.filter(item => item.visible).map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <MenuCard 
              item={item} 
              onPress={() => navigation.navigate(item.screen)} 
              style={{flex: 1}} // 确保 MenuCard 填满 wrapper
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderCurrentMode = () => {
    const visibleItems = customMenuItems.filter(item => item.visible);
    
    // 调试信息
    console.log('HomeScreen - Current Mode:', currentMode);
    console.log('HomeScreen - Visible Items:', visibleItems.length);
    console.log('HomeScreen - Items:', visibleItems);

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
    : ['#fdeff9', '#e3e3e3', '#f5efe6'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
        <View style={[styles.decorativeCircle, { top: '10%', left: '-20%', width: 300, height: 300, backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.decorativeCircle, { top: '40%', right: '-30%', width: 400, height: 400, backgroundColor: theme.secondary + '08' }]} />
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>SleepWell</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>助你拥有良好睡眠</Text>
            </View>
            {renderCurrentMode()}
        </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center', marginBottom: 10, backgroundColor: 'transparent' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: 10 },
  // 终极修复：使用固定的高度和更小的宽度
  cardWrapper: { 
      width: '46%', 
      height: 190, 
      marginBottom: 20,
      marginHorizontal: '2%'
    },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  traditionalModeContainer: { padding: 10, backgroundColor: 'transparent' },
  decorativeCircle: { position: 'absolute', borderRadius: 400, opacity: 0.3 },
});

export default HomeScreen;
