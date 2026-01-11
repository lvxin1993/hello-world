我找到了问题的根本原因。

### 问题根源
在 `App.js` 中，Web 端被强制限制在一个宽度为 **390px** 的模拟手机容器中。
然而，React Native 的 `Modal` 组件在 Web 端默认是挂载在页面根节点（body）上的，它的参照宽度是**整个浏览器窗口**（例如 1920px）。
因此，之前的计算逻辑 `Math.min(modalWidth, 480)` 在 Web 端会计算出 **480px**。
**480px (弹窗) > 390px (主页面)**，这就导致弹窗比主页面还要宽，视觉上非常突兀。

### 解决方案
我们需要在计算弹窗宽度时，明确感知到这个“390px”的容器限制。

我将修改 `src/screens/DreamJournalScreen.js`：
1.  **引入 Platform**：用于判断是否为 Web 环境。
2.  **修正有效屏幕宽度**：在 Web 端，强制将有效屏幕宽度视为 **390px**（或更小），而不是浏览器窗口宽度。
3.  **调整弹窗宽度比例**：基于这个修正后的宽度计算弹窗尺寸，确保它永远小于 390px。

**计算公式调整为：**
```javascript
const isWeb = Platform.OS === 'web';
// 在 Web 端，App 被限制在 390px 容器内；在 Native 端，使用实际屏幕宽度
const effectiveScreenWidth = isWeb ? Math.min(screenWidth, 390) : screenWidth;

// 主内容区宽度（减去左右 padding 32）
const mainContentWidth = effectiveScreenWidth - 32;

// 弹窗宽度设为内容的 90%（在小屏下尽量利用空间），且设定绝对上限
const finalModalWidth = Math.min(mainContentWidth * 0.9, isWeb ? 340 : 480);
```
这样在 Web 端，弹窗宽度最大为 340px，绝对小于 390px 的主页面，视觉上就会完美“包含”在 App 内了。

### 执行计划
1.  修改 `src/screens/DreamJournalScreen.js`，引入 `Platform` 并应用上述宽度计算逻辑。
2.  保持其他逻辑不变。