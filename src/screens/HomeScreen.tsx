// src/screens/HomeScreen.tsx - Quiz + Recent Stories Design

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { useOnboarding } from '../context/OnboardingContext';
import { useVocabulary } from '../context/VocabularyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { FONTS } from '../constants/theme';
import { Story } from '../types/story';
import { useHeader } from '../navigation/TabNavigator';
import { WordCard } from '../components/WordCard';

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { userProfile } = useOnboarding();
    const { savedWords } = useVocabulary();
    const { setHeaderLeft } = useHeader();

    const [greeting, setGreeting] = useState('');
    const [recentStories, setRecentStories] = useState<Story[]>([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t('home.greeting.morning'));
        else if (hour < 18) setGreeting(t('home.greeting.afternoon'));
        else setGreeting(t('home.greeting.evening'));
    }, [t]);

    // Update header whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setHeaderLeft(
                <Text style={styles.headerGreeting}>
                    {greeting}, {userProfile.name || 'Friend'} 👋
                </Text>
            );
        }, [greeting, userProfile.name, setHeaderLeft])
    );

    useEffect(() => {
        loadRecentStories();
    }, []);

    const loadRecentStories = async () => {
        try {
            const historyJson = await AsyncStorage.getItem('story_history');
            if (historyJson) {
                const history: Story[] = JSON.parse(historyJson);
                setRecentStories(history.slice(0, 5)); // Son 5 hikaye
            }
        } catch (error) {
            console.error('Error loading recent stories:', error);
        }
    };

    const handleQuizPress = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('VocabQuiz' as any);
    };

    const handleStoryPress = (story: Story) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('StoryModal', { story });
    };

    const handleSeeAllStories = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('StoriesTab' as any);
    };

    const canTakeQuiz = savedWords.length >= 5;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
                showsVerticalScrollIndicator={false}
            >

                {/* Recent Stories Section - Compact */}
                <View style={styles.storiesSection}>
                    <Text style={styles.sectionTitle}>{t('home.recentStories.title')}</Text>

                    {recentStories.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.storiesScroll}
                        >
                            {recentStories.map((story, index) => (
                                <TouchableOpacity
                                    key={story.id || index}
                                    onPress={() => handleStoryPress(story)}
                                    activeOpacity={0.9}
                                    style={styles.storyCard}
                                >
                                    <BlurView intensity={15} tint="dark" style={styles.storyCardBlur}>
                                        <Text style={styles.storyTitle} numberOfLines={3}>
                                            {story.title}
                                        </Text>
                                        {story.metadata?.category && (
                                            <Text style={styles.storyCategory}>
                                                {t(`home.story.category.${story.metadata.category}`)}
                                            </Text>
                                        )}
                                    </BlurView>
                                </TouchableOpacity>
                            ))}

                            {/* See All Button */}
                            <TouchableOpacity
                                onPress={handleSeeAllStories}
                                activeOpacity={0.9}
                                style={styles.seeAllCard}
                            >
                                <BlurView intensity={15} tint="dark" style={styles.seeAllBlur}>
                                    <Ionicons name="library" size={24} color="#fbbf24" />
                                    <Text style={styles.seeAllText}>
                                        {t('home.recentStories.seeAll')}
                                    </Text>
                                </BlurView>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <BlurView intensity={15} tint="dark" style={styles.emptyStories}>
                            <Ionicons name="book-outline" size={32} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyTitle}>{t('home.recentStories.emptyTitle')}</Text>
                        </BlurView>
                    )}
                </View>

                {/* Quiz Button - Compact */}
                <TouchableOpacity
                    onPress={handleQuizPress}
                    activeOpacity={0.9}
                    disabled={!canTakeQuiz}
                    style={styles.quizButton}
                >
                    <BlurView intensity={20} tint="dark" style={[styles.quizButtonBlur, !canTakeQuiz && styles.quizButtonDisabled]}>
                        <Ionicons
                            name={canTakeQuiz ? "school" : "lock-closed"}
                            size={24}
                            color={canTakeQuiz ? "#fbbf24" : "rgba(255,255,255,0.4)"}
                        />
                        <Text style={[styles.quizButtonTitle, !canTakeQuiz && styles.textDisabled]}>
                            {t(canTakeQuiz ? 'home.quiz.title' : 'home.quiz.titleLocked')}
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={canTakeQuiz ? "#fbbf24" : "rgba(255,255,255,0.3)"}
                        />
                    </BlurView>
                </TouchableOpacity>

                {/* Recent Words Section - Modern Cards */}
                <View style={styles.wordsSection}>
                    <View style={styles.wordsSectionHeader}>
                        <Text style={styles.sectionTitle}>Kelimelerim</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('WordsTab' as any)}>
                            <View style={styles.seeAllButton}>
                                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                                <Ionicons name="chevron-forward" size={16} color="#fbbf24" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {savedWords.length > 0 ? (
                        <View style={styles.wordsGrid}>
                            {savedWords.slice(0, 5).map((word, index) => (
                                <WordCard key={index} word={word} />
                            ))}
                        </View>
                    ) : (
                        <BlurView intensity={15} tint="dark" style={styles.emptyWords}>
                            <Ionicons name="book-outline" size={32} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyTitle}>Henüz kelime eklemedin</Text>
                            <Text style={styles.emptySubtitle}>Hikayelerde kelimelere dokun ve kaydet</Text>
                        </BlurView>
                    )}
                </View>

                {/* Word Count Info */}
                {savedWords.length < 5 && (
                    <BlurView intensity={15} tint="dark" style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color="#fbbf24" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>{t('home.unlockQuiz.title')}</Text>
                            <Text style={styles.infoText}>
                                {t('home.unlockQuiz.description', { count: savedWords.length })}
                            </Text>
                        </View>
                    </BlurView>
                )}

                {/* Bottom spacing */}
                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    headerGreeting: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    storiesSection: {
        marginBottom: 32,
    },
    storiesScroll: {
        paddingRight: 24,
        gap: 12,
    },
    storyCard: {
        width: 140,
        height: 100,
    },
    storyCardBlur: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    storyTitle: {
        color: '#fff',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
        lineHeight: 18,
    },
    storyCategory: {
        color: '#fbbf24',
        fontSize: 11,
        fontFamily: FONTS.regular,
        marginTop: 4,
    },
    seeAllCard: {
        width: 100,
        height: 100,
    },
    seeAllBlur: {
        flex: 1,
        backgroundColor: 'rgba(251, 189, 35, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(251, 189, 35, 0.3)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        overflow: 'hidden',
    },
    // seeAllText: {
    //     color: '#fbbf24',
    //     fontSize: 12,
    //     fontFamily: FONTS.bold,
    //     textAlign: 'center',
    // },
    emptyStories: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    emptyTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginTop: 12,
        textAlign: 'center',
    },
    wordsSection: {
        marginBottom: 32,
    },
    wordsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(251, 189, 35, 0.1)',
        borderRadius: 12,
    },
    seeAllText: {
        color: '#fbbf24',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    wordsGrid: {
        gap: 12,
    },
    wordCardModern: {
        width: '100%',
    },
    wordCardBlur: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
    },
    wordCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    wordTextModern: {
        color: '#fff',
        fontSize: 17,
        fontFamily: FONTS.bold,
        flex: 1,
        marginRight: 8,
    },
    wordTypeBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    wordTypeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
    },
    wordTranslationModern: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginBottom: 12,
    },
    wordCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    emptyWords: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 32,
        alignItems: 'center',
        overflow: 'hidden',
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginTop: 8,
        textAlign: 'center',
    },
    quizButton: {
        marginBottom: 32,
    },
    quizButtonBlur: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(251, 189, 35, 0.3)',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        gap: 12,
        overflow: 'hidden',
    },
    quizButtonDisabled: {
        borderColor: 'rgba(255,255,255,0.1)',
        opacity: 0.6,
    },
    quizButtonTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
        flex: 1,
    },
    textDisabled: {
        color: 'rgba(255,255,255,0.4)',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: 'rgba(251, 189, 35, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(251, 189, 35, 0.3)',
        padding: 20,
        flexDirection: 'row',
        gap: 16,
        overflow: 'hidden',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        color: '#fbbf24',
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    infoText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
});
