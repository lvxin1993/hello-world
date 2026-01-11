import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext';
import { useUserProfile } from '../context/UserProfileContext';
import { responsiveFontSize, responsiveSize, spacing } from '../utils/responsive';

const ProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme, currentTheme } = useThemeContext();
  const isDarkMode = currentTheme === 'dark';
  const { notificationPermission } = useSleepContext();
  const { userProfile, updateUserProfile } = useUserProfile();

  // 格式化日期显示
  const formatDate = (dateString) => {
    if (!dateString) return '未设置';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 获取睡眠问题描述
  const getSleepProblemsDescription = () => {
    const problems = [];
    Object.entries(userProfile.sleepProblems || {}).forEach(([key, problem]) => {
      if (problem.hasProblem) {
        const labels = {
          difficultyFallingAsleep: '入睡困难',
          wakingUpAtNight: '半夜清醒',
          wakingUpEarly: '早醒',
        };
        problems.push(`${labels[key]}（严重程度: ${problem.severity}/5）`);
      }
    });
    return problems.length > 0 ? problems.join('、') : '无';
  };

  // 编辑个人资料
  const handleEditProfile = () => {
    navigation.navigate('UserProfileSetupScreen');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>个人中心</Text>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      </View>
      
      {/* 个人资料信息 */}
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>个人资料</Text>
        
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>出生日期</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {formatDate(userProfile.birthDate)}
          </Text>
        </View>
        
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>每日睡眠时间</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {userProfile.dailySleepHours || 8}小时
          </Text>
        </View>
        
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>睡眠问题</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {getSleepProblemsDescription()}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={handleEditProfile}
        >
          <Text style={styles.editButtonText}>编辑个人资料</Text>
        </TouchableOpacity>
      </View>
      
      {/* 账户信息 */}
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>账户信息</Text>
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>用户名</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>SleepWell用户</Text>
        </View>
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>会员状态</Text>
          <Text style={[styles.infoValue, { color: '#4CAF50' }]}>普通会员</Text>
        </View>
        <View style={[styles.infoItem, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>积分</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>1250</Text>
        </View>
      </View>
      
      {/* 设置 */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>设置</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.card }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>深色模式</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              {isDarkMode ? '已开启' : '已关闭'}
            </Text>
          </View>
          <Text style={styles.settingIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>通知权限</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              {notificationPermission === 'granted' ? '已开启' : '已关闭'}
            </Text>
          </View>
          <Text style={styles.settingIcon}>
            {notificationPermission === 'granted' ? '✅' : '❌'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing(30),
  },
  title: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
    marginBottom: spacing(20),
  },
  avatar: {
    width: responsiveSize(100),
    height: responsiveSize(100),
    borderRadius: responsiveSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: responsiveFontSize(40),
  },
  infoSection: {
    marginBottom: spacing(20),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: spacing(15),
  },
  infoItem: {
    padding: spacing(15),
    borderRadius: responsiveSize(12),
    marginBottom: spacing(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: responsiveFontSize(14),
    marginBottom: spacing(5),
  },
  infoValue: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
  editButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingIcon: {
    fontSize: 20,
  },
});

export default ProfileScreen;