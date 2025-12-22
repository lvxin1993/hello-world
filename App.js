import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContextProvider, useThemeContext } from './src/context/ThemeContext';
import { ModeContextProvider } from './src/context/ModeContext';
import { SleepContextProvider } from './src/context/SleepContext';
import { DreamJournalContextProvider } from './src/context/DreamJournalContext';
import { UserProfileContextProvider, useUserProfile } from './src/context/UserProfileContext';

// 导入组件
import HomeScreen from './src/screens/HomeScreen';
import SleepTimerScreen from './src/screens/SleepTimerScreen';
import SoundLibraryScreen from './src/screens/SoundLibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DreamJournalScreen from './src/screens/DreamJournalScreen';
import UserProfileSetupScreen from './src/screens/UserProfileSetupScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 底部标签导航
const MainTabs = () => {
  const { theme } = useThemeContext();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DreamJournal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary, // 使用主题的主色调
        tabBarInactiveTintColor: theme.textSecondary,   // 使用主题的次要文本颜色
        tabBarStyle: {
          backgroundColor: theme.card, // 使用主题的卡片颜色
        },
        tabBarLabelStyle: {
          color: theme.text, // 使用主题的文本颜色
        },
        headerShown: false, // 隐藏所有标签页的顶部标题栏
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '主页' }} />
      <Tab.Screen name="DreamJournal" component={DreamJournalScreen} options={{ title: '梦境日志' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '个人资料' }} />
    </Tab.Navigator>
  );
};

// 主应用组件
const MainApp = () => {
  const { isLoading, shouldShowProfileSetup } = useUserProfile();
  const { theme } = useThemeContext();

  if (isLoading) {
    return null; // 或者显示加载指示器
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {shouldShowProfileSetup() ? (
        <Stack.Screen 
          name="UserProfileSetup" 
          component={UserProfileSetupScreen} 
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} // 隐藏 Stack 导航器为 Tabs 分配的标题栏
          />
          <Stack.Screen name="SleepTimer" component={SleepTimerScreen} options={{ title: '睡眠定时器' }} />
          <Stack.Screen name="SoundLibrary" component={SoundLibraryScreen} options={{ title: '音效库' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
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
  );
}
