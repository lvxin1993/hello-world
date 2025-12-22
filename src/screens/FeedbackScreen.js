import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const FeedbackScreen = () => {
  const { theme } = useThemeContext();
  const [feedback, setFeedback] = useState('');
  const [contactMethod, setContactMethod] = useState('wechat');

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('提示', '请输入反馈内容');
      return;
    }

    if (contactMethod === 'wechat') {
      Alert.alert('反馈成功', '感谢您的反馈！我们会通过微信与您联系。');
    } else {
      Alert.alert('反馈成功', '感谢您的反馈！我们会通过邮箱与您联系。');
    }
    setFeedback('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>反馈意见</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>请告诉我们您的想法和建议</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>反馈内容</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          multiline
          numberOfLines={6}
          placeholder="请输入您的反馈意见..."
          placeholderTextColor={theme.textSecondary}
          value={feedback}
          onChangeText={setFeedback}
        />

        <Text style={[styles.label, { color: theme.text }]}>联系方式</Text>
        <View style={styles.contactOptions}>
          <TouchableOpacity
            style={[
              styles.contactOption,
              contactMethod === 'wechat' && { borderColor: '#07C160' },
              { backgroundColor: theme.card, borderColor: theme.textSecondary }
            ]}
            onPress={() => setContactMethod('wechat')}
          >
            <Text style={[styles.contactOptionText, { color: theme.text }]}>微信</Text>
            <Text style={[styles.contactOptionIcon]}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.contactOption,
              contactMethod === 'email' && { borderColor: '#1890FF' },
              { backgroundColor: theme.card, borderColor: theme.textSecondary }
            ]}
            onPress={() => setContactMethod('email')}
          >
            <Text style={[styles.contactOptionText, { color: theme.text }]}>邮箱</Text>
            <Text style={[styles.contactOptionIcon]}>📧</Text>
          </TouchableOpacity>
        </View>

        {contactMethod === 'wechat' && (
          <View style={styles.contactInfo}>
            <Text style={[styles.contactInfoText, { color: theme.text }]}>微信：sleepwell_official</Text>
          </View>
        )}

        {contactMethod === 'email' && (
          <View style={styles.contactInfo}>
            <Text style={[styles.contactInfoText, { color: theme.text }]}>邮箱：feedback@sleepwell.com</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: '#4A6FA5' }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>提交反馈</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginHorizontal: 5,
  },
  contactOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  contactOptionIcon: {
    fontSize: 20,
  },
  contactInfo: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  contactInfoText: {
    fontSize: 16,
  },
  submitButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;
