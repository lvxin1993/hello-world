import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useSleepContext } from '../context/SleepContext'; // 1. 导入 SleepContext

const ListeningHubScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  // 2. 获取全局定时器函数和状态
  const { startAudioStopTimer, cancelAudioStopTimer, audioStopRemainingTime } = useSleepContext();
  const [isTimerModalVisible, setTimerModalVisible] = useState(false);

  const timerOptions = [15, 30, 45, 60];

  const handleSelectTime = (minutes) => {
    startAudioStopTimer(minutes);
    setTimerModalVisible(false);
  };

  const handleCancelTimer = () => {
    cancelAudioStopTimer();
    setTimerModalVisible(false);
  }
  
  const formatTime = (seconds) => {
      if (!seconds || seconds <= 0) return null;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>聆听</Text>
            {/* 3. 更新定时器按钮 */}
            <TouchableOpacity onPress={() => setTimerModalVisible(true)} style={styles.headerButton}>
                <Ionicons name={audioStopRemainingTime ? "timer" : "timer-outline"} size={28} color={audioStopRemainingTime ? theme.primary : theme.text} />
                {audioStopRemainingTime && <Text style={[styles.timerText, {color: theme.primary}]}>{formatTime(audioStopRemainingTime)}</Text>}
            </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SoundLibrary')}>
                <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop' }} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                    <Text style={styles.cardTitle}>纯净音效</Text>
                    <Text style={styles.cardDescription}>风声、雨声、白噪音，回归纯粹的声音世界。</Text>
                </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AudiobookLibrary')}>
                 <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop' }} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                    <Text style={styles.cardTitle}>有声书库</Text>
                    <Text style={styles.cardDescription}>治愈系散文、轻量小说，伴你温柔入梦。</Text>
                </ImageBackground>
            </TouchableOpacity>
        </View>

        {/* 4. 添加定时器选择模态框 */}
        <Modal transparent={true} visible={isTimerModalVisible} onRequestClose={() => setTimerModalVisible(false)}>
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setTimerModalVisible(false)}>
                <View style={[styles.modalContent, {backgroundColor: theme.card}]}>
                    <Text style={[styles.modalTitle, {color: theme.text}]}>定时停止播放</Text>
                    <FlatList 
                        data={timerOptions}
                        keyExtractor={item => item.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectTime(item)}>
                                <Text style={[styles.modalItemText, {color: theme.text}]}>{item} 分钟</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={styles.modalSeparator} />
                    <TouchableOpacity style={styles.modalItem} onPress={handleCancelTimer}>
                        <Text style={[styles.modalItemText, {color: theme.error}]}>关闭定时器</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerButton: { padding: 5, minWidth: 60, alignItems: 'center' }, // 增加最小宽度
  timerText: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  cardContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { height: '35%', borderRadius: 20, marginBottom: 30, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  imageBackground: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  imageStyle: { borderRadius: 20 },
  cardTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  cardDescription: { color: '#fff', fontSize: 16, marginTop: 5, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  // Modal styles
  modalContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20, paddingBottom: 30 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, alignItems: 'center' },
  modalItemText: { fontSize: 18 },
  modalSeparator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 5 },
});

export default ListeningHubScreen;
