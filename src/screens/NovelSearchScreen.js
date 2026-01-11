import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { searchBooks, downloadBook } from '../services/NovelService';

const NovelSearchScreen = ({ navigation }) => {
    const { theme } = useThemeContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const books = await searchBooks(query);
            setResults(books);
        } catch (error) {
            Alert.alert('Error', 'Failed to search books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (book) => {
        setDownloadingId(book.id);
        setDownloadProgress(0);
        try {
            await downloadBook(book, (progress) => {
                setDownloadProgress(progress);
            });
            Alert.alert('Success', 'Book downloaded successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to download book. It might not have a text format available.');
        } finally {
            setDownloadingId(null);
        }
    };

    const renderItem = ({ item }) => {
        const hasText = item.formats['text/plain; charset=utf-8'] || item.formats['text/plain'];
        const coverUrl = item.formats['image/jpeg'];

        return (
            <View style={[styles.itemContainer, { backgroundColor: theme.card }]}>
                <Image 
                    source={{ uri: coverUrl || 'https://via.placeholder.com/150' }} 
                    style={styles.coverImage} 
                />
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.author, { color: theme.textSecondary }]}>
                        {item.authors.map(a => a.name).join(', ')}
                    </Text>
                    <Text style={[styles.lang, { color: theme.textSecondary }]}>Language: {item.languages.join(', ')}</Text>
                    
                    {downloadingId === item.id ? (
                        <View style={styles.progressContainer}>
                            <ActivityIndicator size="small" color={theme.primary} />
                            <Text style={{color: theme.textSecondary, fontSize: 12}}>
                                {(downloadProgress * 100).toFixed(0)}%
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.downloadButton, { backgroundColor: hasText ? theme.primary : '#ccc' }]}
                            disabled={!hasText}
                            onPress={() => handleDownload(item)}
                        >
                            <Text style={styles.downloadText}>{hasText ? 'Download' : 'No Text'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Search Novels</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Search titles, authors..."
                    placeholderTextColor={theme.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch}>
                    <Ionicons name="search" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>
                            No results found. Try searching for "Austen" or "Dickens".
                        </Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 10, borderRadius: 8 },
    input: { flex: 1, fontSize: 16, marginRight: 10 },
    listContent: { padding: 16 },
    itemContainer: { flexDirection: 'row', marginBottom: 16, borderRadius: 8, overflow: 'hidden', padding: 10 },
    coverImage: { width: 60, height: 90, borderRadius: 4, backgroundColor: '#eee' },
    infoContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    author: { fontSize: 14, marginBottom: 2 },
    lang: { fontSize: 12, marginBottom: 8 },
    downloadButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, alignSelf: 'flex-start' },
    downloadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 }
});

export default NovelSearchScreen;
