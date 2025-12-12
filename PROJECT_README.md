# SleepWell - 手机助眠App

一个功能完整的手机助眠应用，包含定时提醒、睡眠记录统计、助眠声音播放、会员体系、积分奖励和徽章系统。

## 功能特性

### 核心功能
- **定时提醒**：设置睡眠定时器，帮助你规律作息
- **睡眠记录**：记录每日睡眠时间，生成统计报告
- **助眠声音**：提供多种白噪声、自然声音和有声书
- **会员体系**：VIP会员可享受更多优质内容

### 奖励系统
- **积分奖励**：早睡和充足睡眠可获得积分
- **徽章系统**：完成特定目标可获得徽章
- **专属内容**：积分可兑换VIP声音和皮肤

## 技术栈

- **React Native**：跨平台移动应用开发框架
- **Expo**：React Native开发工具链
- **React Navigation**：应用导航管理
- **Expo AV**：音频播放功能
- **Expo Notifications**：推送通知功能
- **Async Storage**：本地数据存储
- **React Native Chart Kit**：数据可视化

## 项目结构

```
sleep-app/
├── App.js                    # 应用入口文件
├── package.json              # 项目依赖配置
├── app.json                  # Expo配置文件
├── src/
│   ├── components/           # 可复用组件
│   ├── screens/              # 应用屏幕
│   │   ├── HomeScreen.js     # 首页
│   │   ├── SleepTimerScreen.js  # 睡眠定时器
│   │   ├── SoundLibraryScreen.js # 声音库
│   │   ├── StatisticsScreen.js  # 统计页面
│   │   └── ProfileScreen.js  # 个人资料
│   ├── context/              # 状态管理
│   │   └── SleepContext.js   # 睡眠数据上下文
│   ├── hooks/                # 自定义钩子
│   ├── utils/                # 工具函数
│   ├── types/                # 类型定义
│   └── assets/               # 静态资源
│       └── sounds/           # 音频文件
└── assets/                   # Expo资源文件
    ├── icon.png              # 应用图标
    ├── splash.png            # 启动屏幕
    └── notification-icon.png # 通知图标
```

## 安装和运行

### 前提条件
- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器
- Expo Go 应用（用于在真机上测试）

### 安装步骤

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm start
```

3. 在设备上运行
- 使用Expo Go应用扫描终端中的二维码
- 或使用模拟器运行：
  ```bash
  npm run android  # Android模拟器
  npm run ios      # iOS模拟器
  npm run web      # Web浏览器
  ```

## 主要功能模块说明

### 1. 定时提醒模块
- 使用Expo Notifications实现本地通知
- 支持自定义定时时长
- 计时器结束时发送睡眠提醒

### 2. 睡眠记录统计模块
- 本地存储睡眠数据
- 计算平均睡眠时间、总睡眠天数等统计指标
- 使用图表可视化最近7天的睡眠模式

### 3. 助眠声音模块
- 支持多种声音分类：白噪声、自然声音、冥想音乐、有声书
- VIP会员可访问专属声音
- 实现音频播放、暂停、停止功能

### 4. 会员体系
- 免费会员和VIP会员两种身份
- VIP会员享受无广告、专属声音等特权
- 支持会员升级功能

### 5. 积分和徽章系统
- 完成特定行为获得积分
- 积分达到一定数量可获得徽章
- 徽章展示和管理

## 数据模型

### 睡眠记录
```javascript
{
  startTime: string,  // 开始睡眠时间
  endTime: string,    // 结束睡眠时间
  duration: number,   // 睡眠时长（分钟）
  date: string        // 日期
}
```

### 徽章
```javascript
{
  id: string,         // 徽章ID
  name: string,       // 徽章名称
  description: string, // 徽章描述
  condition: boolean  // 获得条件
}
```

### 声音
```javascript
{
  id: number,         // 声音ID
  title: string,      // 声音名称
  category: string,   // 声音分类
  isVip: boolean,     // 是否为VIP专属
  duration: string,   // 声音时长
  thumbnail: string   // 缩略图
}
```

## 开发说明

### 添加新功能
1. 在`src/screens/`目录下创建新的屏幕组件
2. 在`App.js`中注册新的导航路由
3. 在`SleepContext.js`中添加相关状态和方法
4. 实现UI和功能逻辑

### 添加新声音
1. 将音频文件添加到`src/assets/sounds/`目录
2. 在`SoundLibraryScreen.js`中添加声音数据

### 自定义主题
- 修改组件中的`StyleSheet`定义
- 统一颜色和字体样式

## 测试和优化

### 测试建议
- 使用Expo Go在真机上测试所有功能
- 测试不同设备尺寸的适配性
- 测试音频播放的后台运行情况
- 测试通知功能的可靠性

### 优化方向
- 添加更多助眠声音和内容
- 实现更精确的睡眠质量监测
- 添加社交分享功能
- 优化应用性能和启动速度
- 添加云同步功能

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目！
