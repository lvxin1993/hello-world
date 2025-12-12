import React, { createContext, useState, useContext } from 'react';

// 创建默认主题对象
const defaultThemeColors = {
  background: '#FFFFFF',
  primary: '#4A90E2',
  secondary: '#E8F4F8',
  card: '#F5F5F5',
  text: '#000000',
  textSecondary: '#7F8C8D',
  accent: '#F39C12',
  tipBackground: '#E8F4F8',
  tipTitle: '#4A90E2',
  tipText: '#2C3E50',
};

// 创建上下文，提供默认值，确保任何时候useTheme都能获取到有效值
const ThemeContext = createContext({
  theme: defaultThemeColors,
  getTheme: () => ({ colors: defaultThemeColors }),
  currentTheme: 'light',
  toggleTheme: () => {},
  themes: {
    light: { colors: defaultThemeColors },
    dark: { colors: { ...defaultThemeColors, background: '#1A1A1A', text: '#FFFFFF', card: '#2C2C2C' } },
  },
});

const lightTheme = {
  colors: defaultThemeColors,
};

const darkTheme = {
  colors: {
    ...defaultThemeColors,
    background: '#1A1A1A',
    primary: '#5DADE2',
    secondary: '#2C3E50',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#BDC3C7',
    tipBackground: '#2C3E50',
    tipTitle: '#5DADE2',
    tipText: '#BDC3C7',
  },
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const ThemeContextProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  const getTheme = () => {
    return themes[currentTheme];
  };

  // 直接获取当前主题颜色
  const theme = getTheme().colors;

  return (
    <ThemeContext.Provider value={{ theme, getTheme, themes, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 修改useThemeContext钩子，不再抛出错误，确保总是返回有效值
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  return context; // 直接返回上下文，不再检查是否存在
};

// 不再使用useTheme作为别名，避免与React Navigation冲突
export const useAppTheme = useThemeContext;