import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, Alert, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, useWindowDimensions, Platform } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useDreamJournalContext } from '../context/DreamJournalContext';
import CuteDreamAnimations from '../components/CuteDreamAnimations';
import MoleculeLoading from '../components/MoleculeLoading';
import DreamEntryCard from '../components/DreamEntryCard'; // 1. 导入新的动画卡片组件

const animationAssets = {
  butterfly: {
    source: require('../../assets/animations/butterfly.gif'),
    description: '庄周梦蝶 - 蝴蝶在花丛中飞舞',
  },
};

const SPACING = 12;

const DreamJournalScreen = () => {
  const { theme } = useThemeContext();
  const { width: screenWidth } = useWindowDimensions(); // 重命名为screenWidth，更清晰
  const { dreamEntries, isLoading, error, addDreamEntry, deleteDreamEntry, scientificallyAnalyzeDream } = useDreamJournalContext();

  // 计算主页面内容宽度（列表区域的宽度）
  const isWeb = Platform.OS === 'web';
  // 在 Web 端，App 被限制在 390px 容器内；在 Native 端，使用实际屏幕宽度
  const effectiveScreenWidth = isWeb ? Math.min(screenWidth, 390) : screenWidth;
  const mainContentWidth = effectiveScreenWidth - 32; // 左右各16px padding
  
  // 弹窗宽度：主内容宽度的 90%
  const modalWidth = mainContentWidth * 0.9;
  
  // 弹窗最大宽度（避免大屏设备上弹窗过宽，Web端限制更严格以适配390px容器）
  const maxModalWidth = isWeb ? 340 : 480;
  
  // 最终弹窗宽度
  const finalModalWidth = Math.min(modalWidth, maxModalWidth);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [scientificAnalysisModalVisible, setScientificAnalysisModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddEntry = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('提示', '标题和内容不能为空');
      return;
    }
    try {
      await addDreamEntry(title, content);
      setModalVisible(false);
      setTitle('');
      setContent('');
    } catch (error) {
      Alert.alert('错误', '添加梦境记录失败');
    }
  };

  const handleDeleteEntry = (id) => {
    Alert.alert('确认删除', '确定要删除这条梦境记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteDreamEntry(id) }
    ]);
  };

  const handleScientificAnalysis = async (entry) => {
    if (!entry) return;
    setSelectedEntry(entry);
    setIsAnalyzing(true);
    setScientificAnalysisModalVisible(true);
    try {
      const analyzedEntry = await scientificallyAnalyzeDream(entry.id);
      if (analyzedEntry) {
        setSelectedEntry(prev => ({...prev, ...analyzedEntry}));
      }
    } catch (error) {
      Alert.alert('分析失败', '梦境分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };

  // 2. 重构 renderItem 以使用新的 DreamEntryCard 组件
  const renderDreamEntry = ({ item, index }) => (
    <DreamEntryCard 
      item={item} 
      index={index} 
      onDetail={() => openDetailModal(item)}
      onAnalyze={() => handleScientificAnalysis(item)}
      onDelete={() => handleDeleteEntry(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>梦境日记</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>添加记录</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{flex: 1}}/>
      ) : error ? (
        <Text style={{ color: theme.error, textAlign: 'center', marginTop: 20 }}>{error}</Text>
      ) : (
        <FlatList
            data={dreamEntries}
            renderItem={renderDreamEntry}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[styles.listContainer, { paddingHorizontal: 16 }]}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING }} />}
            ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, {color: theme.textSecondary}]}>还没有梦境记录，点击上方添加吧！</Text>
                </View>
            )}
        />
      )}

      {/* ... 所有 Modal 保持不变 ... */}
       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
         <View style={[
  styles.modalContent, 
  {
    backgroundColor: theme.card,
    width: finalModalWidth, // 使用计算后的弹窗宽度
    maxHeight: '60%' // 保留最大高度约束
  }
]}>
              <Text style={[styles.modalTitle, {color: theme.text}]}>添加梦境记录</Text>
              <TextInput 
                style={[styles.input, {color: theme.text, borderColor: theme.border}]} 
                placeholder="梦境标题" 
                placeholderTextColor={theme.placeholder} 
                value={title} 
                onChangeText={setTitle}
                maxLength={50}
              />
              <TextInput 
                style={[styles.input, styles.addModalTextarea, { textAlignVertical: 'top', color: theme.text, borderColor: theme.border}]} 
                placeholder="梦境内容" 
                placeholderTextColor={theme.placeholder} 
                multiline 
                value={content} 
                onChangeText={setContent}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                <Button title="取消" onPress={() => setModalVisible(false)} color={theme.secondary} />
                <Button title="保存" onPress={handleAddEntry} color={theme.primary} />
              </View>
            </View>
          </View>
      </Modal>
      <Modal animationType="fade" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
          <View style={styles.modalContainer}>
           <View style={[
  styles.modalContent,
  {
    backgroundColor: theme.card,
    width: finalModalWidth,
  }
]}>
              <ScrollView>
                <Text style={[styles.detailTitle, {color: theme.text}]}>{selectedEntry?.title}</Text>
                <Text style={[styles.detailContent, {color: theme.textSecondary, fontSize: 12}]}>记录时间: {selectedEntry ? new Date(selectedEntry.createdAt).toLocaleString() : ''}</Text>
                <Text style={[styles.detailContent, {color: theme.text}]}>{selectedEntry?.content}</Text>
                {selectedEntry?.scientificReport && (
                  <Text style={[styles.detailContent, {color: theme.textSecondary}]}>{selectedEntry.scientificReport}</Text>
                )}
                {selectedEntry?.dreamType && (<Text style={styles.detailContent}>梦境类型: {selectedEntry.dreamType}</Text>)}
              </ScrollView>
              <View style={{marginTop: 15}}>
                <Button title="关闭" onPress={() => setDetailModalVisible(false)} color={theme.primary} />
              </View>
            </View>
          </View>
      </Modal>
      <Modal animationType="fade" transparent={true} visible={scientificAnalysisModalVisible} onRequestClose={() => setScientificAnalysisModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[
  styles.modalContent,
  {
    backgroundColor: theme.card,
    width: finalModalWidth,
  }
]}>
              <Text style={[styles.modalTitle, {color: theme.text}]}>科学解析</Text>
              {isAnalyzing ? (
                <View style={styles.analysisLoadingContainer}>
                  <MoleculeLoading width={200} height={200} />
                  <Text style={[styles.loadingText, {color: theme.text}]}>正在解析梦境...</Text>
                </View>
              ) : (
                <ScrollView style={{maxHeight: 400}}>
                  <Text style={[styles.detailContent, {color: theme.text}]}>{selectedEntry?.scientificReport || '梦境解析完成'}</Text>
                </ScrollView>
              )}
              <View style={{marginTop: 15}}>
                <Button title="关闭" onPress={() => setScientificAnalysisModalVisible(false)} color={theme.primary} disabled={isAnalyzing}/>
              </View>
            </View>
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e020' }, // 使用带透明度的颜色
    title: { fontSize: 24, fontWeight: 'bold' },
    addButton: { backgroundColor: '#1e90ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    listContainer: { paddingTop: 12 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { margin: 20, borderRadius: 12, padding: 16, maxHeight: '80%' },
    
   
    addModalTextarea: { height: 100 },
    detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
    detailContent: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
    loadingText: { marginTop: 12, fontSize: 16 },
    analysisLoadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
});

export default DreamJournalScreen;
