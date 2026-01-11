import 'react-native-get-random-values'; // 必须在顶部第一行导入
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { generateScientificInterpretation, classifyDreamType } from '../utils/dreamAnalyzer';

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

// 其他导入保持不变

// MIMO API 配置
const MIMO_API_CONFIG = {
  baseUrl: "https://api.xiaomimimo.com/v1/chat/completions",
  apiKey: "sk-cfvlgepj84ytgvw766yz1iv1mlxs8fgc19bjfcb1zbgkj1mr",
  model: "mimo-v2-flash",
  maxTokens: 200,
  temperature: 0.7
};

// DeepSeek API配置
const DEEPSEEK_API_CONFIG = {
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-0ef2c031e04d450182cba519e71ae57e',
  model: 'deepseek-chat',
  maxTokens: 2000,
  temperature: 0.7
};

// 助眠App专属梦境解析专家提示词
const DREAM_ANALYZER_PROMPT = `你是助眠 App 专属梦境解析专家，需基于心理学（荣格分析、符号学）逻辑，为用户提供专业且精简的解读，全程遵循以下要求：
1. 解读必须包含【情绪总结】：使用简洁的标签（如：开心、焦虑、希望、大吉、平和、压力等）概括梦境的核心情绪，并给出1条对应建议
2. 解读聚焦 3 个核心维度：
   - 核心符号象征（1-2 个关键意象，不罗列多个含义）
   - 潜在情绪主题（贴合用户状态，不用专业术语堆砌）
   - 轻量自我探索建议（1 条具体可操作，适配助眠场景）
3. 语言精简（总字数≤200 字），语气温和舒缓，避免绝对化表述（用 "可能""或许""倾向于"）
4. 不涉及恐怖、焦虑放大的解读
5. 结尾呼应助眠需求，给出简短安抚引导（如：睡前可轻呼一口气，让梦境的启示伴随安稳入睡）`;

// 调用MIMO API进行梦境分析
const analyzeDreamWithMIMO = async (dreamContent) => {
  try {
    const response = await fetch(MIMO_API_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: MIMO_API_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: DREAM_ANALYZER_PROMPT
          },
          {
            role: 'user',
            content: `请分析以下梦境内容：\n\n${dreamContent}`
          }
        ],
        max_tokens: MIMO_API_CONFIG.maxTokens,
        temperature: MIMO_API_CONFIG.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;

    if (!analysisResult) {
      throw new Error('API返回结果为空');
    }

    return {
      analysisMethod: 'mimo',
      scientificReport: analysisResult,
      dreamType: classifyDreamType(dreamContent)
    };
  } catch (error) {
    console.error('MIMO API分析失败:', error);
    throw error;
  }
};



