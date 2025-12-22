import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [isSystemDark, setIsSystemDark] = useState(false);

  // 模拟系统主题检测（实际应用中可以使用useColorScheme或其他方法）
  useEffect(() => {
    // 这里只是模拟，实际应用中应该使用React Native的useColorScheme钩子
    // 或者Expo的Appearance.getColorScheme()
    const checkSystemTheme = () => {
      const hours = new Date().getHours();
      // 简单模拟：晚上7点到早上7点为深色主题
      setIsSystemDark(hours >= 19 || hours < 7);
    };

    // 初始检查
    checkSystemTheme();

    // 每小时检查一次
    const interval = setInterval(checkSystemTheme, 3600000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const getTheme = () => {
    if (currentTheme === 'auto') {
      return isSystemDark ? themes.dark : themes.light;
    }
    return themes[currentTheme];
  };

  // 直接获取当前主题颜色
  const theme = getTheme().colors;

  return (
    <ThemeContext.Provider value={{
      theme,
      getTheme,
      themes,
      currentTheme,
      toggleTheme,
      themeName: currentTheme // 添加themeName属性以便在组件中使用
    }}>
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