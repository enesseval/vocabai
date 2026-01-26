import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordAnalysis } from '../types/story';
import { getDefaultWordsForInterests } from '../constants/defaultVocabulary';

interface SavedWord extends WordAnalysis {
   
    savedAt: string; // Ne zaman kaydedildi?
    masteryLevel: number; // 0-5 arası (SRS için hazırlık)
}

interface VocabularyContextType {
    savedWords: SavedWord[];
    saveWord: (wordData: WordAnalysis) => Promise<void>;
    removeWord: (word: string) => Promise<void>;
    isWordSaved: (word: string) => boolean;
    initializeDefaultWords: (interests: number[], purpose?: string, level?: string) => Promise<void>;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        loadVocabulary();
    }, []);

    const loadVocabulary = async () => {
        try {
            const json = await AsyncStorage.getItem('user_vocabulary');
            if (json) {
                setSavedWords(JSON.parse(json));
            }
            setIsInitialized(true);
        } catch (e) {
            console.error("Kelime yükleme hatası", e);
            setIsInitialized(true);
        }
    };

    const initializeDefaultWords = async (interests: number[], purpose?: string, level?: string) => {
        try {
            // Only initialize if no words exist yet
            if (savedWords.length > 0) {
                console.log('User already has saved words, skipping default initialization');
                return;
            }

            // Get default words based on user profile (interests, purpose, level)
            const defaultWords = getDefaultWordsForInterests(interests, purpose, level);

            // Convert to SavedWord format
            const initialWords: SavedWord[] = defaultWords.map(word => ({
                ...word,
                savedAt: new Date().toISOString(),
                masteryLevel: 0
            }));

            setSavedWords(initialWords);
            await AsyncStorage.setItem('user_vocabulary', JSON.stringify(initialWords));
            console.log(`✅ Initialized ${initialWords.length} default words (interests: ${interests}, purpose: ${purpose}, level: ${level})`);
        } catch (e) {
            console.error("Default word initialization error", e);
        }
    };

    const saveWord = async (wordData: WordAnalysis) => {
        // Zaten kayıtlı mı kontrol et
        if (savedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) return;

        const newWord: SavedWord = {
            ...wordData,
            savedAt: new Date().toISOString(),
            masteryLevel: 0 // Yeni kelime, seviye 0,
        };

        const updatedList = [newWord, ...savedWords];
        setSavedWords(updatedList);
        await AsyncStorage.setItem('user_vocabulary', JSON.stringify(updatedList));
    };

    const removeWord = async (wordText: string) => {
        const updatedList = savedWords.filter(w => w.word.toLowerCase() !== wordText.toLowerCase());
        setSavedWords(updatedList);
        await AsyncStorage.setItem('user_vocabulary', JSON.stringify(updatedList));
    };

    const isWordSaved = (wordText: string) => {
        return savedWords.some(w => w.word.toLowerCase() === wordText.toLowerCase());
    };

    return (
        <VocabularyContext.Provider value={{ savedWords, saveWord, removeWord, isWordSaved, initializeDefaultWords }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    const context = useContext(VocabularyContext);
    if (!context) throw new Error("useVocabulary must be used within a VocabularyProvider");
    return context;
};