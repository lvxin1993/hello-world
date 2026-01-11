import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons'; // 1. 导入图标库
import { useNavigation } from '@react-navigation/native'; // 导入 useNavigation

const SleepTimerScreen = () => {
  const { theme, getTheme } = useThemeContext();
  const navigation = useNavigation(); // 获取 navigation 对象
  const {
    timerMode,
    timerDuration,
    isTimerRunning,
    remainingTime,
    notificationPermission,
    alarmSound,
    targetTime,
    repeatMode,
    setTimer,
    updateTimerMode,
    updateTimePoint,
    updateRepeatMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setAlarmSoundPreference,
  } = useSleepContext();

  // ... (rest of the component remains the same)
  const timeOptions = [15, 30, 45, 60, 90, 120];
  const soundOptions = [
    { id: 'default', name: '默认铃声', emoji: '🔔' },
    { id: 'bell', name: '经典铃声', emoji: '🔔' },
    { id: 'birds', name: '鸟鸣', emoji: '🐦' },
    { id: 'ocean', name: '海浪', emoji: '🌊' },
    { id: 'wind', name: '风声', emoji: '🍃' },
    { id: 'rain', name: '雨声', emoji: '🌧️' },
  ];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限请求', '请在系统设置中允许通知权限，以便使用定时功能', [{ text: '确定' }]);
    }
  };
  const handleStart = () => {
    if (notificationPermission !== 'granted') {
      requestPermission();
      return;
    }
    startTimer();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* 2. 添加自定义 Header */}
        <View style={[styles.header, { borderBottomColor: theme.border + '50'}]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>睡眠定时器</Text>
            <View style={styles.headerButton} />{/* 占位符 */}
        </View>
        <ScrollView style={styles.content}>
            {/* 计时器显示 */}
            <View style={[styles.timerDisplay, { backgroundColor: theme.card }]}>
            <Text style={[styles.timerText, { color: theme.text }]}>
                {formatTime(remainingTime)}
            </Text>
            </View>

            {/* 模式切换选项卡 */}
            <View style={styles.modeTabs}>
            <TouchableOpacity
                style={[
                styles.modeTab,
                {
                    backgroundColor: timerMode === 'interval'
                    ? theme.primary
                    : theme.card,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                },
                ]}
                onPress={() => updateTimerMode('interval')}
                disabled={isTimerRunning}
            >
                <Text
                style={[
                    styles.modeTabText,
                    {
                    color: timerMode === 'interval'
                        ? '#FFFFFF'
                        : theme.text,
                    },
                ]}
                >
                间隔时间
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                styles.modeTab,
                {
                    backgroundColor: timerMode === 'timePoint'
                    ? theme.primary
                    : theme.card,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                },
                ]}
                onPress={() => updateTimerMode('timePoint')}
                disabled={isTimerRunning}
            >
                <Text
                style={[
                    styles.modeTabText,
                    {
                    color: timerMode === 'timePoint'
                        ? '#FFFFFF'
                        : theme.text,
                    },
                ]}
                >
                时间点
                </Text>
            </TouchableOpacity>
            </View>

            {/* ... rest of the content ... */}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16, borderBottomWidth: 1 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    headerButton: { padding: 5, minWidth: 30 },
    content: { flex: 1, padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    timerDisplay: { borderRadius: 20, padding: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 30, elevation: 5 },
    timerText: { fontSize: 72, fontWeight: 'bold' },
    modeTabs: { flexDirection: 'row', marginBottom: 30, borderRadius: 12, overflow: 'hidden', elevation: 2 },
    modeTab: { flex: 1, padding: 15, alignItems: 'center' },
    modeTabText: { fontSize: 16, fontWeight: '600' },
    // ... other styles
});

export default SleepTimerScreen;
