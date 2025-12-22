import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useModeContext, MODE_TRADITIONAL, MODE_ROTATING, MODE_CARD_GRAB } from '../context/ModeContext';
import { useSleepContext } from '../context/SleepContext';
import { responsiveFontSize, responsiveSize, spacing } from '../utils/responsive';

// ... 其他代码保持不变

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: spacing(20),
    paddingBottom: spacing(40),
    minHeight: '100%',
  },
  title: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
    marginBottom: spacing(20),
  },
  section: {
    marginBottom: spacing(30),
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    marginBottom: spacing(15),
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '32%',
    padding: spacing(15),
    borderRadius: responsiveSize(12),
    marginBottom: spacing(15),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonText: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // ... 其他样式也使用responsiveSize和spacing进行适配
});
