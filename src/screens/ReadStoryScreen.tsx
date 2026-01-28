// src/screens/ReadStoryScreen.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
    Modal, Animated, Dimensions, PanResponder, TouchableWithoutFeedback,
    NativeSyntheticEvent, NativeScrollEvent, StatusBar as RNStatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as NavigationBar from 'expo-navigation-bar';
import { BlurView } from 'expo-blur';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useVocabulary } from '../context/VocabularyContext';
import { Story } from '../types/story';

import { useStoryAudio } from '../hooks/useStoryAudio';
import { useWordInteraction } from '../hooks/useWordInteraction';
import { generateStoryFast } from '../services/aiService';

const { width, height } = Dimensions.get('window');

// --- TASARIM TEMASI ---
const THEME = {
    bgGradient: ['#020617', '#0f172a', '#000000'] as const,
    textMain: '#F8FAFC',
    textMuted: 'rgba(148, 163, 184, 0.6)',
    accent: '#F59E0B', // Amber
    glassBg: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.9)',
};

// --- MOCK DATA ---
const MOCK_STORY: Story = {
    id: "mock-long-1",
    title: "The Echo of the Stars",
    titleNative: "Yıldızların Yankısı",
    language: "en",
    level: "B2",
    topicIds: [1, 6],
    content: "The universe is an endless ocean of darkness...",
    segments: [
        {
            target: "The universe is an endless ocean of darkness, punctuated by islands of light that we call stars. To travel through this vast expanse is to understand the true meaning of silence. It is not merely the absence of sound, but a heavy, pressing weight that reminds you of your own insignificance.",
            native: "Evren, yıldız dediğimiz ışık adalarıyla bezenmiş sonsuz bir karanlık okyanusudur. Bu uçsuz bucaksız genişlikte seyahat etmek, sessizliğin gerçek anlamını kavramaktır. Bu sadece sesin yokluğu değil, size kendi önemsizliğinizi hatırlatan ağır, baskıcı bir ağırlıktır."
        },
        {
            target: "As our ship, the Voyager, drifts further away from Earth, the familiar constellations begin to distort and change. We are no longer observing history from a distance; we are becoming part of it.",
            native: "Gemimiz Voyager Dünya'dan uzaklaştıkça, tanıdık takımyıldızlar bozulmaya ve değişmeye başlıyor. Artık tarihi uzaktan izlemiyoruz; onun bir parçası oluyoruz."
        }
    ],
    vocabulary: [
        { word: "insignificance", translation: "önemsiz olma durumu", explanation: "The state of being unimportant or small", example: "The vast ocean made him feel his insignificance.", lemma: "insignificance" },
        { word: "distort", translation: "bozulmak, çarpılmak", explanation: "To change shape or appearance", example: "Heat can distort the image.", lemma: "distort" }
    ]
};

// --- COMPONENTS ---

const InteractiveWord = React.memo(({ word, isImportant, isSpeakingNow, onPress }: any) => (
    <Text onPress={onPress} style={[
        styles.wordBase,
        isImportant && styles.wordImportant,
        isSpeakingNow && styles.wordActive // Glow Effect Style
    ]}>
        {word}
    </Text>
));

const TypewriterText = ({ text, onComplete, style, skipAnimation }: any) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        if (skipAnimation) { setDisplayedText(text); onComplete(); return; }
        let currentLength = 0;
        const totalLength = text.length;
        const chunkSize = 4;
        const timer = setInterval(() => {
            currentLength += chunkSize;
            if (currentLength >= totalLength) {
                setDisplayedText(text); clearInterval(timer); onComplete();
            } else {
                setDisplayedText(text.slice(0, currentLength));
            }
        }, 10);
        return () => clearInterval(timer);
    }, [text, skipAnimation]);
    return <Text style={style}>{displayedText}</Text>;
};

