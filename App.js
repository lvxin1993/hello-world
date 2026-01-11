import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
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
import NovelSearchScreen from './src/screens/NovelSearchScreen';
import StatisticsScreen from './src/screens/StatisticsScreen'; // 确保已导入
import FeedbackScreen from './src/screens/FeedbackScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'DreamJournal') iconName = focused ? 'book' : 'book-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1e90ff',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: '主页' }} />
    <Tab.Screen name="DreamJournal" component={DreamJournalScreen} options={{ title: '梦境日志' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '个人资料' }} />
  </Tab.Navigator>
);

const MainApp = () => {
  const { isLoading, shouldShowProfileSetup } = useUserProfile();

  if (isLoading) {
    return null; 
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {shouldShowProfileSetup() ? (
        <Stack.Screen name="UserProfileSetup" component={UserProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SleepTimer" component={SleepTimerScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ListeningHub" component={ListeningHubScreen} />
          <Stack.Screen name="SoundLibrary" component={SoundLibraryScreen} />
          <Stack.Screen name="AudiobookLibrary" component={AudiobookLibraryScreen} />
          <Stack.Screen name="AudiobookPlayer" component={AudiobookPlayerScreen} />
          <Stack.Screen name="NovelSearch" component={NovelSearchScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

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

const styles = StyleSheet.create({
    webContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
    webMobileView: { width: 390, height: 844, borderRadius: 30, overflow: 'hidden', boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.5)', border: '10px solid #111' }
});