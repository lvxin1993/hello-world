/**
 * 高级梦境解析工具
 * 结合心理学理论和符号学分析，提供更科学和有说服力的梦境解析
 */

// 梦境元素数据库 - 基于心理学研究和符号学理论
const DREAM_SYMBOLS = {
  // 动物象征
  animals: {
    '蛇': {
      positive: '智慧、转变、治愈能力',
      negative: '恐惧、欺骗、潜在威胁',
      psychological: '可能代表内心的直觉或未解决的冲突'
    },
    '鸟': {
      positive: '自由、灵感、精神升华',
      negative: '失去、分离',
      psychological: '可能反映对自由的渴望或逃避现实的愿望'
    },
    '狗': {
      positive: '忠诚、友谊、保护',
      negative: '被背叛、不信任',
      psychological: '可能代表人际关系中的信任问题'
    },
    '猫': {
      positive: '独立、神秘、直觉',
      negative: '冷漠、操纵',
      psychological: '可能反映对独立性的需求或对他人的防备心理'
    },
    '鱼': {
      positive: '财富、机遇、潜意识',
      negative: '损失、不安',
      psychological: '可能代表情感世界或深层欲望'
    }
  },

  // 场景象征
  locations: {
    '水': {
      positive: '情感、净化、新生',
      negative: '淹没、失控',
      psychological: '可能反映情感状态或潜意识活动'
    },
    '山': {
      positive: '挑战、成就、目标',
      negative: '障碍、压力',
      psychological: '可能代表人生目标或面临的困难'
    },
    '房子': {
      positive: '安全、归属、自我',
      negative: '限制、束缚',
      psychological: '可能反映个人身份认同或家庭关系'
    },
    '桥': {
      positive: '过渡、连接、改变',
      negative: '不稳定、风险',
      psychological: '可能代表生活中的转折点或重要决定'
    },
    '迷宫': {
      positive: '探索、成长',
      negative: '困惑、迷失',
      psychological: '可能反映面对复杂问题时的心理状态'
    }
  },

  // 行为象征
  actions: {
    '飞行': {
      positive: '自由、超越、掌控',
      negative: '不切实际、逃避',
      psychological: '可能反映对自由的渴望或对现状的不满'
    },
    '坠落': {
      positive: '放下、释放',
      negative: '失控、失败',
      psychological: '可能代表缺乏安全感或对变化的恐惧'
    },
    '奔跑': {
      positive: '努力、追求',
      negative: '逃避、压力',
      psychological: '可能反映对目标的追求或对问题的回避'
    },
    '隐藏': {
      positive: '保护、隐私',
      negative: '羞耻、隐瞒',
      psychological: '可能代表不愿面对的问题或保护自己的需求'
    },
    '寻找': {
      positive: '探索、求知',
      negative: '迷失、缺失',
      psychological: '可能反映内心的空虚感或对某种事物的渴望'
    }
  }
};

// 情绪分析映射
const EMOTION_ANALYSIS = {
  '快乐': {
    intensity: '积极',
    psychological: '反映内心的满足感和正面情绪状态',
    suggestion: '保持这种积极心态，将其带入日常生活中'
  },
  '悲伤': {
    intensity: '消极',
    psychological: '可能代表未处理的情感创伤或失落感',
    suggestion: '允许自己感受这种情绪，寻找适当的方式表达和释放'
  },
  '恐惧': {
    intensity: '消极',
    psychological: '可能反映潜在的焦虑或对未知事物的担忧',
    suggestion: '识别恐惧的根源，逐步面对和克服'
  },
  '愤怒': {
    intensity: '消极',
    psychological: '可能代表受到挫折或感到不公平对待',
    suggestion: '找到愤怒的合理出口，避免压抑或爆发'
  },
  '惊讶': {
    intensity: '中性',
    psychological: '反映对外界刺激的直接反应',
    suggestion: '保持开放心态，接受新体验'
  },
  '厌恶': {
    intensity: '消极',
    psychological: '可能代表对某些事物的排斥或价值观冲突',
    suggestion: '识别厌恶的根源，思考其对个人成长的意义'
  }
};

