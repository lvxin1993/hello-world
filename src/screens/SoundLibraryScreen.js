import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Audio } from 'expo-av';

const SoundLibraryScreen = () => {
  const { theme } = useThemeContext();
  const [playingSound, setPlayingSound] = useState(null);
  const [soundInstance, setSoundInstance] = useState(null);

  // 声音列表
  const sounds = [
    {
      id: 1,
      title: '雨声',
      category: '自然声音',
      isVip: false,
      duration: '1小时',
      thumbnail: '🌧️',
      soundFile: require('../../assets/sounds/rain.mp3'),
    },
    {
      id: 2,
      title: '海浪声',
      category: '自然声音',
      isVip: false,
      duration: '1小时',
      thumbnail: '🌊',
      soundFile: require('../../assets/sounds/ocean.mp3'),
    },
    {
      id: 3,
      title: '鸟鸣声',
      category: '自然声音',
      isVip: false,
      duration: '30分钟',
      thumbnail: '🐦',
      soundFile: require('../../assets/sounds/birds.mp3'),
    },
    {
      id: 4,
      title: '风声',
      category: '自然声音',
      isVip: false,
      duration: '1小时',
      thumbnail: '🍃',
      soundFile: require('../../assets/sounds/wind.mp3'),
    },
    {
      id: 5,
      title: '白噪音',
      category: '白噪音',
      isVip: false,
      duration: '无限',
      thumbnail: '🔊',
      soundFile: require('../../assets/sounds/whitenoise.mp3'),
    },
    {
      id: 6,
      title: '冥想音乐',
      category: '冥想',
      isVip: true,
      duration: '45分钟',
      thumbnail: '🧘',
      soundFile: require('../../assets/sounds/meditation.mp3'),
    },
  ];

  // 播放/暂停声音
  const toggleSound = async (sound) => {
    if (playingSound === sound.id) {
      // 暂停当前播放的声音
      if (soundInstance) {
        await soundInstance.pauseAsync();
        setPlayingSound(null);
      }
    } else {
      // 停止当前播放的声音
      if (soundInstance) {
        await soundInstance.stopAsync();
        await soundInstance.unloadAsync();
      }

      // 播放新声音
      try {
        const { sound: newSoundInstance } = await Audio.Sound.createAsync(
          sound.soundFile,
          { shouldPlay: true, isLooping: true }
        );
        setSoundInstance(newSoundInstance);
        setPlayingSound(sound.id);

        // 监听声音播放完成
        newSoundInstance.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            setPlayingSound(null);
            setSoundInstance(null);
          }
        });
      } catch (error) {
        console.error('播放声音失败:', error);
      }
    }
  };

  // 组件卸载时停止声音
  React.useEffect(() => {
    return () => {
      if (soundInstance) {
        soundInstance.unloadAsync();
      }
    };
  }, [soundInstance]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>助眠声音库</Text>
      
      <View style={styles.soundsContainer}>
        {sounds.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={[styles.soundCard, { backgroundColor: theme.card }]}
            onPress={() => toggleSound(sound)}
          >
            <View style={styles.soundThumbnail}>
              <Text style={styles.thumbnailEmoji}>{sound.thumbnail}</Text>
              {sound.isVip && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>VIP</Text>
                </View>
              )}
            </View>
            <View style={styles.soundInfo}>
              <Text style={[styles.soundTitle, { color: theme.text }]}>{sound.title}</Text>
              <Text style={[styles.soundCategory, { color: theme.textSecondary }]}>{sound.category}</Text>
              <Text style={[styles.soundDuration, { color: theme.textSecondary }]}>{sound.duration}</Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonEmoji}>
                {playingSound === sound.id ? '⏸️' : '▶️'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  soundsContainer: {
    gap: 15,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundThumbnail: {
    position: 'relative',
    marginRight: 15,
  },
  thumbnailEmoji: {
    fontSize: 40,
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  soundInfo: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  soundCategory: {
    fontSize: 14,
    marginBottom: 3,
  },
  soundDuration: {
    fontSize: 12,
  },
  playButton: {
    padding: 10,
  },
  playButtonEmoji: {
    fontSize: 30,
  },
});

export default SoundLibraryScreen;
