import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native'; // 1. 导入 Platform, StyleSheet, View
import { ThemeContextProvider } from './src/context/ThemeContext';
import { ModeContextProvider } from './src/context/ModeContext';
import { SleepContextProvider } from './src/context/SleepContext';
import { DreamJournalContextProvider } from './src/context/DreamJournalContext';
import { UserProfileContextProvider, useUserProfile } from './src/context/UserProfileContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// 导入组件
import HomeScreen from './src/screens/HomeScreen';
import SleepTimerScreen from './src/screens/SleepTimerScreen';
import SoundLibraryScreen from './src/screens/SoundLibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DreamJournalScreen from './src/screens/DreamJournalScreen';
import UserProfileSetupScreen from './src/screens/UserProfileSetupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ListeningHubScreen from './src/screens/ListeningHubScreen';
import AudiobookLibraryScreen from './src/screens/AudiobookLibraryScreen';
import AudiobookPlayerScreen from './src/screens/AudiobookPlayerScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (/* ... */);
const MainApp = () => { /* ... */ };

// 2. 将所有 Context 和导航容器包裹在一个单独的组件中
const RootView = () => (
    <ErrorBoundary>
      <ThemeContextProvider>
        <ModeContextProvider>
          <SleepContextProvider>
            <DreamJournalContextProvider>
              <UserProfileContextProvider>
                <NavigationContainer>
                  <MainApp />
                </NavigationContainer>
              </UserProfileContextProvider>
            </DreamJournalContextProvider>
          </SleepContextProvider>
        </ModeContextProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
);

export default function App() {
  // 3. 添加平台判断
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webMobileView}>
            <RootView />
        </View>
      </View>
    );
  }

  return <RootView />;
}

// 4. 添加只在网页端生效的样式
const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
    },
    webMobileView: {
        width: 390,
        height: 844,
        borderRadius: 30,
        overflow: 'hidden',
        boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.5)',
        border: '10px solid #111',
    }
});