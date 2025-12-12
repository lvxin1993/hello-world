import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SleepContext = createContext();

export const SleepContextProvider = ({ children }) => {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [timerDuration, setTimerDuration] = useState(30); // 默认30分钟
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60); // 秒
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [alarmSound, setAlarmSound] = useState('default'); // 默认铃声
  const [积分, set积分] = useState(0); // 用户积分
  const [会员状态, setMembership] = useState('普通会员'); // 会员状态

  // 配置通知处理
  useEffect(() => {
    const configureNotifications = async () => {
      // 在web平台上不配置通知
      if (Platform.OS === 'web') {
        setNotificationPermission('granted'); // web上模拟授权状态
        return;
      }
      
      // 请求通知权限
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setNotificationPermission(finalStatus);

      if (finalStatus !== 'granted') {
        alert('需要通知权限才能使用定时功能');
        return;
      }

      // 配置通知处理
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    configureNotifications();
  }, []);

  // 计时器逻辑
  useEffect(() => {
    let timer;
    if (isTimerRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingTime === 0) {
      setIsTimerRunning(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, remainingTime]);

  // 计时器完成处理
  const handleTimerComplete = async () => {
    setIsTimerRunning(false);
    
    // 在web平台上不发送通知
    if (Platform.OS !== 'web') {
      // 发送通知
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '睡眠提醒',
          body: '时间到了，该睡觉了！',
          sound: alarmSound,
        },
        trigger: null, // 立即发送
      });
    }
    
    // 播放选择的铃声
    try {
      // 这里可以根据需要扩展，使用expo-av播放自定义铃声
      console.log('播放铃声:', alarmSound);
    } catch (error) {
      console.error('播放铃声失败:', error);
    }
  };

  // 设置计时器
  const setTimer = (minutes) => {
    setTimerDuration(minutes);
    setRemainingTime(minutes * 60);
    setIsTimerRunning(false);
  };

  // 开始计时器
  const startTimer = () => {
    setIsTimerRunning(true);
  };

  // 暂停计时器
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsTimerRunning(false);
    setRemainingTime(timerDuration * 60);
  };

  // 保存睡眠记录
  const saveSleepRecord = async (record) => {
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      date: new Date().toISOString().split('T')[0],
    };
    const updatedRecords = [...sleepRecords, newRecord];
    setSleepRecords(updatedRecords);
    await AsyncStorage.setItem('sleepRecords', JSON.stringify(updatedRecords));
  };

  // 加载睡眠记录
  const loadSleepRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('sleepRecords');
      if (records) {
        setSleepRecords(JSON.parse(records));
      }
    } catch (error) {
      console.error('加载睡眠记录失败:', error);
    }
  };

  // 设置闹钟铃声
  const setAlarmSoundPreference = (sound) => {
    setAlarmSound(sound);
    AsyncStorage.setItem('alarmSound', sound);
  };

  // 加载闹钟铃声偏好
  const loadAlarmSoundPreference = async () => {
    try {
      const sound = await AsyncStorage.getItem('alarmSound');
      if (sound) {
        setAlarmSound(sound);
      }
    } catch (error) {
      console.error('加载闹钟铃声偏好失败:', error);
    }
  };

  useEffect(() => {
    loadSleepRecords();
    loadAlarmSoundPreference();
  }, []);

  return (
    <SleepContext.Provider
      value={{
        sleepRecords,
        timerDuration,
        isTimerRunning,
        remainingTime,
        notificationPermission,
        alarmSound,
        积分,
        会员状态,
        setMembership,
        setTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        saveSleepRecord,
        setAlarmSoundPreference,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
};

export const useSleepContext = () => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleepContext must be used within a SleepContextProvider');
  }
  return context;
};
