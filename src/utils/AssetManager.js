import * as FileSystem from 'expo-file-system';

// 定义音频文件的存储目录
const audioDirectory = FileSystem.documentDirectory + 'audiobooks/';

/**
 * 确保目录存在
 */
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(audioDirectory);
  if (!dirInfo.exists) {
    console.log("Audiobook directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(audioDirectory, { intermediates: true });
  }
};

/**
 * 从远程 URL 获取本地文件名
 * @param {string} remoteUrl - 远程文件的 URL
 * @returns {string} - 本地文件名
 */
const getLocalFileName = (remoteUrl) => {
  // 使用 URL 的最后一部分作为文件名，并确保它是有效的文件名
  return remoteUrl.split('/').pop().replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * 获取音频文件的本地 URI。如果不存在，则下载它。
 * @param {string} remoteUrl - 音频文件的远程 URL
 * @param {function(progress: number): void} [onProgress] - 下载进度回调 (0-1)
 * @returns {Promise<string>} - 本地文件 URI
 */
export const getAudioUri = async (remoteUrl, onProgress) => {
  await ensureDirExists();
  const fileName = getLocalFileName(remoteUrl);
  const localUri = audioDirectory + fileName;

  const fileInfo = await FileSystem.getInfoAsync(localUri);

  if (fileInfo.exists) {
    console.log(`File already exists locally: ${localUri}`);
    return localUri;
  } else {
    console.log(`File doesn't exist, downloading from ${remoteUrl}`);
    
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) {
          onProgress(progress);
        }
      }
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      console.log('Finished downloading to', uri);
      return uri;
    } catch (e) {
      console.error('Error downloading file:', e);
      // 如果下载失败，尝试删除可能已创建的不完整文件
      const failedFileInfo = await FileSystem.getInfoAsync(localUri);
      if(failedFileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
      throw e; // 将错误抛出，让调用者处理
    }
  }
};

/**
 * 清除所有已下载的音频缓存
 * @returns {Promise<void>}
 */
export const clearAudioCache = async () => {
  console.log('Clearing all audio cache...');
  await FileSystem.deleteAsync(audioDirectory, { idempotent: true });
  console.log('Audio cache cleared.');
};
