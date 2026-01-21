import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { WordAnalysis } from '../types/story';
import { syncToWidget } from '../services/widgetDataSync';

interface SavedWord extends WordAnalysis {
    savedAt: string;
    masteryLevel: number;
}

interface VocabularyContextType {
    savedWords: SavedWord[];
    saveWord: (wordData: WordAnalysis, onLimitReached?: () => void) => Promise<boolean>;
    removeWord: (word: string) => Promise<void>;
    isWordSaved: (word: string) => boolean;
    canSaveMoreWords: (isPremium: boolean, savedWordsCount: number) => boolean;
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
            console.error('Failed to load vocabulary:', e);
        }
    };

    const canSaveMoreWords = (isPremium: boolean, savedWordsCount: number): boolean => {
        if (isPremium) return true;
        return savedWordsCount < 50; // FREE_TIER_LIMITS.savedWords
    };

    const saveWord = async (
        wordData: WordAnalysis,
        onLimitReached?: () => void
    ): Promise<boolean> => {
        if (savedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) {
            return false;
        }

        const newWord: SavedWord = {
            ...wordData,
            savedAt: new Date().toISOString(),
            masteryLevel: 0,
        };

        const updatedList = [newWord, ...savedWords];
        setSavedWords(updatedList);
        await AsyncStorage.setItem('user_vocabulary', JSON.stringify(updatedList));

        // Sync to widget
        await syncToWidget({
            words: updatedList,
            lastUpdate: new Date().toISOString(),
        });

        return true;
    };

    const removeWord = async (wordText: string) => {
        const updatedList = savedWords.filter(w => w.word.toLowerCase() !== wordText.toLowerCase());
        setSavedWords(updatedList);
        await AsyncStorage.setItem('user_vocabulary', JSON.stringify(updatedList));

        // Sync to widget
        await syncToWidget({
            words: updatedList,
            lastUpdate: new Date().toISOString(),
        });
    };

    const isWordSaved = (wordText: string) => {
        return savedWords.some(w => w.word.toLowerCase() === wordText.toLowerCase());
    };

    return (
        <VocabularyContext.Provider value={{ savedWords, saveWord, removeWord, isWordSaved, canSaveMoreWords }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    const context = useContext(VocabularyContext);
    if (!context) throw new Error("useVocabulary must be used within a VocabularyProvider");
    return context;
};