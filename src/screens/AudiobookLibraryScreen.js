import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { audiobooks, CATEGORIES } from '../data/audiobooks';
import { getDownloadedBooks } from '../services/NovelService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 15;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const AudiobookLibraryScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [downloadedBooks, setDownloadedBooks] = useState([]);

  useFocusEffect(
    useCallback(() => {
        getDownloadedBooks().then(setDownloadedBooks);
    }, [])
  );

  const allBooks = useMemo(() => {
      return [...downloadedBooks, ...audiobooks];
  }, [downloadedBooks]);

  const filteredAudiobooks = useMemo(() => {
    if (selectedCategory === 'All') {
      return allBooks;
    }
    return allBooks.filter(book => book.category === selectedCategory);
  }, [selectedCategory, allBooks]);

  const renderCategoryFilter = () => {
    const categories = ['All', ...Object.values(CATEGORIES)];
    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                { backgroundColor: selectedCategory === category ? theme.primary : theme.card },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={{ color: selectedCategory === category ? '#fff' : theme.text }}>
                {category === 'All' ? '全部' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => navigation.navigate('AudiobookPlayer', { bookId: item.id })}
    >
      <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerButton}>
                <Ionicons name="home-outline" size={26} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>有声书库</Text>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => navigation.navigate('NovelSearch')} style={[styles.headerButton, {marginRight: 10}]}>
                    <Ionicons name="search" size={26} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={28} color={theme.text} />
                </TouchableOpacity>
            </View>
        </View>
        {renderCategoryFilter()}
        <FlatList
            data={filteredAudiobooks}
            renderItem={renderBookItem}
            keyExtractor={item => item.id}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={{color: theme.text, textAlign: 'center', marginTop: 50}}>该分类下暂无读物</Text>}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50, 
        paddingBottom: 10,
        paddingHorizontal: 16,
      },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerButton: {
        padding: 5,
    },
    filterContainer: {
        paddingHorizontal: ITEM_MARGIN,
        paddingVertical: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    listContainer: {
        paddingHorizontal: ITEM_MARGIN / 2,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        margin: ITEM_MARGIN / 2,
        marginBottom: 20,
    },
    coverImage: {
        width: '100%',
        height: ITEM_WIDTH * 1.4,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    title: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    author: {
        marginTop: 4,
        fontSize: 14,
    },
});

export default AudiobookLibraryScreen;