// 梦境类型分类
const DREAM_TYPES = {
  '噩梦': {
    characteristics: '充满恐惧、焦虑或痛苦情绪的梦境',
    psychological: '通常反映潜意识中的压力或未解决的冲突',
    suggestion: '记录触发因素，尝试放松技巧改善睡眠质量'
  },
  '美梦': {
    characteristics: '带来愉悦、满足感的积极梦境',
    psychological: '反映内心的愿望和积极的心理状态',
    suggestion: '珍惜这种积极体验，尝试将美好感受延续到现实中'
  },
  '预知梦': {
    characteristics: '似乎预测未来事件的梦境',
    psychological: '可能反映敏锐的直觉或对环境的深度感知',
    suggestion: '保持观察力，但不要过分依赖梦境预测'
  },
  '重复梦': {
    characteristics: '反复出现的相似梦境',
    psychological: '通常代表未解决的重要问题或持续的心理冲突',
    suggestion: '深入分析梦境内容，寻找现实中的关联因素'
  }
};

/**
 * 分析梦境内容中的关键元素
 * @param {string} content - 梦境描述内容
 * @returns {Object} 包含分析结果的对象
 */
export const analyzeDreamElements = (content) => {
  const results = {
    symbols: [],
    emotions: [],
    themes: [],
    interpretations: []
  };

  // 转换为小写便于匹配
  const lowerContent = content.toLowerCase();

  // 分析动物象征
  Object.keys(DREAM_SYMBOLS.animals).forEach(animal => {
    if (lowerContent.includes(animal)) {
      results.symbols.push({
        type: '动物',
        symbol: animal,
        meanings: DREAM_SYMBOLS.animals[animal]
      });
    }
  });

  // 分析场景象征
  Object.keys(DREAM_SYMBOLS.locations).forEach(location => {
    if (lowerContent.includes(location)) {
      results.symbols.push({
        type: '场景',
        symbol: location,
        meanings: DREAM_SYMBOLS.locations[location]
      });
    }
  });

  // 分析行为象征
  Object.keys(DREAM_SYMBOLS.actions).forEach(action => {
    if (lowerContent.includes(action)) {
      results.symbols.push({
        type: '行为',
        symbol: action,
        meanings: DREAM_SYMBOLS.actions[action]
      });
    }
  });

  // 分析情绪
  Object.keys(EMOTION_ANALYSIS).forEach(emotion => {
    if (lowerContent.includes(emotion.toLowerCase())) {
      results.emotions.push({
        emotion: emotion,
        analysis: EMOTION_ANALYSIS[emotion]
      });
    }
  });

  return results;
};

/**
 * 生成科学且有说服力的梦境解析报告
 * @param {string} content - 梦境描述内容
 * @returns {Object} 包含详细解析报告的对象
 */
