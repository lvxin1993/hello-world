import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, Alert, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useDreamJournalContext } from '../context/DreamJournalContext';
import RotatingCarousel from '../components/RotatingCarousel'; // 导入旋转木马组件
import CuteDreamAnimations from '../components/CuteDreamAnimations';

const DreamJournalScreen = () => {
  const { theme } = useThemeContext();
  const { dreamEntries, isLoading, error, addDreamEntry, deleteDreamEntry, scientificallyAnalyzeDream } = useDreamJournalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [scientificAnalysisModalVisible, setScientificAnalysisModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('butterfly');

  const handleAddEntry = async () => {
    try {
      await addDreamEntry(title, content);
      setModalVisible(false);
      setTitle('');
      setContent('');
    } catch (error) {
      Alert.alert('错误', '添加梦境记录失败');
    }
  };

  const handleDeleteEntry = async (id) => {
    Alert.alert('确认删除', '确定要删除这条梦境记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        deleteDreamEntry(id);
        setDetailModalVisible(false); // 如果是从详情页删除，则关闭详情页
      } }
    ]);
  };

  const handleScientificAnalysis = async (entry) => {
    if (!entry) return;

    const animations = ['butterfly', 'dragon', 'sleepingCat', 'dreamCloud', 'starNight'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    setSelectedEntry(entry);
    setCurrentAnimation(randomAnimation);
    setIsAnalyzing(true);
    setScientificAnalysisModalVisible(true);
    setShowAnimation(true);

    try {
      const analyzedEntry = await scientificallyAnalyzeDream(entry.id);
      if (analyzedEntry) {
        setSelectedEntry(prev => ({...prev, ...analyzedEntry}));
      }
    } catch (error) {
      Alert.alert('分析失败', '梦境分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
      setShowAnimation(false);
    }
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };

  // ... 样式定义保持不变 ...
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text
    },
    addButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold'
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)'
    },
    modalContent: {
      backgroundColor: theme.card,
      margin: 20,
      borderRadius: 12,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.text,
      textAlign: 'center', 
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: theme.text
    },
    detailTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.text
    },
    detailContent: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
      color: theme.text
    },
     detailActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.text
    },
    analysisLoadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>梦境日记</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>添加记录</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : error ? (
        <Text style={{ color: theme.error, textAlign: 'center' }}>{error}</Text>
      ) : (
        <RotatingCarousel data={dreamEntries} onCardPress={openDetailModal} />
      )}

      {/* 添加记录模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加梦境记录</Text>
            <TextInput
              style={styles.input}
              placeholder="梦境标题"
              placeholderTextColor={theme.placeholder}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="梦境内容"
              placeholderTextColor={theme.placeholder}
              multiline
              value={content}
              onChangeText={setContent}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button title="取消" onPress={() => setModalVisible(false)} color={theme.secondary} />
              <Button title="保存" onPress={handleAddEntry} color={theme.primary} />
            </View>
          </View>
        </View>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedEntry && (
                <>
                  <Text style={styles.detailTitle}>{selectedEntry.title}</Text>
                  <Text style={[styles.detailContent, { fontSize: 12, opacity: 0.7 }]}>
                    记录时间: {new Date(selectedEntry.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.detailContent}>{selectedEntry.content}</Text>
                  {selectedEntry.dreamType && (
                    <Text style={styles.detailContent}>
                      梦境类型: {selectedEntry.dreamType}
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
            {selectedEntry && (
              <View style={styles.detailActions}>
                  <Button title="科学解析" onPress={() => handleScientificAnalysis(selectedEntry)} color={theme.secondary} />
                  <Button title="删除" onPress={() => handleDeleteEntry(selectedEntry.id)} color={theme.error} />
              </View>
            )}
            <Button title="关闭" onPress={() => setDetailModalVisible(false)} color={theme.primary} />
          </View>
        </View>
      </Modal>

      {/* 科学解析模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={scientificAnalysisModalVisible}
        onRequestClose={() => setScientificAnalysisModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>科学解析</Text>
            {isAnalyzing ? (
              <View style={styles.analysisLoadingContainer}>
                <CuteDreamAnimations animationType={currentAnimation} isVisible={showAnimation} />
                <Text style={styles.loadingText}>正在解析梦境...</Text>
              </View>
            ) : (
              <ScrollView style={{maxHeight: 400}}> 
                <Text style={styles.detailContent}>
                  {selectedEntry && selectedEntry.scientificReport ? selectedEntry.scientificReport : '梦境解析完成'}
                </Text>
              </ScrollView>
            )}
            <Button
              title="关闭"
              onPress={() => setScientificAnalysisModalVisible(false)}
              color={theme.primary}
              disabled={isAnalyzing}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DreamJournalScreen;