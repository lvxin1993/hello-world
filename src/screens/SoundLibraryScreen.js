import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSleepContext } from '../context/SleepContext'; // 1. 导入 SleepContext

const soundList = [
  { id: '1', title: '雨声', category: '自然', thumbnail: '🌧️', file: require('../../assets/sounds/rain.mp3') },
  { id: '2', title: '海浪声', category: '自然', thumbnail: '🌊', file: require('../../assets/sounds/ocean.mp3') },
  { id: '3', title: '风声', category: '自然', thumbnail: '💨', file: require('../../assets/sounds/wind.mp3') },
  { id: '4', title: '鸟鸣', category: '自然', thumbnail: '🐦', file: require('../../assets/sounds/birds.mp3') },
  { id: '5', title: '冥想音乐', category: '音乐', thumbnail: '🧘', file: require('../../assets/sounds/meditation.mp3') },
  { id: '6', title: '白噪音', category: '其他', thumbnail: '🎵', file: require('../../assets/sounds/whitenoise.mp3') },
];

const SoundRow = ({ sound, theme, onPress, isPlaying }) => (
  <View style={[styles.row, { backgroundColor: theme.card }]}>
    <View style={styles.thumbnailContainer}><Text style={styles.thumbnail}>{sound.thumbnail}</Text></View>
    <View style={styles.infoContainer}>
      <Text style={[styles.title, { color: theme.text }]}>{sound.title}</Text>
      <Text style={[styles.category, { color: theme.textSecondary }]}>{sound.category}</Text>
    </View>
    <TouchableOpacity onPress={() => onPress(sound)} style={styles.playButton}>
      <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={40} color={theme.primary} />
    </TouchableOpacity>
  </View>
);

const SoundLibraryScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { onAudioShouldStop, audioStopRemainingTime } = useSleepContext(); // 2. 获取事件和状态
  const soundObject = useRef(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  const cleanupSound = useCallback(async () => {
    if (soundObject.current) {
      await soundObject.current.stopAsync();
      await soundObject.current.unloadAsync();
      soundObject.current = null;
      setCurrentPlayingId(null);
    }
  }, []);

  // 3. 注册并监听全局停止事件
  useEffect(() => {
    const unsubscribe = onAudioShouldStop(cleanupSound);
    return unsubscribe;
  }, [cleanupSound, onAudioShouldStop]);

  const handleSoundPress = useCallback(async (selectedSound) => {
    try {
      if (currentPlayingId === selectedSound.id) {
        await cleanupSound();
        return;
      }

      await cleanupSound(); // Stop any currently playing sound first

      const { sound } = await Audio.Sound.createAsync(
        selectedSound.file,
        { shouldPlay: true, isLooping: true }
      );
      soundObject.current = sound;
      setCurrentPlayingId(selectedSound.id);

    } catch (error) {
      console.error('播放声音出错:', error);
      await cleanupSound();
    }
  }, [currentPlayingId, cleanupSound]);

  useEffect(() => {
    return () => cleanupSound(); // Final cleanup on unmount
  }, [cleanupSound]);
  
  const formatTime = (seconds) => {
      if (!seconds || seconds <= 0) return null;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border + '50'}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>纯净音效</Text>
        {/* 4. 显示全局定时器状态 */}
        <View style={styles.headerButton}>
            {audioStopRemainingTime && (
                <View style={{alignItems: 'center'}}>
                    <Ionicons name="timer" size={24} color={theme.primary} />
                    <Text style={[styles.timerText, {color: theme.primary}]}>{formatTime(audioStopRemainingTime)}</Text>
                </View>
            )}
        </View>
      </View>

      <FlatList
        data={soundList}
        renderItem={({ item }) => (
          <SoundRow 
            sound={item} 
            theme={theme} 
            onPress={handleSoundPress}
            isPlaying={currentPlayingId === item.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerButton: { padding: 5, minWidth: 60, alignItems: 'center' },
  timerText: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  listContainer: { paddingTop: 20, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  thumbnailContainer: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  thumbnail: { fontSize: 30 },
  infoContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: '500', marginBottom: 4 },
  category: { fontSize: 13 },
  playButton: { padding: 10 },
});

export default SoundLibraryScreen;
