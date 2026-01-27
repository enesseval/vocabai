// src/screens/WordDetailScreen.tsx

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    Animated,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { RootStackParamList } from '../types/navigation';
import { FONTS } from '../constants/theme';
import { useVocabulary } from '../context/VocabularyContext';

const { height } = Dimensions.get('window');

type WordDetailRouteProp = RouteProp<RootStackParamList, 'WordDetail'>;

export default function WordDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<WordDetailRouteProp>();
    const { word: wordParam } = route.params || {};

    const { savedWords } = useVocabulary();
    const word = savedWords.find(w => w.word === wordParam);

    const translateY = useRef(new Animated.Value(0)).current;

    // Sadece drag handle için pan responder
    const handlePanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.velocityY > 500) {
                    Animated.timing(translateY, {
                        toValue: height,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => navigation.goBack());
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start();
                }
            },
        })
    ).current;

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
    };

    const handleSpeak = () => {
        if (!word) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Speech.speak(word.word, {
            language: 'en',
            rate: 0.9,
        });
    };

    if (!word) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
                <Animated.View style={styles.errorContainer}>
                    <LinearGradient
                        colors={['#1F2937', '#111827']}
                        style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name="alert-circle-outline" size={48} color="#6B7280" style={{ marginBottom: 16 }} />
                    <Text style={styles.errorText}>Kelime bulunamadı</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Kapat</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    const typeTranslations: Record<string, { tr: string; color: string }> = {
        'Noun': { tr: 'İsim', color: '#3B82F6' },
        'Verb': { tr: 'Fiil', color: '#10B981' },
        'Adjective': { tr: 'Sıfat', color: '#F59E0B' },
        'Adverb': { tr: 'Zarf', color: '#8B5CF6' },
        'Phrase': { tr: 'İfade', color: '#EC4899' },
        'Preposition': { tr: 'Edat', color: '#6366F1' },
        'Conjunction': { tr: 'Bağlaç', color: '#14B8A6' },
        'Pronoun': { tr: 'Zamir', color: '#F97316' },
        'Interjection': { tr: 'Ünlem', color: '#EF4444' },
    };

    const typeInfo = typeTranslations[word.type] || { tr: word.type, color: '#6B7280' };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[styles.sheetContainer, { transform: [{ translateY }] }]}
            >
                <LinearGradient
                    colors={['#1e1b4b', '#111827', '#000000']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Drag Handle - Sadece buradan sürüklenebilir */}
                <View style={styles.header} {...handlePanResponder.panHandlers}>
                    <View style={styles.dragHandle} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    bounces={true}
                    scrollEnabled={true}
                >
                    {/* Word Header */}
                    <View style={styles.wordHeader}>
                        <Text style={styles.wordText}>{word.word}</Text>
                        <View style={styles.translationContainer}>
                            <Ionicons name="language" size={18} color="#FCD34D" style={{ marginRight: 8 }} />
                            <Text style={styles.translationText}>{word.translation}</Text>
                        </View>
                    </View>

                    {/* Audio & Meta */}
                    <View style={styles.metaSection}>
                        {/* Audio Button */}
                        <TouchableOpacity onPress={handleSpeak} style={styles.audioButton}>
                            <LinearGradient
                                colors={['#FCD34D', '#F59E0B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.audioIconContainer}
                            >
                                <Ionicons name="volume-high" size={20} color="#000" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.audioLabel}>TELAFFUZ</Text>
                                <Text style={styles.phoneticText}>
                                    {word.phonetic || '/.../'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Meta Chips */}
                        <View style={styles.chipsRow}>
                            <View style={[styles.chip, { backgroundColor: `${typeInfo.color}15`, borderColor: `${typeInfo.color}30` }]}>
                                <View style={[styles.typeDot, { backgroundColor: typeInfo.color }]} />
                                <Text style={[styles.chipText, { color: typeInfo.color }]}>
                                    {typeInfo.tr}
                                </Text>
                            </View>
                            {word.level && (
                                <View style={styles.levelChip}>
                                    <Ionicons name="bar-chart" size={12} color="#A78BFA" />
                                    <Text style={styles.levelChipText}>{word.level}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Explanation Card */}
                    {word.explanation && (
                        <View style={styles.explanationCard}>
                            <View style={styles.explanationHeader}>
                                <Ionicons name="bulb" size={16} color="#FCD34D" />
                                <Text style={styles.explanationTitle}>Açıklama</Text>
                            </View>
                            <Text style={styles.explanationText}>{word.explanation}</Text>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Example Sentences */}
                    {word.exampleSentences && word.exampleSentences.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="chatbox-ellipses" size={16} color="#6B7280" />
                                <Text style={styles.sectionTitle}>BAĞLAMSAL KULLANIM</Text>
                            </View>

                            <View style={styles.examplesContainer}>
                                {word.exampleSentences.map((item, index) => (
                                    <View key={index} style={styles.exampleCard}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
                                            style={styles.exampleGradient}
                                        />
                                        <View style={styles.exampleHeader}>
                                            <LinearGradient
                                                colors={['#FCD34D', '#F59E0B']}
                                                style={styles.exampleNumber}
                                            >
                                                <Text style={styles.exampleNumberText}>{index + 1}</Text>
                                            </LinearGradient>
                                            <View style={styles.exampleContent}>
                                                <Text style={styles.exampleOriginal}>
                                                    {item.original.split(new RegExp(`(${word.word})`, 'gi')).map((part, i) => (
                                                        <Text
                                                            key={i}
                                                            style={
                                                                part.toLowerCase() === word.word.toLowerCase()
                                                                    ? styles.highlightedWord
                                                                    : {}
                                                            }
                                                        >
                                                            {part}
                                                        </Text>
                                                    ))}
                                                </Text>
                                                <View style={styles.translationDivider} />
                                                <Text style={styles.exampleTranslated}>
                                                    {item.translated}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    errorContainer: {
        height: height / 3,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'hidden',
    },
    errorText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontFamily: FONTS.regular,
        marginBottom: 16,
    },
    closeButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FCD34D',
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    sheetContainer: {
        height: height * 0.92,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    dragHandle: {
        width: 48,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    wordHeader: {
        alignItems: 'center',
        marginBottom: 28,
        paddingTop: 8,
    },
    wordText: {
        fontSize: 48,
        fontFamily: FONTS.bold,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -1,
    },
    translationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(252, 211, 77, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.2)',
    },
    translationText: {
        fontSize: 20,
        fontFamily: FONTS.semiBold,
        color: '#FCD34D',
    },
    metaSection: {
        gap: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    audioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 20,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    audioIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#FCD34D',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
        }),
    },
    audioLabel: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    phoneticText: {
        fontSize: 14,
        color: '#D1D5DB',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    chipText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    levelChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.2)',
    },
    levelChipText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#A78BFA',
    },
    explanationCard: {
        padding: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(252, 211, 77, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.15)',
        marginBottom: 24,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    explanationTitle: {
        fontSize: 13,
        fontFamily: FONTS.bold,
        color: '#FCD34D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    explanationText: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: FONTS.bold,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    examplesContainer: {
        gap: 14,
    },
    exampleCard: {
        position: 'relative',
        padding: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(31, 41, 55, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    exampleGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    exampleHeader: {
        flexDirection: 'row',
        gap: 14,
    },
    exampleNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#FCD34D',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
        }),
    },
    exampleNumberText: {
        fontSize: 13,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    exampleContent: {
        flex: 1,
        gap: 8,
    },
    exampleOriginal: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#F3F4F6',
        lineHeight: 24,
    },
    highlightedWord: {
        color: '#FCD34D',
        fontFamily: FONTS.bold,
        backgroundColor: 'rgba(252, 211, 77, 0.15)',
        borderRadius: 4,
        paddingHorizontal: 2,
    },
    translationDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginVertical: 4,
    },
    exampleTranslated: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
});