// 默认梦境条目结构
const createDefaultDreamEntry = (title = '', content = '', tags = []) => ({
  id: uuidv4(),
  title,
  content,
  tags,
  // 添加梦境解析相关字段
  interpretation: '',
  emotions: [],
  symbols: [],
  dreamType: '',
  scientificReport: '',
  analysisMethod: 'local', // 'deepseek' 或 'local'
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const DreamJournalContextProvider = ({ children }) => {
  const [dreamEntries, setDreamEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiUsage, setApiUsage] = useState({ count: 0, date: new Date().toDateString() });

  // 加载梦境日志数据和API使用情况
  const loadDreamEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let storedData;
      let storedApiUsage;

      if (Platform.OS !== 'web') {
        storedData = await AsyncStorage.getItem('dreamEntries');
        storedApiUsage = await AsyncStorage.getItem('deepseekApiUsage');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        storedData = localStorage.getItem('dreamEntries');
        storedApiUsage = localStorage.getItem('deepseekApiUsage');
      }

      const parsedData = deserializeData(storedData);
      if (parsedData && Array.isArray(parsedData)) {
        setDreamEntries(parsedData);
      } else {
        setDreamEntries([]);
      }

      const parsedApiUsage = deserializeData(storedApiUsage);
      if (parsedApiUsage && parsedApiUsage.date === new Date().toDateString()) {
        setApiUsage(parsedApiUsage);
      } else {
        // 重置每日使用计数
        const newApiUsage = { count: 0, date: new Date().toDateString() };
        setApiUsage(newApiUsage);
        await saveApiUsage(newApiUsage);
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

  // 保存API使用情况
  const saveApiUsage = async (usage) => {
    try {
      const serializedUsage = serializeData(usage);
      if (serializedUsage) {
        if (Platform.OS !== 'web') {
          await AsyncStorage.setItem('deepseekApiUsage', serializedUsage);
        } else if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('deepseekApiUsage', serializedUsage);
        }
      }
    } catch (err) {
      console.error('保存API使用情况失败:', err);
    }
  };

  // 检查API使用限制
  const canUseDeepSeekApi = () => {
    return apiUsage.count < 100; // 每日最多100次
  };

  // 更新API使用计数
  const updateApiUsage = async () => {
    const newApiUsage = { ...apiUsage, count: apiUsage.count + 1 };
    setApiUsage(newApiUsage);
    await saveApiUsage(newApiUsage);
  };

  // 调用DeepSeek API进行梦境分析
  const analyzeDreamWithDeepSeek = async (dreamContent) => {
    try {
      if (!canUseDeepSeekApi()) {
        throw new Error('今日API调用次数已达上限');
      }

      const response = await fetch(DEEPSEEK_API_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_API_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: `你是助眠 App 专属梦境解析专家，需基于心理学（荣格分析、符号学）逻辑，为用户提供专业且精简的解读，全程遵循以下要求：
1. 解读必须包含【情绪总结】：使用简洁的标签（如：开心、焦虑、希望、大吉、平和、压力等）概括梦境的核心情绪，并给出1条对应建议
2. 解读聚焦 3 个核心维度：
   - 核心符号象征（1-2 个关键意象，不罗列多个含义）
   - 潜在情绪主题（贴合用户状态，不用专业术语堆砌）
   - 轻量自我探索建议（1 条具体可操作，适配助眠场景）
3. 语言精简（总字数≤200 字），语气温和舒缓，避免绝对化表述（用 "可能""或许""倾向于"）
4. 不涉及恐怖、焦虑放大的解读
5. 结尾呼应助眠需求，给出简短安抚引导（如：睡前可轻呼一口气，让梦境的启示伴随安稳入睡）
6. 格式清晰，使用简洁的标题或分点，避免冗长段落`
            },
            {
              role: 'user',
              content: `请分析以下梦境内容：\n\n${dreamContent}`
            }
          ],
          max_tokens: 500,
          temperature: DEEPSEEK_API_CONFIG.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = data.choices[0]?.message?.content;

      if (!analysisResult) {
        throw new Error('API返回结果为空');
      }

      // 更新API使用计数
      await updateApiUsage();

      return {
        analysisMethod: 'deepseek',
        scientificReport: analysisResult,
        dreamType: classifyDreamType(dreamContent)
      };
    } catch (error) {
      console.error('DeepSeek API分析失败:', error);
      throw error;
    }
  };

  // 本地梦境分析（备用方案）
  const analyzeDreamLocally = (dreamContent) => {
    const analysis = generateScientificInterpretation(dreamContent);
    return {
      analysisMethod: 'local',
      scientificReport: analysis.report,
      dreamType: classifyDreamType(dreamContent),
      emotions: analysis.elements.emotions.map(e => e.emotion),
      symbols: analysis.elements.symbols
    };
  };

  // 科学分析梦境（优先使用MIMO API，失败时使用DeepSeek API，最后使用本地分析）
  const scientificallyAnalyzeDream = async (id) => {
    try {
      const entry = getDreamEntryById(id);
      if (!entry) {
        throw new Error('梦境条目不存在');
      }

      const combinedContent = `${entry.title ? entry.title + '\n' : ''}${entry.content}`;
      let analysisResult;
      let analysisMethod = 'local';

      // 优先尝试MIMO API
      try {
        analysisResult = await analyzeDreamWithMIMO(combinedContent);
        analysisMethod = 'mimo';
      } catch (mimoError) {
        console.log('MIMO API分析失败，尝试DeepSeek API:', mimoError.message);
        // MIMO API失败，尝试DeepSeek API
        try {
          if (canUseDeepSeekApi()) {
            analysisResult = await analyzeDreamWithDeepSeek(combinedContent);
            analysisMethod = 'deepseek';
          } else {
            throw new Error('DeepSeek API调用次数已达上限');
          }
        } catch (deepseekError) {
          console.log('DeepSeek API分析失败，使用本地分析:', deepseekError.message);
          // 所有API都失败，使用本地分析
          analysisResult = analyzeDreamLocally(combinedContent);
          analysisMethod = 'local';
        }
      }

      const updatedEntry = {
        ...entry,
        ...analysisResult,
        analysisMethod,
        updatedAt: new Date().toISOString()
      };

      const updatedEntries = dreamEntries.map(e => e.id === id ? updatedEntry : e);
      setDreamEntries(updatedEntries);
      await saveDreamEntries(updatedEntries);

      // 显示分析来源信息
      if (analysisMethod === 'mimo') {
        Alert.alert('分析完成', '使用MIMO AI分析');
      } else if (analysisMethod === 'deepseek') {
        Alert.alert('分析完成', `使用DeepSeek AI分析（今日剩余次数: ${99 - apiUsage.count}）`);
      } else {
        Alert.alert('分析完成', '使用本地规则库分析（API调用失败）');
      }

      return updatedEntry;
    } catch (err) {
      console.error('科学解析梦境失败:', err);
      setError('科学解析梦境失败');
      Alert.alert('分析失败', '梦境分析失败，请稍后重试');
      return false;
    }
  };

  // 获取今日API使用情况
  const getApiUsageInfo = () => {
    return {
      used: apiUsage.count,
      remaining: 100 - apiUsage.count,
      limit: 100
    };
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
        scientificallyAnalyzeDream, // 替换为新的科学分析函数
        getApiUsageInfo, // 添加API使用情况查询
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