const StoryLoadingScreen = () => {
    const { savedWords } = useVocabulary();

    // Get 5 random words to show (prioritize recent words)
    const displayWords = useMemo(() => {
        if (!savedWords || savedWords.length === 0) {
            return [{
                word: 'Journey',
                translation: 'Yolculuk',
                type: 'noun'
            }];
        }
        // Take last 10 words (most recent) and shuffle
        const recentWords = savedWords.slice(-10);
        const shuffled = [...recentWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    }, [savedWords]);

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const phaseFadeAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Ball animations
    const ball1 = useRef(new Animated.Value(0)).current;
    const ball2 = useRef(new Animated.Value(0)).current;
    const ball3 = useRef(new Animated.Value(0)).current;

    const [currentPhase, setCurrentPhase] = useState(0);
    const phases = ['Hikayeni oluşturuyoruz', 'İçeriği kişiselleştiriyoruz', 'Anlamı kurguluyor, sadece cümleleri değil'];

    useEffect(() => {
        // Glow pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Ball bounce animations (staggered)
        const createBounce = (ball: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(ball, {
                        toValue: -10,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(ball, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        createBounce(ball1, 0);
        createBounce(ball2, 200);
        createBounce(ball3, 400);

        // Word rotation interval
        const wordInterval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                // Change word
                setCurrentWordIndex(prev => (prev + 1) % displayWords.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            });
        }, 3000);

        // Phase text rotation with animation
        const phaseInterval = setInterval(() => {
            // Fade out
            Animated.timing(phaseFadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change phase
                setCurrentPhase(prev => (prev + 1) % phases.length);
                // Fade in
                Animated.timing(phaseFadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 4000);

        return () => {
            clearInterval(wordInterval);
            clearInterval(phaseInterval);
        };
    }, [displayWords]);

    const currentWord = displayWords[currentWordIndex];

    return (
        <View style={styles.loadingContainer}>
            <LinearGradient
                colors={['#020617', '#0f172a', '#020617']}
                style={StyleSheet.absoluteFill}
            />

            {/* Top header */}
            <View style={styles.loadingHeader}>
                <View style={styles.loadingLogoContainer}>
                    <View style={styles.loadingLogoIcon}>
                        <Ionicons name="book" size={20} color="#fbbf24" />
                    </View>
                    <Text style={styles.loadingLogoText}>VOCABAI</Text>
                </View>
            </View>

            {/* Mastery tip */}
            <View style={styles.masteryTipContainer}>
                <BlurView intensity={20} tint="dark" style={styles.masteryTipBlur}>
                    <Text style={styles.masteryTipLabel}>MASTERY TIP</Text>
                    <Text style={styles.masteryTipText}>
                        Fluent speakers use context to bridge gaps in vocabulary.
                    </Text>
                </BlurView>
            </View>

            {/* Central word display */}
            <View style={styles.loadingCenterContent}>
                {/* Background ambient glow */}
                <Animated.View
                    style={[
                        styles.wordGlowBackground,
                        { opacity: glowAnim }
                    ]}
                />

                {/* Main word card */}
                <Animated.View style={[styles.wordCard, { opacity: fadeAnim }]}>
                    <Text style={styles.wordForeign}>{currentWord.word}</Text>
                    <View style={styles.wordDivider} />
                    <Text style={styles.wordTranslation}>{currentWord.translation}</Text>
                </Animated.View>
            </View>

            {/* Status and progress */}
            <View style={styles.loadingFooter}>
                <Animated.Text style={[styles.loadingStatus, { opacity: phaseFadeAnim }]}>
                    {phases[currentPhase]}
                </Animated.Text>
                <Text style={styles.loadingSubtext}>SYNTHESIZING CONTEXT</Text>

                {/* Bouncing balls indicator */}
                <View style={styles.bouncingBalls}>
                    <Animated.View style={[styles.ball, { transform: [{ translateY: ball1 }] }]} />
                    <Animated.View style={[styles.ball, { transform: [{ translateY: ball2 }] }]} />
                    <Animated.View style={[styles.ball, { transform: [{ translateY: ball3 }] }]} />
                </View>

                <Text style={styles.loadingTagline}>
                    Crafting meaning, not just sentences
                </Text>
            </View>
        </View>
    );
};

// --- MAIN SCREEN ---

export default function ReadStoryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ReadStory' | 'StoryModal'>>();
    const insets = useSafeAreaInsets();
    const { userProfile } = useOnboarding();
    const { incrementStoriesRead } = useSubscription();

    const isHistoryMode = route.name === 'StoryModal';
    const isFirstStory = (route.params as any)?.isFirstStory || false;
    const initialStory = (route.params as any)?.story;

    const [story, setStory] = useState<Story | null>(initialStory || null);
    const [isGenerating, setIsGenerating] = useState(!initialStory);
    const [isTypingComplete, setIsTypingComplete] = useState(!!initialStory);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const { isSpeaking, speechCursor, setSpeechCursor, togglePlayPause, handleSkip, stopAudio } = useStoryAudio(story, activePageIndex, userProfile);
    const { selectedWordData, isModalVisible, handleWordClick, closeModal, toggleSaveWord, isSaved } = useWordInteraction(story);

    const scrollX = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const panY = useRef(new Animated.Value(isHistoryMode ? height : 0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isHistoryMode,
            onMoveShouldSetPanResponder: (_, gestureState) => isHistoryMode && gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => { if (gestureState.dy > 0) panY.setValue(gestureState.dy); },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120) {
                    Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }).start(() => navigation.goBack());
                } else {
                    Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
                }
            },
        })
    ).current;

    const processedSegments = useMemo(() => {
        if (!story?.segments) return [];
        return story.segments.map((seg) => {
            const processText = (text: string, type: 'target' | 'native') => text.split(' ').map(rawWord => {
                const clean = rawWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();
                const isImportant = type === 'target'
                    ? story.vocabulary?.some(v => v.word.toLowerCase() === clean || v.lemma?.toLowerCase() === clean)
                    : story.vocabulary?.some(v => {
                        // For Turkish (native), check if the clean word matches any word in the translation
                        const translationWords = v.translation.toLowerCase().split(/[\s,\/]+/);
                        return translationWords.some(tw => tw === clean || clean.includes(tw) || tw.includes(clean));
                    });
                return { raw: rawWord, clean, isImportant: !!isImportant };
            });
            return { targetWords: processText(seg.target, 'target'), nativeWords: processText(seg.native, 'native') };
        });
    }, [story]);

    const calculateGlobalIndex = (segIndex: number, type: 'target' | 'native') => {
        let count = 0;
        if (!story?.segments) return 0;
        for (let i = 0; i < segIndex; i++) {
            count += (type === 'target' ? story.segments[i].target.length : story.segments[i].native.length) + 2;
        }
        return count;
    };

    const saveStoryToHistory = async (storyToSave: Story) => {
        try {
            const historyJson = await AsyncStorage.getItem('story_history');
            let history: Story[] = historyJson ? JSON.parse(historyJson) : [];

            // Check if story already exists
            const exists = history.some(s => s.id === storyToSave.id);
            if (!exists) {
                // Add metadata
                const storyWithMetadata: Story = {
                    ...storyToSave,
                    metadata: {
                        ...storyToSave.metadata,
                        readAt: new Date().toISOString(),
                        completed: false,
                    }
                };

                history.unshift(storyWithMetadata); // Add to beginning
                await AsyncStorage.setItem('story_history', JSON.stringify(history));
                console.log('✅ Story saved to history:', storyToSave.title);
            }
        } catch (error) {
            console.error('❌ Failed to save story to history:', error);
        }
    };

    useEffect(() => {
        RNStatusBar.setHidden(true, 'fade');
        if (Platform.OS === 'android') { NavigationBar.setVisibilityAsync("hidden"); NavigationBar.setBehaviorAsync('overlay-swipe'); }
        if (isHistoryMode) Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 12 }).start();

        const loadContent = async () => {
            if (initialStory) return;

            try {
                setIsGenerating(true);
                console.log('🎬 Starting fast story generation...');

                // Get last story from history to determine series_state
                const historyJson = await AsyncStorage.getItem('story_history');
                const history: Story[] = historyJson ? JSON.parse(historyJson) : [];
                const lastStory = history.length > 0 ? history[0] : null;

                console.log('📚 Last story:', lastStory?.title || 'None (First story)');
                console.log('📖 Series state:', lastStory ? 'continuation' : 'first');

                // Generate story with fast API - story comes immediately, quiz loads in background
                const { story: generatedStory, quizPromise } = await generateStoryFast(
                    userProfile,
                    'General',
                    [],
                    lastStory // Pass last story for series continuation
                );

                console.log('✅ Story received:', JSON.stringify(generatedStory, null, 2));
                console.log('📚 Quiz loading in background...');

                setStory(generatedStory);
                setIsGenerating(false); // Show story immediately

                // Save story to history
                await saveStoryToHistory(generatedStory);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Quiz loads in background and updates story when ready
                quizPromise.then((quizData) => {
                    console.log('✅ Quiz generated successfully (background)');
                    console.log('📝 Quiz data:', JSON.stringify(quizData, null, 2));

                    // Update story with quiz data
                    setStory(prevStory => {
                        if (!prevStory) return prevStory;
                        return {
                            ...prevStory,
                            quiz: quizData
                        };
                    });
                }).catch(err => {
                    console.error('❌ Quiz generation failed:', err);
                });
            } catch (error) {
                console.error('❌ Failed to generate story:', error);
                // Fallback to mock story if generation fails
                setStory(MOCK_STORY);
                setIsGenerating(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
        };
        loadContent();

        return () => { stopAudio(); RNStatusBar.setHidden(false, 'fade'); if (Platform.OS === 'android') NavigationBar.setVisibilityAsync("visible"); };
    }, []);

    useEffect(() => {
        Animated.timing(modalSlideAnim, { toValue: isModalVisible ? 0 : height, duration: 350, useNativeDriver: true }).start();
    }, [isModalVisible]);

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        if (pageIndex !== activePageIndex) { setActivePageIndex(pageIndex); setSpeechCursor(0); Haptics.selectionAsync(); }
    };

    const handleComplete = async () => {
        stopAudio();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Increment stories read count
        await incrementStoriesRead();

        // Always navigate to quiz after story
        if (story) {
            console.log('📝 Navigating to quiz with story:', story.title);
            navigation.navigate('PostStoryQuiz' as any, { story });
        } else {
            // If no story (shouldn't happen), go back to main tabs
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
    };

    const renderParagraph = (words: any[], lang: 'target' | 'native', startIndex: number) => {
        let localCharIndex = 0;
        return (
            <Text style={styles.paragraph}>
                {words.map((w, i) => {
                    const globalStart = startIndex + localCharIndex;
                    const isSpeakingNow = activePageIndex === (lang === 'target' ? 0 : 1) && speechCursor >= globalStart && speechCursor < globalStart + w.raw.length;
                    localCharIndex += w.raw.length + 1;
                    return (
                        <Text key={i}>
                            <InteractiveWord word={w.raw} isImportant={w.isImportant} isSpeakingNow={isSpeakingNow} onPress={() => handleWordClick(w.raw, lang)} />
                            <Text style={styles.wordSpacer}> </Text>
                        </Text>
                    );
                })}
            </Text>
        );
    };

    if (isGenerating || !story) {
        return <StoryLoadingScreen />;
    }

    const targetTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [1, 0, 0], extrapolate: 'clamp' });
    const nativeTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [0, 0, 1], extrapolate: 'clamp' });

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar style="light" hidden />
            <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

            {isHistoryMode && (
                <TouchableWithoutFeedback onPress={() => { Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }).start(() => navigation.goBack()); }}>
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: panY.interpolate({ inputRange: [0, height], outputRange: [0.8, 0] }) }]} />
                </TouchableWithoutFeedback>
            )}

            <Animated.View style={[styles.mainContainer, isHistoryMode && styles.sheetContainer, { transform: isHistoryMode ? [{ translateY: panY }] : [] }]}>
                {isHistoryMode && <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />}

                {/* --- HEADER (CLEANED) --- */}
                <BlurView intensity={30} tint="dark" style={[styles.floatingHeader, { paddingTop: isHistoryMode ? 20 : insets.top + 15 }]} {...(isHistoryMode ? panResponder.panHandlers : {})}>
                    {isHistoryMode && <View style={styles.dragHandle} />}
                    <View style={styles.headerContent}>
                        <Animated.View style={[styles.headerTitleWrapper, { opacity: targetTitleOpacity }]}>
                            {/* Subtitle removed as requested */}
                            <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
                        </Animated.View>
                        <Animated.View style={[styles.headerTitleWrapper, { opacity: nativeTitleOpacity }]}>
                            <Text style={styles.headerTitle} numberOfLines={1}>{story.titleNative}</Text>
                        </Animated.View>
                    </View>
                </BlurView>

                {/* --- CONTENT --- */}
                <Animated.ScrollView
                    horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View style={{ width }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.storyScrollContent, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 160 }]}>
                            {!isTypingComplete ? (
                                <TypewriterText text={story.content} style={styles.paragraph} onComplete={() => setIsTypingComplete(true)} skipAnimation={isHistoryMode} />
                            ) : (
                                processedSegments.map((seg, i) => (
                                    <View key={i} style={styles.segmentContainer}>
                                        {renderParagraph(seg.targetWords, 'target', calculateGlobalIndex(i, 'target'))}
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                    <View style={{ width }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.storyScrollContent, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 160 }]}>
                            {processedSegments.map((seg, i) => (
                                <View key={i} style={styles.segmentContainer}>
                                    {renderParagraph(seg.nativeWords, 'native', calculateGlobalIndex(i, 'native'))}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </Animated.ScrollView>

                {/* --- REVISED COMPACT CONTROLS --- */}
                <View style={[styles.floatingControlsContainer, { bottom: insets.bottom + 0 }]}>

                    {/* Page Dots - Above controls */}
                    <View style={styles.pageIndicatorContainer}>
                        <Animated.View style={[styles.pageDot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [1, 0.3] }) }]} />
                        <Animated.View style={[styles.pageDot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [0.3, 1] }) }]} />
                    </View>

                    {/* The Control Capsule (Width %65) */}
                    <BlurView intensity={40} tint="dark" style={styles.floatingControls}>
                        <TouchableOpacity onPress={() => handleSkip('prev')} style={styles.controlIconBtn}>
                            <Ionicons name="play-skip-back" size={20} color={THEME.textMain} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButtonMain}>
                            {isSpeaking ? (
                                <Ionicons name="pause" size={22} color="#000" />
                            ) : (
                                <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 3 }} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSkip('next')} style={styles.controlIconBtn}>
                            <Ionicons name="play-skip-forward" size={20} color={THEME.textMain} />
                        </TouchableOpacity>

                        {!initialStory && (
                            <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
                                <Ionicons name="checkmark" size={18} color={THEME.accent} />
                            </TouchableOpacity>
                        )}
                    </BlurView>
                </View>

                {isHistoryMode && <View style={styles.borderOverlay} pointerEvents="none" />}
            </Animated.View>

            {/* --- MODAL --- */}
            <Modal animationType="none" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
                <View style={styles.modalBackdrop}>
                    <TouchableWithoutFeedback onPress={closeModal}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
                    <Animated.View style={[styles.wordModalContainer, { transform: [{ translateY: modalSlideAnim }] }]}>
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.wordModalContent}>
                            <View style={styles.modalDragHandle} />
                            <View style={styles.wordHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.wordTitle}>{selectedWordData?.word}</Text>
                                    <Text style={styles.wordTranslation}>{selectedWordData?.translation}</Text>
                                </View>
                                <TouchableOpacity onPress={() => Speech.speak(selectedWordData?.word || "", { language: story.language })} style={styles.audioBtn}>
                                    <Ionicons name="volume-high" size={24} color={THEME.accent} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.sectionLabel}>CONTEXT</Text>
                            <Text style={styles.wordExplanation}>{selectedWordData?.explanation}</Text>
                            <TouchableOpacity style={[styles.saveBtn, isSaved && styles.saveBtnActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleSaveWord(); }}>
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? THEME.accent : THEME.textMain} />
                                <Text style={[styles.saveBtnText, isSaved && { color: THEME.accent }]}>{isSaved ? "Saved" : "Save Word"}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#020617',
    },
    loadingHeader: {
        paddingTop: 60,
        paddingHorizontal: 32,
        marginBottom: 20,
    },
    loadingLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    loadingLogoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingLogoText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
        letterSpacing: 2.4,
    },
    masteryTipContainer: {
        position: 'absolute',
        top: 60,
        right: 24,
        maxWidth: 180,
        zIndex: 10,
    },
    masteryTipBlur: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        overflow: 'hidden',
    },
    masteryTipLabel: {
        color: '#fbbf24',
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    masteryTipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontFamily: FONTS.regular,
        lineHeight: 16,
    },
    loadingCenterContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    wordGlowBackground: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
    },
    wordCard: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wordForeign: {
        color: '#fbbf24',
        fontSize: 64,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(251, 191, 36, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    wordDivider: {
        width: 48,
        height: 1,
        backgroundColor: 'rgba(251, 191, 36, 0.3)',
        marginBottom: 16,
    },
    wordTranslation: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 20,
        fontFamily: FONTS.regular,
        letterSpacing: 4,
        textAlign: 'center',
    },
    loadingFooter: {
        paddingBottom: 64,
        paddingHorizontal: 32,
        alignItems: 'center',
        gap: 8,
    },
    loadingStatus: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.regular,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 4,
    },
    loadingSubtext: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: FONTS.semiBold,
        letterSpacing: 4.8,
        marginBottom: 24,
    },
    bouncingBalls: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
        height: 40,
        marginBottom: 32,
    },
    ball: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fbbf24',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    loadingTagline: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        fontFamily: FONTS.semiBold,
        letterSpacing: 2.4,
        textAlign: 'center',
    },

    mainContainer: { flex: 1, overflow: 'hidden' },
    sheetContainer: { marginTop: 60, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    borderOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 99 },

    floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
    headerContent: { alignItems: 'center', justifyContent: 'center', height: 40 },
    headerTitleWrapper: { position: 'absolute', alignItems: 'center', width: '85%' },
    headerTitle: { color: THEME.textMain, fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 0.5, textAlign: 'center' },

    storyScrollContent: { paddingHorizontal: 28 },
    segmentContainer: { marginBottom: 32 },
    paragraph: { color: '#E2E8F0', fontSize: 19, lineHeight: 34, fontFamily: FONTS.regular, letterSpacing: -0.2 },
    wordBase: { fontSize: 19, fontFamily: FONTS.regular, color: '#E2E8F0' },
    wordSpacer: { fontSize: 19 },
    wordImportant: { color: THEME.accent, fontFamily: FONTS.semiBold, textDecorationLine: 'underline', textDecorationColor: 'rgba(245, 158, 11, 0.4)' },

    // 🔥 NEW GLOW EFFECT (No Background)
    wordActive: {
        color: THEME.accent,
        textShadowColor: 'rgba(245, 158, 11, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        fontWeight: '700'
    },

    // --- REVISED COMPACT CONTROLS ---
    floatingControlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
    },

    pageIndicatorContainer: { flexDirection: 'row', gap: 8, marginBottom: 16, alignSelf: 'center' },
    pageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', shadowColor: "#fff", shadowOpacity: 0.5, shadowRadius: 4 },

    floatingControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly', // Dağılımı dengeledik
        backgroundColor: THEME.glassBg,
        borderRadius: 60,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '65%', // 🔥 DAHA DAR (User Requested)
        maxWidth: 320,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
    },

    controlIconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)' },

    playButtonMain: {
        width: 50, // 🔥 DAHA KÜÇÜK (User Requested)
        height: 50,
        borderRadius: 25,
        backgroundColor: THEME.textMain,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10
    },

    finishButton: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)'
    },

    // Modal
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    wordModalContainer: { width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', height: height * 0.45, backgroundColor: '#111' },
    wordModalContent: { padding: 32, flex: 1 },
    modalDragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
    wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    wordTitle: { fontSize: 32, fontFamily: FONTS.titleItalic, color: '#fff', marginBottom: 4, textTransform: 'capitalize' },
    wordTranslation: { fontSize: 20, color: THEME.accent, fontFamily: FONTS.regular },
    audioBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
    sectionLabel: { color: THEME.textMuted, fontSize: 12, fontFamily: FONTS.bold, letterSpacing: 1.5, marginBottom: 8 },
    wordExplanation: { color: '#CBD5E1', fontSize: 16, lineHeight: 24, fontFamily: FONTS.regular, marginBottom: 24 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    saveBtnActive: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: THEME.accent },
    saveBtnText: { color: '#fff', fontSize: 16, fontFamily: FONTS.semiBold },
});