export const generateScientificInterpretation = (content) => {
  const analysis = analyzeDreamElements(content);

  // 构建专业解析报告
  let report = '';

  // 引言部分
  report += '【专业梦境解析报告】\n\n';
  report += '基于现代心理学和符号学理论，结合您的梦境描述，我们进行了深入分析：\n\n';

  // 符号分析
  if (analysis.symbols.length > 0) {
    report += '一、核心象征解析\n';
    analysis.symbols.forEach((symbol, index) => {
      report += `${index + 1}. ${symbol.type}象征"${symbol.symbol}"：\n`;
      report += `   积极意义：${symbol.meanings.positive}\n`;
      report += `   潜在警示：${symbol.meanings.negative}\n`;
      report += `   心理学解读：${symbol.meanings.psychological}\n\n`;
    });
  }

  // 情绪分析
  if (analysis.emotions.length > 0) {
    report += '二、情绪状态评估\n';
    analysis.emotions.forEach((emotionItem, index) => {
      report += `${index + 1}. 情绪"${emotionItem.emotion}"：\n`;
      report += `   强度等级：${emotionItem.analysis.intensity}\n`;
      report += `   心理学意义：${emotionItem.analysis.psychological}\n`;
      report += `   应对建议：${emotionItem.analysis.suggestion}\n\n`;
    });
  }

  // 综合分析
  report += '三、综合心理学洞察\n';
  if (analysis.symbols.length > 0 || analysis.emotions.length > 0) {
    report += '您的梦境反映出丰富的内在心理活动。';

    // 根据符号数量判断梦境复杂度
    if (analysis.symbols.length >= 3) {
      report += '梦境中出现多个象征元素，表明您的潜意识正在积极处理复杂的信息和情感。';
    } else if (analysis.symbols.length >= 1) {
      report += '梦境中的核心象征指向您当前关注的重要议题。';
    }

    // 根据情绪判断心理状态
    const negativeEmotions = analysis.emotions.filter(e => e.analysis.intensity === '消极');
    if (negativeEmotions.length > 0) {
      report += '负面情绪的存在提示您可能正面临一定的心理压力，建议适当关注情绪调节。';
    } else if (analysis.emotions.length > 0) {
      report += '情绪表达丰富，说明您具有良好的情感感知能力。';
    }
  } else {
    report += '这是一个较为抽象的梦境，可能反映了您潜意识中难以名状的感受或思考。';
  }

  report += '\n';

  // 个性化建议
  report += '四、个性化发展建议\n';
  report += '1. 自我反思：请回顾近期生活中的重要事件，寻找与梦境的潜在联系\n';
  report += '2. 情绪管理：通过冥想、运动等方式维护心理健康\n';
  report += '3. 创意启发：梦境中的象征可能为创作或解决问题提供灵感\n';
  report += '4. 持续记录：建立规律的梦境记录习惯，有助于深入了解自我\n';

  // 总结
  report += '\n五、总结\n';
  report += '梦境是通往潜意识的皇家大道。通过科学的方法解析梦境，可以帮助我们更好地认识自己，促进个人成长。本分析仅供参考，如需深入的心理咨询，请寻求专业心理医生的帮助。\n';

  return {
    report,
    elements: analysis
  };
};

/**
 * 根据梦境特征判断梦境类型
 * @param {string} content - 梦境描述内容
 * @returns {string} 梦境类型
 */
export const classifyDreamType = (content) => {
  const lowerContent = content.toLowerCase();

  // 检查是否为噩梦
  if (lowerContent.includes('害怕') || lowerContent.includes('恐惧') ||
      lowerContent.includes('追') || lowerContent.includes('掉') ||
      lowerContent.includes('死') || lowerContent.includes('危险')) {
    return '噩梦';
  }

  // 检查是否为美梦
  if (lowerContent.includes('开心') || lowerContent.includes('高兴') ||
      lowerContent.includes('飞') || lowerContent.includes('赢') ||
      lowerContent.includes('爱') || lowerContent.includes('成功')) {
    return '美梦';
  }

  // 检查是否为重复梦
  // 这需要更多的上下文信息，在实际应用中可能需要用户标记

  return '普通梦';
};

/**
 * 获取梦境解析的专业术语表
 * @returns {Object} 专业术语解释
 */
export const getProfessionalTerminology = () => {
  return {
    '潜意识': '指个体心理活动中不能直接感知但影响行为和思维的部分',
    '原型': '集体无意识中的普遍象征模式，由荣格提出',
    '补偿机制': '梦境通过相反内容平衡清醒时的心理状态',
    '愿望满足': '弗洛伊德认为梦境是未满足愿望的变相实现',
    '心灵整合': '通过梦境解析促进人格完整发展的过程'
  };
};

export default {
  analyzeDreamElements,
  generateScientificInterpretation,
  classifyDreamType,
  getProfessionalTerminology
};