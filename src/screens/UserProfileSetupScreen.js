import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserProfile } from '../context/UserProfileContext';
import { useThemeContext } from '../context/ThemeContext';

const UserProfileSetupScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { completeProfile } = useUserProfile();

  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dailySleepHours, setDailySleepHours] = useState('8');
  const [sleepProblems, setSleepProblems] = useState({
    difficultyFallingAsleep: { hasProblem: false, severity: 0 },
    wakingUpAtNight: { hasProblem: false, severity: 0 },
    wakingUpEarly: { hasProblem: false, severity: 0 },
  });

  // 格式化日期显示
  const formatDate = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 处理日期选择
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // 切换睡眠问题状态
  const toggleSleepProblem = (problemKey) => {
    setSleepProblems(prev => ({
      ...prev,
      [problemKey]: {
        ...prev[problemKey],
        hasProblem: !prev[problemKey].hasProblem,
        severity: !prev[problemKey].hasProblem ? 1 : 0,
      },
    }));
  };

  // 更新问题严重程度
  const updateProblemSeverity = (problemKey, severity) => {
    setSleepProblems(prev => ({
      ...prev,
      [problemKey]: {
        ...prev[problemKey],
        severity: Math.max(0, Math.min(5, severity)),
      },
    }));
  };

  // 验证输入
  const validateInput = () => {
    const hours = parseInt(dailySleepHours);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      Alert.alert('输入错误', '请输入有效的睡眠时间（1-24小时）');
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 0 || age > 120) {
      Alert.alert('输入错误', '请输入有效的出生日期');
      return false;
    }

    return true;
  };

  // 提交资料
  const handleSubmit = async () => {
    if (!validateInput()) return;

    try {
      const profileData = {
        birthDate: birthDate.toISOString(),
        dailySleepHours: parseInt(dailySleepHours),
        sleepProblems,
      };

      const success = await completeProfile(profileData);

      if (success) {
        Alert.alert('成功', '个人资料已保存！', [
          { text: '确定', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('错误', '保存失败，请重试');
      }
    } catch (error) {
      console.error('提交资料失败:', error);
      Alert.alert('错误', '提交失败，请重试');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>完善个人资料</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          为了更好地为您提供个性化服务，请填写以下信息
        </Text>
      </View>

      {/* 出生日期 */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>出生日期</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: theme.text }]}>
            {formatDate(birthDate)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* 每日睡眠时间 */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>每日睡眠时间（小时）</Text>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={dailySleepHours}
          onChangeText={setDailySleepHours}
          keyboardType="numeric"
          placeholder="请输入1-24之间的数字"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      {/* 睡眠问题 */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>睡眠问题（可选）</Text>

        {Object.entries(sleepProblems).map(([key, problem]) => (
          <View key={key} style={styles.problemItem}>
            <TouchableOpacity
              style={styles.problemToggle}
              onPress={() => toggleSleepProblem(key)}
            >
              <Text style={[styles.problemLabel, { color: theme.text }]}>
                {getProblemLabel(key)}
              </Text>
              <Text style={styles.toggleIndicator}>
                {problem.hasProblem ? '✓' : '○'}
              </Text>
            </TouchableOpacity>

            {problem.hasProblem && (
              <View style={styles.severityContainer}>
                <Text style={[styles.severityLabel, { color: theme.textSecondary }]}>
                  严重程度: {problem.severity}
                </Text>
                <View style={styles.severityButtons}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.severityButton,
                        {
                          backgroundColor: problem.severity >= level ? theme.primary : theme.card,
                          borderColor: theme.border
                        }
                      ]}
                      onPress={() => updateProblemSeverity(key, level)}
                    >
                      <Text style={[
                        styles.severityText,
                        { color: problem.severity >= level ? '#FFFFFF' : theme.text }
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 提交按钮 */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>保存并开始使用</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// 获取睡眠问题标签
const getProblemLabel = (key) => {
  const labels = {
    difficultyFallingAsleep: '入睡困难',
    wakingUpAtNight: '半夜清醒',
    wakingUpEarly: '早醒',
  };
  return labels[key] || key;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
  },
  input: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  problemItem: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  problemToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  problemLabel: {
    fontSize: 16,
  },
  toggleIndicator: {
    fontSize: 18,
    color: '#4CAF50',
  },
  severityContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  severityLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  severityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfileSetupScreen;