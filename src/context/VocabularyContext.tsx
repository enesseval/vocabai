import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordAnalysis } from '../types/story';

interface SavedWord extends WordAnalysis {
    savedAt: string; // Ne zaman kaydedildi?
    masteryLevel: number; // 0-5 arası (SRS için hazırlık)
}

interface VocabularyContextType {
    savedWords: SavedWord[];
    saveWord: (wordData: WordAnalysis) => Promise<void>;
    removeWord: (word: string) => Promise<void>;
    isWordSaved: (word: string) => boolean;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedWords, setSavedWords] = useState<SavedWord[]>([]);

    useEffect(() => {
        loadVocabulary();
    }, []);

    const loadVocabulary = async () => {
        try {
            const json = await AsyncStorage.getItem('user_vocabulary');
            if (json) setSavedWords(JSON.parse(json));
        } catch (e) {
            console.error("Kelime yükleme hatası", e);
        }
    };

    const saveWord = async (wordData: WordAnalysis) => {
        // Zaten kayıtlı mı kontrol et
        if (savedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) return;

        const newWord: SavedWord = {
            ...wordData,
            savedAt: new Date().toISOString(),
            masteryLevel: 0 // Yeni kelime, seviye 0
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
        <VocabularyContext.Provider value={{ savedWords, saveWord, removeWord, isWordSaved }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    const context = useContext(VocabularyContext);
    if (!context) throw new Error("useVocabulary must be used within a VocabularyProvider");
    return context;
};