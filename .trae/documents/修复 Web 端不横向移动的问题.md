## 现象与原因
- Web 端卡片只出现缩放反馈，但列表不横向移动。
- scrollEnabled=false 在 React Native Web 中会将 ScrollView 的 overflow 设为 hidden，导致即便设置 scrollLeft/scrollTo 也不可见。
- 我们移除了 Web 端直接 DOM 操作，且禁用了原生滚动，使 Web 上程序化滚动不可见。

## 修复方案
1) 平台区分滚动开关
- Web: 保持原生滚动能力（scrollEnabled=true），允许容器产生实际水平滚动与 overflow。
- 原生端: 继续禁用原生滚动（scrollEnabled=false），保持 PanResponder 手动控制。

2) Web 端程序化滚动回退到 DOM 节点
- 在应用位移处，Web 分支使用 getScrollableNode() 设置 node.scrollLeft；其余平台使用 scrollTo。
- 同步 scrollX.setValue 保障动效一致。

3) 明确 ScrollView 宽度
- 给滚动容器设置 width:'100%'，确保容器小于内容宽度产生 overflow，从而可滚动。

4) 其他逻辑保持
- 保留已实现的惯性两阶段、基于速度方向的边界判断、点击位置扣除内边距与依赖瘦身。

## 验证
- 在 Web 预览中观察卡片横向自动移动、拖拽与惯性；在原生端保持当前手动滚动行为。
- 切换速度与方向、屏幕尺寸变化时横向移动稳定，无重启抖动。

## 风险
- React Native Web 版本差异可能影响 getScrollableNode；若不可用则退回 scrollTo。
- 若 web 原生滚动与 PanResponder交互需要微调，可限制 PanResponder 仅在非 web 时启用拦截。