import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// 创建上下文
const DreamJournalContext = createContext();

// 数据序列化和反序列化工具函数
const serializeData = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('序列化数据失败:', error);
    return null;
  }
};

const deserializeData = (data) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('反序列化数据失败:', error);
    return null;
  }
};

// 默认梦境条目结构
const createDefaultDreamEntry = (title = '', content = '', tags = []) => ({
  id: uuidv4(),
  title,
  content,
  tags,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const DreamJournalContextProvider = ({ children }) => {
  const [dreamEntries, setDreamEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载梦境日志数据
  const loadDreamEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let storedData;
      if (Platform.OS !== 'web') {
        storedData = await AsyncStorage.getItem('dreamEntries');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        storedData = localStorage.getItem('dreamEntries');
      }
      
      const parsedData = deserializeData(storedData);
      if (parsedData && Array.isArray(parsedData)) {
        setDreamEntries(parsedData);
      } else {
        setDreamEntries([]);
      }
    } catch (err) {
      console.error('加载梦境日志失败:', err);
      setError('加载梦境日志失败');
      setDreamEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存梦境日志数据
  const saveDreamEntries = async (entries) => {
    try {
      const serializedData = serializeData(entries);
      if (serializedData) {
        if (Platform.OS !== 'web') {
          await AsyncStorage.setItem('dreamEntries', serializedData);
        } else if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('dreamEntries', serializedData);
        }
      }
    } catch (err) {
      console.error('保存梦境日志失败:', err);
      setError('保存梦境日志失败');
    }
  };

  // 添加新的梦境条目
  const addDreamEntry = async (title, content, tags = []) => {
    try {
      const newEntry = createDefaultDreamEntry(title, content, tags);
      const updatedEntries = [newEntry, ...dreamEntries];
      setDreamEntries(updatedEntries);
      await saveDreamEntries(updatedEntries);
      return newEntry;
    } catch (err) {
      console.error('添加梦境条目失败:', err);
      setError('添加梦境条目失败');
      return null;
    }
  };

  // 更新梦境条目
  const updateDreamEntry = async (id, updates) => {
    try {
      const updatedEntries = dreamEntries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() } 
          : entry
      );
      setDreamEntries(updatedEntries);
      await saveDreamEntries(updatedEntries);
      return true;
    } catch (err) {
      console.error('更新梦境条目失败:', err);
      setError('更新梦境条目失败');
      return false;
    }
  };

  // 删除梦境条目
  const deleteDreamEntry = async (id) => {
    try {
      const updatedEntries = dreamEntries.filter(entry => entry.id !== id);
      setDreamEntries(updatedEntries);
      await saveDreamEntries(updatedEntries);
      return true;
    } catch (err) {
      console.error('删除梦境条目失败:', err);
      setError('删除梦境条目失败');
      return false;
    }
  };

  // 根据ID获取特定梦境条目
  const getDreamEntryById = (id) => {
    return dreamEntries.find(entry => entry.id === id) || null;
  };

  // 根据标签过滤梦境条目
  const getDreamEntriesByTag = (tag) => {
    return dreamEntries.filter(entry => entry.tags.includes(tag));
  };

  // 搜索梦境条目
  const searchDreamEntries = (query) => {
    if (!query) return dreamEntries;
    
    const lowerCaseQuery = query.toLowerCase();
    return dreamEntries.filter(entry => 
      entry.title.toLowerCase().includes(lowerCaseQuery) ||
      entry.content.toLowerCase().includes(lowerCaseQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  };

  // 初始化加载数据
  useEffect(() => {
    loadDreamEntries();
  }, []);

  return (
    <DreamJournalContext.Provider
      value={{
        dreamEntries,
        isLoading,
        error,
        addDreamEntry,
        updateDreamEntry,
        deleteDreamEntry,
        getDreamEntryById,
        getDreamEntriesByTag,
        searchDreamEntries,
        loadDreamEntries,
      }}
    >
      {children}
    </DreamJournalContext.Provider>
  );
};

export const useDreamJournalContext = () => {
  const context = useContext(DreamJournalContext);
  if (!context) {
    throw new Error('useDreamJournalContext must be used within a DreamJournalContextProvider');
  }
  return context;
};
