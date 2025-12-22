import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SleepContext = createContext();

export const SleepContextProvider = ({ children }) => {
  const [timerDuration, setTimerDuration] = useState(30); // 默认30分钟
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60); // 秒
  const [alarmSound, setAlarmSound] = useState('default'); // 默认铃声

  // 计时器逻辑
  useEffect(() => {
    let timer;
    if (isTimerRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
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

  // 基本的计时器控制方法
  const setTimer = (minutes) => {
    setTimerDuration(minutes);
    setRemainingTime(minutes * 60);
    setIsTimerRunning(false);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setRemainingTime(timerDuration * 60);
  };

  // 添加闹钟铃声保存和加载功能
  const setAlarmSoundPreference = (sound) => {
    setAlarmSound(sound);
    try {
      if (Platform.OS !== 'web') {
        AsyncStorage.setItem('alarmSound', sound);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('alarmSound', sound);
      }
    } catch (error) {
      console.error('保存闹钟铃声偏好失败:', error);
    }
  };

  const loadAlarmSoundPreference = async () => {
    try {
      if (Platform.OS !== 'web') {
        const sound = await AsyncStorage.getItem('alarmSound');
        if (sound) {
          setAlarmSound(sound);
        }
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const sound = localStorage.getItem('alarmSound');
        if (sound) {
          setAlarmSound(sound);
        }
      }
    } catch (error) {
      console.error('加载闹钟铃声偏好失败:', error);
    }
  };

  // 加载保存的设置
  useEffect(() => {
    loadAlarmSoundPreference();
  }, []);

  return (
    <SleepContext.Provider
      value={{
        timerDuration,
        isTimerRunning,
        remainingTime,
        alarmSound,
        setTimer,
        startTimer,
        pauseTimer,
        resetTimer,
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