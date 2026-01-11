import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../data/audiobooks';

const NOVEL_DIR = FileSystem.documentDirectory + 'novels/';
const DOWNLOADED_BOOKS_KEY = 'user_downloaded_books';

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(NOVEL_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(NOVEL_DIR, { intermediates: true });
  }
};

export const searchBooks = async (query) => {
  try {
    const response = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const downloadBook = async (book, onProgress) => {
  await ensureDirExists();
  
  // Find text content
  const textFormat = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'];
  if (!textFormat) {
    throw new Error('No text content available for this book.');
  }

  const fileName = `${book.id}_${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  const localUri = NOVEL_DIR + fileName;

  const downloadResumable = FileSystem.createDownloadResumable(
    textFormat,
    localUri,
    {},
    (downloadProgress) => {
        if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
             const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
             onProgress(progress);
        }
    }
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    
    // Create book object for app
    const newBook = {
      id: `local_${book.id}`,
      title: book.title,
      author: book.authors.map(a => a.name).join(', '),
      category: CATEGORIES.NOVEL, // Default to Novel
      description: `Downloaded from Project Gutenberg. Language: ${book.languages.join(', ')}`,
      coverImageUrl: book.formats['image/jpeg'] || null,
      isLocal: true,
      localPath: uri,
      narrators: [], // Will use system TTS
      downloadDate: new Date().toISOString(),
    };

    // Save to storage
    await saveBookToStorage(newBook);
    
    return newBook;
  } catch (e) {
    console.error('Download error:', e);
    throw e;
  }
};

const saveBookToStorage = async (newBook) => {
    try {
        const storedBooks = await AsyncStorage.getItem(DOWNLOADED_BOOKS_KEY);
        const books = storedBooks ? JSON.parse(storedBooks) : [];
        // Check if exists
        const index = books.findIndex(b => b.id === newBook.id);
        if (index !== -1) {
            books[index] = newBook;
        } else {
            books.push(newBook);
        }
        await AsyncStorage.setItem(DOWNLOADED_BOOKS_KEY, JSON.stringify(books));
    } catch (e) {
        console.error('Error saving book metadata', e);
    }
};

export const getDownloadedBooks = async () => {
    try {
        const storedBooks = await AsyncStorage.getItem(DOWNLOADED_BOOKS_KEY);
        return storedBooks ? JSON.parse(storedBooks) : [];
    } catch (e) {
        console.error('Error getting downloaded books', e);
        return [];
    }
};

export const deleteBook = async (bookId) => {
    try {
        const storedBooks = await AsyncStorage.getItem(DOWNLOADED_BOOKS_KEY);
        let books = storedBooks ? JSON.parse(storedBooks) : [];
        const book = books.find(b => b.id === bookId);
        
        if (book && book.localPath) {
            await FileSystem.deleteAsync(book.localPath, { idempotent: true });
        }
        
        books = books.filter(b => b.id !== bookId);
        await AsyncStorage.setItem(DOWNLOADED_BOOKS_KEY, JSON.stringify(books));
    } catch (e) {
         console.error('Error deleting book', e);
    }
}
