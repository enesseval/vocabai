// src/hooks/useWordInteraction.ts
import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Story, WordAnalysis } from '../types/story';
import { useVocabulary } from '../context/VocabularyContext';
import { usePurchase } from '../context/PurchaseContext';

export const useWordInteraction = (story: Story | null) => {
    const { saveWord, removeWord, isWordSaved, savedWords } = useVocabulary();
    const { canSaveWord, subscription, incrementSavedWords } = usePurchase();
    const [selectedWordData, setSelectedWordData] = useState<WordAnalysis | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    const handleWordClick = useCallback((clickedText: string, lang: 'target' | 'native') => {
        if (!story?.vocabulary) return;

        // Regex ile temizlik
        const cleanText = clickedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();

        // Kelimeyi bul
        const foundAnalysis = story.vocabulary.find(v =>
            lang === 'target'
                ? (v.word.toLowerCase() === cleanText || v.lemma.toLowerCase() === cleanText)
                : (v.translation.toLowerCase().includes(cleanText))
        );

        if (foundAnalysis) {
            Haptics.selectionAsync();
            setSelectedWordData(foundAnalysis);
            setModalVisible(true);
        }
    }, [story]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setSelectedWordData(null);
    }, []);

    const toggleSaveWord = useCallback(async () => {
        if (!selectedWordData) return;

        if (isWordSaved(selectedWordData.word)) {
            // Removing a word - always allowed
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await removeWord(selectedWordData.word);
        } else {
            // Saving a new word - check limits
            if (!canSaveWord()) {
                // Show premium gate
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setShowPremiumGate(true);
                return;
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const success = await saveWord(selectedWordData);

            if (success && subscription.tier === 'free') {
                // Track usage for free tier
                await incrementSavedWords();
            }
        }
    }, [selectedWordData, isWordSaved, removeWord, saveWord, canSaveWord, subscription.tier, incrementSavedWords]);

    const closePremiumGate = useCallback(() => {
        setShowPremiumGate(false);
    }, []);

    return {
        selectedWordData,
        isModalVisible,
        handleWordClick,
        closeModal,
        toggleSaveWord,
        isSaved: selectedWordData ? isWordSaved(selectedWordData.word) : false,
        showPremiumGate,
        closePremiumGate,
    };
};