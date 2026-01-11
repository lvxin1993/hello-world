经过分析，发现“卡片只在左上角显示”的原因是 **`transform` 样式属性无效**。

具体问题在于 `rotateY` 属性被赋值为纯数字（弧度值），而 React Native 的样式系统要求该属性必须是带单位的字符串（如 `'1.5rad'` 或 `'90deg'`）。当提供无效值时，React Native 可能会忽略整个 `transform` 变换，导致所有卡片都无法移动到指定位置，从而默认堆叠在容器的左上角 (0,0)。

### 修复计划

1.  **修正 `rotateY` 格式**：
    在 `GrabModeView.js` 的布局计算逻辑中，将 `rotateY` 的值从数字改为带 `'rad'` 单位的字符串。
    ```javascript
    // 修改前
    rotateY: cardAngle, 
    // 修改后
    rotateY: `${cardAngle}rad`,
    ```

2.  **代码清理**：
    检查 `GrabCard` 中的 `transform` 属性，确保所有变换值都符合 React Native 的规范。

该修复将使 `transform` 重新生效，卡片将能够正确地根据计算出的 `translateX` 和 `translateY` 扇形排布。