import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import SleepTimerScreen from './src/screens/SleepTimerScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import DreamJournalScreen from './src/screens/DreamJournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SoundLibraryScreen from './src/screens/SoundLibraryScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import VisualAidScreen from './src/screens/VisualAidScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SleepContextProvider } from './src/context/SleepContext';
import { ThemeContextProvider } from './src/context/ThemeContext';
import { ModeContextProvider } from './src/context/ModeContext';

const Stack = createStackNavigator();



export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeContextProvider>
        <ModeContextProvider>
          <SleepContextProvider>
            <NavigationContainer
              // 移除自定义主题，让React Navigation使用默认主题
            >
              <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SleepWell' }} />
                <Stack.Screen name="SleepTimer" component={SleepTimerScreen} options={{ title: '睡眠定时器' }} />
                <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: '反馈意见' }} />
                <Stack.Screen name="Community" component={CommunityScreen} options={{ title: '社区' }} />
                <Stack.Screen name="DreamJournal" component={DreamJournalScreen} options={{ title: '梦境日志' }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '个人资料' }} />
                <Stack.Screen name="SoundLibrary" component={SoundLibraryScreen} options={{ title: '音效库' }} />
                <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: '统计数据' }} />
                <Stack.Screen name="VisualAid" component={VisualAidScreen} options={{ title: '视觉辅助' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </SleepContextProvider>
        </ModeContextProvider>
      </ThemeContextProvider>
    </SafeAreaProvider>
  );
}