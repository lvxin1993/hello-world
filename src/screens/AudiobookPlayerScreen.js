import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext'; // 1. 导入 SleepContext
import { audiobooks } from '../data/audiobooks';
import { getAudioUri } from '../utils/AssetManager';

const { width, height } = Dimensions.get('window');

const AudiobookPlayerScreen = ({ route, navigation }) => {
  const { theme } = useThemeContext();
  const { bookId } = route.params;
  const { onAudioShouldStop } = useSleepContext(); // 2. 获取事件注册函数
  const book = audiobooks.find(b => b.id === bookId);

  const sound = useRef(new Audio.Sound()).current;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [selectedNarrator, setSelectedNarrator] = useState(book.narrators[0]);
  const [isRateModalVisible, setRateModalVisible] = useState(false);
  const [isNarratorModalVisible, setNarratorModalVisible] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 3. 注册并监听全局停止事件
  useEffect(() => {
    const stopAudio = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
    };

    const unsubscribe = onAudioShouldStop(stopAudio);

    return unsubscribe; // 组件卸载时自动取消订阅
  }, [sound, onAudioShouldStop]);

  useEffect(() => {
    loadAudio();
    return () => unloadAudio();
  }, [selectedNarrator]);

  const loadAudio = async () => {
    try {
      setIsBuffering(true);
      setDownloadProgress(0);
      setIsLoaded(false);
      const { isLoaded: wasLoaded } = await sound.getStatusAsync();
      if (wasLoaded) await sound.unloadAsync();
      const localUri = await getAudioUri(selectedNarrator.audioUrl, setDownloadProgress);
      await sound.loadAsync({ uri: localUri }, { shouldPlay: isPlaying, rate: playbackRate });
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setIsLoaded(true);
      setIsBuffering(false);
    } catch (error) {
      console.error('Error loading audio', error);
      setIsBuffering(false);
    }
  };

  // ... (rest of the functions remain the same) ...
  const onPlaybackStatusUpdate = (status) => {
      setPlaybackStatus(status);
      if (status.isLoaded) {
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) setIsPlaying(false);
      }
  }
  const unloadAudio = async () => { await sound.unloadAsync(); };
  const handlePlayPause = async () => { if (!isLoaded || isBuffering) return; if (isPlaying) await sound.pauseAsync(); else await sound.playAsync(); };
  const seekAudio = async (value) => { if (!isLoaded || isBuffering) return; await sound.setPositionAsync(value); };
  const forwardAudio = async () => { if (!isLoaded || !playbackStatus || isBuffering) return; const newPosition = playbackStatus.positionMillis + 15000; seekAudio(Math.min(newPosition, playbackStatus.durationMillis)); };
  const backwardAudio = async () => { if (!isLoaded || !playbackStatus || isBuffering) return; const newPosition = playbackStatus.positionMillis - 15000; seekAudio(Math.max(newPosition, 0)); };
  const changeRate = async (rate) => { setPlaybackRate(rate); if (isLoaded) await sound.setRateAsync(rate, true); setRateModalVisible(false); };
  const changeNarrator = (narrator) => { if(narrator.id === selectedNarrator.id) return; setSelectedNarrator(narrator); setNarratorModalVisible(false); }
  const formatTime = (millis) => { if (millis === null || isNaN(millis)) return '0:00'; const totalSeconds = Math.floor(millis / 1000); const seconds = totalSeconds % 60; const minutes = Math.floor(totalSeconds / 60); return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };
  
  if (!book) return <View style={styles.container}><Text style={{color: theme.text}}>Book not found.</Text></View>;
  const playbackRates = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={32} color={theme.text} /></TouchableOpacity>
        <Image source={{ uri: book.coverImageUrl }} style={styles.coverImage} />
        <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>{book.author}</Text>
        
        {isBuffering ? (
            <View style={styles.bufferingContainer}><ActivityIndicator size="large" color={theme.primary} /><Text style={[styles.bufferingText, {color: theme.textSecondary}]}>{downloadProgress > 0 ? `正在下载... ${(downloadProgress * 100).toFixed(0)}%` : '正在准备...'}</Text></View>
        ) : (
            <>
                <Slider style={styles.slider} minimumValue={0} maximumValue={playbackStatus?.durationMillis || 1} value={playbackStatus?.positionMillis || 0} onSlidingComplete={seekAudio} minimumTrackTintColor={theme.primary} maximumTrackTintColor={theme.border} thumbTintColor={theme.primary} />
                <View style={styles.timeContainer}><Text style={{color: theme.textSecondary}}>{formatTime(playbackStatus?.positionMillis)}</Text><Text style={{color: theme.textSecondary}}>{formatTime(playbackStatus?.durationMillis)}</Text></View>
                <View style={styles.controlsContainer}><TouchableOpacity onPress={backwardAudio}><Ionicons name="play-back-circle-outline" size={40} color={theme.text} /></TouchableOpacity><TouchableOpacity onPress={handlePlayPause} style={[styles.playButton, {backgroundColor: theme.primary}]}><Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={60} color="#fff" /></TouchableOpacity><TouchableOpacity onPress={forwardAudio}><Ionicons name="play-forward-circle-outline" size={40} color={theme.text} /></TouchableOpacity></View>
                <View style={styles.extraControlsContainer}><TouchableOpacity style={styles.extraControlButton} onPress={() => setNarratorModalVisible(true)}><Ionicons name="person-circle-outline" size={24} color={theme.textSecondary} /><Text style={[styles.extraControlText, {color: theme.textSecondary}]}>{selectedNarrator.name}</Text></TouchableOpacity><TouchableOpacity style={styles.extraControlButton} onPress={() => setRateModalVisible(true)}><Ionicons name="speedometer-outline" size={24} color={theme.textSecondary} /><Text style={[styles.extraControlText, {color: theme.textSecondary}]}>{playbackRate.toFixed(2)}x</Text></TouchableOpacity></View>
            </>
        )}

        <Modal transparent={true} visible={isRateModalVisible} onRequestClose={() => setRateModalVisible(false)}><View style={styles.modalContainer}><View style={[styles.modalContent, {backgroundColor: theme.card}]}><Text style={[styles.modalTitle, {color: theme.text}]}>选择播放速度</Text><FlatList data={playbackRates} keyExtractor={item => item.toString()} renderItem={({item}) => (<TouchableOpacity style={styles.modalItem} onPress={() => changeRate(item)}><Text style={[styles.modalItemText, {color: playbackRate === item ? theme.primary : theme.text}]}>{item.toFixed(2)}x</Text></TouchableOpacity>)}/></View></View></Modal>
        <Modal transparent={true} visible={isNarratorModalVisible} onRequestClose={() => setNarratorModalVisible(false)}><View style={styles.modalContainer}><View style={[styles.modalContent, {backgroundColor: theme.card}]}><Text style={[styles.modalTitle, {color: theme.text}]}>选择音色</Text><FlatList data={book.narrators} keyExtractor={item => item.id} renderItem={({item}) => (<TouchableOpacity style={styles.modalItem} onPress={() => changeNarrator(item)}><Text style={[styles.modalItemText, {color: selectedNarrator.id === item.id ? theme.primary : theme.text}]}>{item.name}</Text></TouchableOpacity>)}/></View></View></Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1 },
  coverImage: { width: width * 0.7, height: width * 0.7, borderRadius: 12, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  author: { fontSize: 18, marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '80%', marginTop: 20 },
  playButton: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  extraControlsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 30, borderTopWidth: 1, borderTopColor: '#e0e0e020', paddingTop: 15 },
  extraControlButton: { alignItems: 'center' },
  extraControlText: { marginTop: 5, fontSize: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: '80%', maxHeight: height * 0.6, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, alignItems: 'center' },
  modalItemText: { fontSize: 18 },
  bufferingContainer: { marginTop: 40, alignItems: 'center' },
  bufferingText: { marginTop: 15 },
});

export default AudiobookPlayerScreen;
