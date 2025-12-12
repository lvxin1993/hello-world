const sharp = require('sharp');
const fs = require('fs');

// 创建assets目录（如果不存在）
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// 创建黑底白字的SleepWell图标SVG内容
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- 黑色背景 -->
  <rect width="1024" height="1024" fill="#000000"/>
  <!-- 白色文字 SleepWell -->
  <text x="512" y="512" font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">SleepWell</text>
</svg>
`;

// 将SVG内容写入文件
fs.writeFileSync('assets/icon.svg', svgContent.trim());

// 使用sharp将SVG转换为PNG
sharp(Buffer.from(svgContent))
  .png()
  .toFile('assets/icon.png')
  .then(() => {
    console.log('✅ Icon PNG created successfully!');
    
    // 创建adaptive-icon.png（Android自适应图标）
    return sharp(Buffer.from(svgContent))
      .resize(1024, 1024)
      .png()
      .toFile('assets/adaptive-icon.png');
  })
  .then(() => {
    console.log('✅ Adaptive icon PNG created successfully!');
    
    // 创建splash.png（启动屏幕）
    return sharp(Buffer.from(svgContent))
      .resize(2048, 2732)
      .png()
      .toFile('assets/splash.png');
  })
  .then(() => {
    console.log('✅ Splash screen PNG created successfully!');
    
    // 创建notification-icon.png（通知图标）
    return sharp(Buffer.from(svgContent))
      .resize(96, 96)
      .png()
      .toFile('assets/notification-icon.png');
  })
  .then(() => {
    console.log('✅ Notification icon PNG created successfully!');
    
    // 创建favicon.png（Web图标）
    return sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toFile('assets/favicon.png');
  })
  .then(() => {
    console.log('✅ All icons created successfully!');
  })
  .catch((err) => {
    console.error('❌ Error creating icons:', err);
  });
