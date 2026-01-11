import { Dimensions, PixelRatio } from 'react-native';

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 设计稿尺寸（假设为iPhone 8的尺寸，16:9比例）
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 667;

// 计算缩放比例
const scale = Math.min(SCREEN_WIDTH / DESIGN_WIDTH, SCREEN_HEIGHT / DESIGN_HEIGHT);

/**
 * 根据设计稿尺寸，返回适配后的尺寸
 * @param {number} size - 设计稿上的尺寸
 * @returns {number} - 适配后的尺寸
 */
export const responsiveSize = (size) => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * 根据设计稿字体大小，返回适配后的字体大小
 * @param {number} size - 设计稿上的字体大小
 * @returns {number} - 适配后的字体大小
 */
export const responsiveFontSize = (size) => {
  // 针对长屏手机，略微增加字体大小
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  const fontScale = aspectRatio > 2 ? 1.1 : 1; // 16:9的比例是1.777，2以上为更长屏
  return responsiveSize(size) * fontScale;
};

/**
 * 返回百分比宽度
 * @param {number} percentage - 百分比值（0-100）
 * @returns {number} - 对应百分比的宽度
 */
export const widthPercentage = (percentage) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * 返回百分比高度
 * @param {number} percentage - 百分比值（0-100）
 * @returns {number} - 对应百分比的高度
 */
export const heightPercentage = (percentage) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * 判断是否为长屏手机
 * @returns {boolean} - 是否为长屏手机（比例大于16:9）
 */
export const isLongScreen = () => {
  return (SCREEN_HEIGHT / SCREEN_WIDTH) > 1.777; // 16:9的比例是1.777
};

/**
 * 返回适配的间距
 * @param {number} size - 基础间距大小
 * @returns {number} - 适配后的间距
 */
export const spacing = (size) => {
  // 根据屏幕尺寸调整间距
  const baseSpacing = responsiveSize(size);
  return isLongScreen() ? baseSpacing * 1.2 : baseSpacing;
};