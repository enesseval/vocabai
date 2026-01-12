// src/screens/ReadStoryScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';

// Task 1.2: Orchestrator
import { getStoryForUser } from '../utils/storyOrchestrator';
import { Story, WordAnalysis } from '../types/story';

// Task Group 5: Vocabulary Context (YENİ)
import { useVocabulary } from '../context/VocabularyContext';

const { height } = Dimensions.get('window');

export default function ReadStoryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { userProfile } = useOnboarding();

    // Kelime Kasası Bağlantısı
    const { saveWord, removeWord, isWordSaved } = useVocabulary();

    const [story, setStory] = useState<Story | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [loadingText, setLoadingText] = useState("Profilin analiz ediliyor...");

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedWordData, setSelectedWordData] = useState<WordAnalysis | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    // Animasyon Değeri
    const slideAnim = useRef(new Animated.Value(height)).current;

    // Seçili kelime kayıtlı mı?
    const isSaved = selectedWordData ? isWordSaved(selectedWordData.word) : false;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        const generateStorySequence = async () => {
            if (!userProfile) return;

            setLoadingText("İlgi alanların analiz ediliyor...");
            await delay(1000);
            setLoadingText("İçerik planlaması ve kelime seçimi yapılıyor...");
            await delay(1000);
            setLoadingText("Yapay zeka hikayeni yazıyor...");

            try {
                const bestStory = await getStoryForUser(userProfile, 'ONBOARDING_END');
                setStory(bestStory);
            } catch (error) {
                console.error("Story load failed", error);
            }

            await delay(800);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsGenerating(false);
        };

        generateStorySequence();
        return () => { Speech.stop(); };
    }, [userProfile]);

    const toggleSpeech = () => {
        Haptics.selectionAsync();
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            if (!story) return;
            setIsSpeaking(true);
            Speech.speak(story.content, {
                language: story.language === 'en' ? 'en-US' : story.language,
                pitch: 1.0,
                rate: 0.85,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
            });
        }
    };

    const handleWordPress = (word: string) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();

        const analysis = story?.vocabulary?.find(v =>
            v.word.toLowerCase() === cleanWord ||
            v.lemma.toLowerCase() === cleanWord
        );

        if (analysis) {
            Haptics.selectionAsync();
            setSelectedWordData(analysis);
            setModalVisible(true);

            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true
            }).start();
        }
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 250,
            useNativeDriver: true
        }).start(() => {
            setModalVisible(false);
            setSelectedWordData(null);
        });
    };

    // 🔥 GÜNCELLENEN FONKSİYON: Gerçek Kayıt İşlemi
    const handleSaveWord = async () => {
        if (!selectedWordData) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (isSaved) {
            await removeWord(selectedWordData.word);
        } else {
            await saveWord(selectedWordData);
        }
        // Modalı kapatmıyoruz ki kullanıcı değişikliği görsün
    };

    const handleComplete = () => {
        Speech.stop();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const InteractiveContent = ({ content }: { content: string }) => {
        const paragraphs = content.split('\n\n');
        return (
            <View>
                {paragraphs.map((para, pIndex) => (
                    <Text key={pIndex} style={styles.paragraph}>
                        {para.split(' ').map((word, wIndex) => {
                            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();
                            const isImportant = story?.vocabulary?.some(v =>
                                v.word.toLowerCase() === cleanWord ||
                                v.lemma.toLowerCase() === cleanWord
                            );
                            return (
                                <Text
                                    key={`${pIndex}-${wIndex}`}
                                    onPress={() => handleWordPress(word)}
                                    style={[
                                        styles.interactiveWord,
                                        isImportant && styles.importantWord
                                    ]}
                                >
                                    {word}{' '}
                                </Text>
                            );
                        })}
                    </Text>
                ))}
            </View>
        );
    };

    if (isGenerating || !story) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
                    <Text style={styles.loadingText}>{loadingText}</Text>
                    <Text style={styles.loadingSubText}>Sana özel bir dil deneyimi hazırlanıyor.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLabelContainer}>
                        <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                        <Text style={styles.headerLabel}>AI STORY</Text>
                    </View>
                    <TouchableOpacity onPress={toggleSpeech} style={styles.audioButton}>
                        <Ionicons name={isSpeaking ? "pause" : "volume-high"} size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* CONTENT */}
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{story.title}</Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{story.language.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.tag, styles.levelTag]}>
                            <Text style={[styles.tagText, { color: COLORS.secondary }]}>{story.level}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <InteractiveContent content={story.content} />
                </ScrollView>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.completeButton} activeOpacity={0.8} onPress={handleComplete}>
                        <Text style={styles.buttonText}>OKUMAYI TAMAMLA</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* MODAL */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
                        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalWord}>{selectedWordData?.word}</Text>
                                <TouchableOpacity onPress={() => Speech.speak(selectedWordData?.word || "", { language: story.language })}>
                                    <Ionicons name="volume-medium" size={28} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.translationBox}>
                                <Text style={styles.translationLabel}>ANLAM</Text>
                                <Text style={styles.translationText}>{selectedWordData?.translation}</Text>
                                <Text style={[styles.translationLabel, { marginTop: 12 }]}>BAĞLAM</Text>
                                <Text style={styles.explanationText}>{selectedWordData?.explanation}</Text>
                                <View style={styles.exampleBox}>
                                    <Text style={styles.exampleText}>"{selectedWordData?.example}"</Text>
                                </View>
                            </View>

                            {/* 🔥 GÜNCELLENEN BUTON: Kayıt Durumuna Göre Değişiyor */}
                            <TouchableOpacity
                                style={[styles.saveWordButton, isSaved && styles.savedButton]}
                                onPress={handleSaveWord}
                            >
                                <Text style={[styles.saveWordText, isSaved && { color: COLORS.secondary }]}>
                                    {isSaved ? "Sözlükten Çıkar" : "Sözlüğüme Ekle"}
                                </Text>
                                <Ionicons
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={20}
                                    color={isSaved ? COLORS.secondary : "#fff"}
                                />
                            </TouchableOpacity>

                        </Animated.View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    headerLabel: { color: COLORS.primary, fontSize: 12, fontFamily: FONTS.semiBold, letterSpacing: 1 },
    audioButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: 24, paddingBottom: 150 },
    title: { fontSize: 32, color: COLORS.text, fontFamily: FONTS.titleItalic, lineHeight: 40, marginBottom: 15 },
    tagsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    levelTag: { borderColor: COLORS.secondary, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
    tagText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: FONTS.regular },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginBottom: 25 },
    paragraph: { marginBottom: 24, lineHeight: 34 },
    interactiveWord: { fontSize: 18, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.regular },
    importantWord: { color: COLORS.primary, fontFamily: FONTS.semiBold, textDecorationLine: 'underline', textDecorationColor: 'rgba(251, 191, 36, 0.4)' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 30, backgroundColor: 'rgba(5, 4, 6, 0.95)' },
    completeButton: { height: 64, backgroundColor: COLORS.primary, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 15 },
    buttonText: { color: '#000', fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    loadingText: { color: COLORS.text, fontSize: 18, fontFamily: FONTS.semiBold, textAlign: 'center', marginBottom: 10 },
    loadingSubText: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1e1b2e', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, minHeight: 340, shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalWord: { fontSize: 32, color: COLORS.text, fontFamily: FONTS.titleItalic, textTransform: 'capitalize' },
    translationBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    translationLabel: { color: COLORS.inputLabel, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: FONTS.bold },
    translationText: { color: COLORS.primary, fontSize: 22, fontFamily: FONTS.semiBold, marginBottom: 16 },
    explanationText: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.regular, lineHeight: 24 },
    exampleBox: { marginTop: 16, borderLeftWidth: 3, borderLeftColor: COLORS.secondary, paddingLeft: 12 },
    exampleText: { color: COLORS.textSecondary, fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

    // Buton Stilleri
    saveWordButton: { backgroundColor: COLORS.secondary, height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    savedButton: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderWidth: 1, borderColor: COLORS.secondary }, // Kayıtlıysa içi boş
    saveWordText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 0.5 },
});