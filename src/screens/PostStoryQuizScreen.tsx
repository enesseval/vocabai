// src/screens/PostStoryQuizScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { QuizQuestion, QuizResult } from '../types/quiz';
import { Story } from '../types/story';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Mock quiz generator from story
const generateQuizFromStory = (story: Story): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];

    // Get first 5 vocabulary words for quiz
    const vocabWords = story.vocabulary?.slice(0, 5) || [];

    vocabWords.forEach((vocab, index) => {
        // Create distractors (wrong answers)
        const distractors = [
            'yanlış çeviri 1',
            'incorrect translation',
            'другой перевод',
        ];

        const options = [vocab.translation, ...distractors.slice(0, 3)]
            .sort(() => Math.random() - 0.5);

        questions.push({
            id: `q${index + 1}`,
            type: 'multiple_choice',
            question: `What does "${vocab.word}" mean?`,
            options,
            correctAnswer: vocab.translation,
            explanation: vocab.explanation,
            word: vocab.word,
        });
    });

    return questions;
};

export default function PostStoryQuizScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PostStoryQuiz'>>();
    const insets = useSafeAreaInsets();

    const story = route.params?.story;
    const [questions] = useState<QuizQuestion[]>(generateQuizFromStory(story));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentQuestionIndex]);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const score = results.filter(r => r.isCorrect).length;

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentQuestion.correctAnswer;

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setResults([...results, {
            questionId: currentQuestion.id,
            userAnswer: answer,
            isCorrect,
            timeSpent: 0,
        }]);
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log(`📝 Question ${currentQuestionIndex + 1}/${questions.length} completed`); // DEBUG

        if (currentQuestionIndex < questions.length - 1) {
            console.log('➡️ Moving to next question'); // DEBUG
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
        } else {
            console.log('✅ Quiz completed! Showing results...'); // DEBUG
            setShowResults(true);
        }
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('🔥 handleFinish called, navigating to PaywallScreen...'); // DEBUG
        try {
            navigation.navigate('PaywallScreen');
            console.log('✅ Navigation successful'); // DEBUG
        } catch (error) {
            console.error('❌ Navigation error:', error); // DEBUG
        }
    };

    if (showResults) {
        const accuracy = Math.round((score / questions.length) * 100);

        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1e1b4b', '#0f172a', '#000000']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={[styles.resultsContainer, { paddingTop: insets.top + 40 }]}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name={accuracy >= 80 ? "trophy" : "checkmark-circle"}
                                    size={64}
                                    color={accuracy >= 80 ? "#fbbf24" : "#10b981"}
                                />
                            </View>
                        </View>

                        <Text style={styles.resultsTitle}>
                            {accuracy >= 80 ? 'Excellent!' : 'Good Job!'}
                        </Text>

                        <Text style={styles.resultsSubtitle}>
                            You got {score} out of {questions.length} correct
                        </Text>

                        <BlurView intensity={20} tint="dark" style={styles.statsCard}>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Accuracy</Text>
                                <Text style={styles.statValue}>{accuracy}%</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Correct Answers</Text>
                                <Text style={styles.statValue}>{score}/{questions.length}</Text>
                            </View>
                        </BlurView>

                        <TouchableOpacity
                            style={styles.finishButton}
                            onPress={handleFinish}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#fbbf24', '#f59e0b']}
                                style={styles.finishButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.finishButtonText}>Continue</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {currentQuestionIndex + 1}/{questions.length}
                    </Text>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
                <Text style={styles.question}>{currentQuestion.question}</Text>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const showCorrect = isAnswered && isCorrect;
                        const showWrong = isAnswered && isSelected && !isCorrect;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                activeOpacity={0.7}
                            >
                                <BlurView
                                    intensity={20}
                                    tint="dark"
                                    style={[
                                        styles.optionCard,
                                        isSelected && styles.optionSelected,
                                        showCorrect && styles.optionCorrect,
                                        showWrong && styles.optionWrong,
                                    ]}
                                >
                                    <View style={styles.optionContent}>
                                        <View style={[
                                            styles.optionCircle,
                                            isSelected && styles.optionCircleSelected,
                                            showCorrect && styles.optionCircleCorrect,
                                            showWrong && styles.optionCircleWrong,
                                        ]}>
                                            {showCorrect && <Ionicons name="checkmark" size={16} color="#fff" />}
                                            {showWrong && <Ionicons name="close" size={16} color="#fff" />}
                                        </View>
                                        <Text style={[
                                            styles.optionText,
                                            showCorrect && styles.optionTextCorrect,
                                            showWrong && styles.optionTextWrong,
                                        ]}>
                                            {option}
                                        </Text>
                                    </View>
                                </BlurView>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {isAnswered && (
                    <Animated.View style={{ marginTop: 20 }}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fbbf24',
        borderRadius: 3,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    questionNumber: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    question: {
        color: '#fff',
        fontSize: 28,
        fontFamily: FONTS.bold,
        lineHeight: 36,
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    optionSelected: {
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    optionCorrect: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    optionWrong: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    optionCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionCircleSelected: {
        borderColor: '#fbbf24',
        backgroundColor: '#fbbf24',
    },
    optionCircleCorrect: {
        borderColor: '#10b981',
        backgroundColor: '#10b981',
    },
    optionCircleWrong: {
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
    },
    optionText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.regular,
        lineHeight: 22,
    },
    optionTextCorrect: {
        color: '#10b981',
    },
    optionTextWrong: {
        color: '#ef4444',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    resultsTitle: {
        color: '#fff',
        fontSize: 36,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 12,
    },
    resultsSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 18,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        marginBottom: 40,
    },
    statsCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginBottom: 40,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    statValue: {
        color: '#fbbf24',
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    finishButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    finishButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    finishButtonText: {
        color: '#000',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
});
