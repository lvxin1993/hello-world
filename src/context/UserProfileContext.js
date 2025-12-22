import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 创建上下文
const UserProfileContext = createContext();

// 用户资料数据结构
const defaultUserProfile = {
  isProfileCompleted: false,
  birthDate: null, // 出生日期
  dailySleepHours: 8, // 每日睡眠时间（小时）
  sleepProblems: {
    difficultyFallingAsleep: { hasProblem: false, severity: 0 }, // 入睡困难
    wakingUpAtNight: { hasProblem: false, severity: 0 }, // 半夜清醒
    wakingUpEarly: { hasProblem: false, severity: 0 }, // 早醒
  },
  createdAt: null,
  updatedAt: null,
};

export const UserProfileContextProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户资料
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      let storedProfile;
      if (Platform.OS !== 'web') {
        storedProfile = await AsyncStorage.getItem('userProfile');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        storedProfile = localStorage.getItem('userProfile');
      }

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
      } else {
        // 首次使用，资料未完成
        setUserProfile(defaultUserProfile);
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
      setUserProfile(defaultUserProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存用户资料
  const saveUserProfile = async (profile) => {
    try {
      const profileToSave = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileToSave));
      } else if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userProfile', JSON.stringify(profileToSave));
      }

      setUserProfile(profileToSave);
      return true;
    } catch (error) {
      console.error('保存用户资料失败:', error);
      return false;
    }
  };

  // 更新用户资料
  const updateUserProfile = async (updates) => {
    const updatedProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return await saveUserProfile(updatedProfile);
  };

  // 完成资料填写
  const completeProfile = async (profileData) => {
    const completedProfile = {
      ...profileData,
      isProfileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await saveUserProfile(completedProfile);
  };

  // 检查是否需要显示资料填写页面
  const shouldShowProfileSetup = () => {
    return !userProfile.isProfileCompleted;
  };

  // 重置用户资料（用于测试）
  const resetProfile = async () => {
    await saveUserProfile(defaultUserProfile);
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        updateUserProfile,
        completeProfile,
        shouldShowProfileSetup,
        resetProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile必须在UserProfileContextProvider中使用');
  }
  return context;
};
