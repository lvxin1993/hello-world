## 修改梦境分析API调用优先级

### 目标
将梦境分析的API调用顺序从**优先DeepSeek，失败后本地分析**改为**优先MIMO，失败后DeepSeek，最后本地分析**。

### 修改内容
1. **修改`scientificallyAnalyzeDream`函数**（DreamJournalContext.js:296-345）
   - 优先尝试调用`analyzeDreamWithMIMO`函数
   - 如果MIMO API失败，尝试调用`analyzeDreamWithDeepSeek`（如果还有调用次数）
   - 如果DeepSeek API也失败或次数用尽，使用本地分析
   - 更新用户提示信息，显示正确的分析来源

2. **更新API使用限制检查**
   - 保持DeepSeek API的每日100次调用限制
   - MIMO API暂不设置调用限制

3. **修改用户提示信息**
   - 当使用MIMO API时，显示"使用MIMO AI分析"
   - 当使用DeepSeek API时，显示"使用DeepSeek AI分析（今日剩余次数: X）"
   - 当使用本地分析时，显示"使用本地规则库分析（API调用失败）"

### 技术细节
- 保留现有的`analyzeDreamWithMIMO`、`analyzeDreamWithDeepSeek`和`analyzeDreamLocally`函数
- 调整try-catch嵌套结构，实现优先级调用逻辑
- 更新分析结果的`analysisMethod`字段，确保前端显示正确

### 预期效果
- 梦境分析优先使用MIMO API，提高分析速度和准确性
- 当MIMO API不可用时，自动降级到DeepSeek API
- 当所有API都不可用时，使用本地分析作为兜底方案
- 用户会收到明确的分析来源提示

### 文件修改
- `\github____git\hello-world\src\context\DreamJournalContext.js`