import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const MoleculeLoading = ({ width = 200, height = 200 }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            margin: 0;
            padding: 0;
            /* 使用深色渐变背景，营造科技/梦境感 */
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            font-family: sans-serif;
          }
          
          /* Container */
          .loader {
              position: relative;
              width: 100px;
              height: 100px;
              transform-style: preserve-3d;
              perspective: 500px;
          }
          
          /* Orbits */
          .orbit {
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 2px solid rgba(100, 200, 255, 0.3);
              transform-style: preserve-3d;
          }
          
          .orbit:nth-child(1) { transform: rotateX(70deg) rotateY(10deg); }
          .orbit:nth-child(2) { transform: rotateX(70deg) rotateY(70deg); }
          .orbit:nth-child(3) { transform: rotateX(70deg) rotateY(130deg); }

          /* Electrons */
          .electron {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              animation: spin 2s linear infinite;
              transform-style: preserve-3d;
          }
          
          .electron::before {
              content: '';
              position: absolute;
              top: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #00f2fe;
              box-shadow: 0 0 10px #00f2fe;
          }
          
          /* Nucleus */
          .nucleus {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 16px;
              height: 16px;
              background: #4facfe;
              border-radius: 50%;
              box-shadow: 0 0 15px #4facfe;
          }
          
          @keyframes spin {
              0% { transform: rotateZ(0deg); }
              100% { transform: rotateZ(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="nucleus"></div>
          <div class="orbit">
            <div class="electron"></div>
          </div>
          <div class="orbit">
            <div class="electron"></div>
          </div>
          <div class="orbit">
            <div class="electron"></div>
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={{ width, height, borderRadius: 12, overflow: 'hidden' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ backgroundColor: 'transparent' }} // Android workaround
        scrollEnabled={false}
        scalesPageToFit={false}
        nestedScrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
};

export default MoleculeLoading;
