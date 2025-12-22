import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Slider } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Audio } from 'expo-av';

// 实际声音列表数据（匹配assets/sounds目录下的文件）
const soundList = [
  { id: '1', title: '雨声', category: '自然', isVIP: false, thumbnail: '🌧️', file: require('../../assets/sounds/rain.mp3') },
  { id: '2', title: '海浪声', category: '自然', isVIP: false, thumbnail: '🌊', file: require('../../assets/sounds/ocean.mp3') },
  { id: '3', title: '风声', category: '自然', isVIP: false, thumbnail: '💨', file: require('../../assets/sounds/wind.mp3') },
  { id: '4', title: '鸟鸣', category: '自然', isVIP: false, thumbnail: '🐦', file: require('../../assets/sounds/birds.mp3') },
  { id: '5', title: '冥想音乐', category: '音乐', isVIP: true, thumbnail: '🧘', file: require('../../assets/sounds/meditation.mp3') },
  { id: '6', title: '白噪音', category: '其他', isVIP: false, thumbnail: '🎵', file: require('../../assets/sounds/whitenoise.mp3') },
];

// 声音卡片组件
const SoundCard = ({ sound, theme, onPress, isPlaying, volume, onVolumeChange }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.card }]} 
      onPress={() => onPress(sound)}
      activeOpacity={0.8}
    >
      <Text style={styles.thumbnail}>{sound.thumbnail}</Text>
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: theme.text }]}>{sound.title}</Text>
        <Text style={[styles.category, { color: theme.textSecondary }]}>{sound.category}</Text>
        {sound.isVIP && <Text style={styles.vipBadge}>VIP</Text>}
        {isPlaying && <Text style={styles.playingIndicator}>▶️ 播放中</Text>}
        
        {/* 音量控制滑块 */}
        {isPlaying && (
          <View style={styles.volumeContainer}>
            <Text style={[styles.volumeLabel, { color: theme.textSecondary }]}>音量</Text>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.textSecondary}
              thumbTintColor={theme.primary}
            />
            <Text style={[styles.volumeValue, { color: theme.textSecondary }]}>
              {Math.round(volume * 100)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SoundLibraryScreen = () => {
  try {
    const { theme } = useThemeContext();
    const [sound, setSound] = useState(null);
    const [currentPlayingSoundId, setCurrentPlayingSoundId] = useState(null);
    const [volume, setVolume] = useState(0.7); // 0-1范围

    // 播放或暂停声音
    const handleSoundPress = async (selectedSound) => {
      try {
        console.log('点击了声音:', selectedSound.title);
        
        // 如果点击的是当前播放的声音，则暂停
        if (currentPlayingSoundId === selectedSound.id && sound) {
          await sound.unloadAsync();
          setSound(null);
          setCurrentPlayingSoundId(null);
          return;
        }
        
        // 先卸载当前播放的声音
        if (sound) {
          await sound.unloadAsync();
        }
        
        // 加载并播放新声音
        const { sound: newSound } = await Audio.Sound.createAsync(
          selectedSound.file,
          { shouldPlay: true, volume: volume },
          onPlaybackStatusUpdate
        );
        
        setSound(newSound);
        setCurrentPlayingSoundId(selectedSound.id);
      } catch (error) {
        console.error('播放声音出错:', error);
        // 重置状态
        setSound(null);
        setCurrentPlayingSoundId(null);
      }
    };

    // 播放状态更新回调
    const onPlaybackStatusUpdate = (status) => {
      if (status.isLoaded) {
        if (status.didJustFinish) {
          // 播放完成后重置状态
          if (sound) {
            sound.unloadAsync();
            setSound(null);
            setCurrentPlayingSoundId(null);
          }
        }
      }
    };

    // 处理音量变化
    const handleVolumeChange = async (newVolume) => {
      setVolume(newVolume);
      if (sound) {
        await sound.setVolumeAsync(newVolume);
      }
    };

    // 组件卸载时清理
    useEffect(() => {
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [sound]);

    const renderSoundItem = ({ item }) => (
      <SoundCard 
        sound={item} 
        theme={theme} 
        onPress={handleSoundPress}
        isPlaying={currentPlayingSoundId === item.id}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    );
    
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.header, { color: theme.text }]}>音效库</Text>
        <FlatList
          data={soundList}
          renderItem={renderSoundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  } catch (error) {
    console.error('组件渲染错误:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>组件渲染出错</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    fontSize: 40,
    marginRight: 16,
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 8,
  },
  vipBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#F39C12',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  playingIndicator: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    margin: 10,
    textAlign: 'center',
  },
  // 音量控制样式
  volumeContainer: {
    marginTop: 8,
  },
  volumeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  volumeSlider: {
    height: 40,
    marginVertical: 8,
  },
  volumeValue: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default SoundLibraryScreen;