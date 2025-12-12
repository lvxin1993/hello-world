import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext';
import * as Notifications from 'expo-notifications';

const SleepTimerScreen = () => {
  const { theme, getTheme } = useThemeContext();
  const {
    timerDuration,
    isTimerRunning,
    remainingTime,
    notificationPermission,
    alarmSound,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setAlarmSoundPreference,
  } = useSleepContext();

  // 常用时间选项
  const timeOptions = [15, 30, 45, 60, 90, 120];

  // 铃声选项
  const soundOptions = [
    { id: 'default', name: '默认铃声', emoji: '🔔' },
    { id: 'bell', name: '经典铃声', emoji: '🔔' },
    { id: 'birds', name: '鸟鸣', emoji: '🐦' },
    { id: 'ocean', name: '海浪', emoji: '🌊' },
    { id: 'wind', name: '风声', emoji: '🍃' },
    { id: 'rain', name: '雨声', emoji: '🌧️' },
  ];

  // 格式化时间为 mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 重新请求通知权限
  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '权限请求',
        '请在系统设置中允许通知权限，以便使用定时功能',
        [{ text: '确定' }]
      );
    }
  };

  // 处理开始按钮点击
  const handleStart = () => {
    if (notificationPermission !== 'granted') {
      requestPermission();
      return;
    }
    startTimer();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* 标题 */}
        <Text style={[styles.title, { color: theme.text }]}>睡眠定时器</Text>

        {/* 计时器显示 */}
        <View style={[styles.timerDisplay, { backgroundColor: theme.card }]}>
          <Text style={[styles.timerText, { color: theme.text }]}>
            {formatTime(remainingTime)}
          </Text>
        </View>

        {/* 时间选项 */}
        <View style={styles.timeOptions}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>选择时间</Text>
          <View style={styles.timeButtons}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  { 
                    backgroundColor: timerDuration === time 
                      ? theme.primary 
                      : theme.card,
                  },
                ]}
                onPress={() => setTimer(time)}
                disabled={isTimerRunning}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    { 
                      color: timerDuration === time 
                        ? '#FFFFFF' 
                        : theme.text,
                    },
                  ]}
                >
                  {time} 分钟
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 控制按钮 */}
        <View style={styles.controls}>
          {!isTimerRunning ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton, { backgroundColor: theme.primary }]}
              onPress={handleStart}
            >
              <Text style={styles.controlButtonText}>开始</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton, { backgroundColor: theme.primary }]}
              onPress={pauseTimer}
            >
              <Text style={styles.controlButtonText}>暂停</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
              style={[styles.controlButton, styles.resetButton, { backgroundColor: theme.card }]}
              onPress={resetTimer}
            >
            <Text style={[styles.resetButtonText, { color: theme.text }]}>重置</Text>
          </TouchableOpacity>
        </View>

        {/* 铃声选择 */}
        <View style={styles.soundOptions}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>选择铃声</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.soundButtons}>
              {soundOptions.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundButton,
                    { 
                    backgroundColor: alarmSound === sound.id 
                      ? theme.primary 
                      : theme.card,
                  },
                  ]}
                  onPress={() => setAlarmSoundPreference(sound.id)}
                >
                  <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                  <Text
                    style={[
                    styles.soundName,
                    { 
                      color: alarmSound === sound.id 
                        ? '#FFFFFF' 
                        : theme.text,
                    },
                  ]}
                  >
                    {sound.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 权限状态提示 */}
        {notificationPermission !== 'granted' && (
          <View style={[styles.permissionWarning, { backgroundColor: '#FFF3CD', borderColor: '#FFEEBA' }]}>
            <Text style={{ color: '#856404', fontSize: 14, textAlign: 'center' }}>
              通知权限未开启，定时提醒可能无法正常工作
            </Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
              <Text style={{ color: '#007BFF', fontSize: 14, fontWeight: 'bold' }}>
                开启权限
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 当前设置信息 */}
        <View style={[styles.infoPanel, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>当前设置</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>定时时长:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{timerDuration} 分钟</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>状态:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {isTimerRunning ? '运行中' : '已停止'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>铃声:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {soundOptions.find(s => s.id === alarmSound)?.name}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  timerDisplay: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  timeOptions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '30%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    width: 120,
  },
  pauseButton: {
    width: 120,
  },
  resetButton: {
    width: 120,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  soundOptions: {
    marginBottom: 20,
  },
  soundButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  soundButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  soundEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  soundName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionWarning: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  permissionButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  infoPanel: {
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SleepTimerScreen;
