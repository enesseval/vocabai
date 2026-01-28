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
import { xpService } from '../services/xpService';

const { width, height } = Dimensions.get('window');

// Convert AI quiz to app quiz format
const generateQuizFromStory = (story: Story): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];

    console.log('🔍 Checking for AI-generated quiz...');
    console.log('   story.quiz exists:', !!story.quiz);

    // Try to use AI-generated quiz first
    if (story.quiz) {
        console.log('✅ Using AI-generated quiz');
        console.log('   Fill in blank:', story.quiz.fill_in_blank?.length || 0);
        console.log('   True/False:', story.quiz.true_false?.length || 0);
        console.log('   Comprehension:', story.quiz.comprehension?.length || 0);

        // Convert fill_in_blank to multiple choice
        story.quiz.fill_in_blank?.forEach((q, index) => {
            questions.push({
                id: `fib${index + 1}`,
                type: 'fill_blank',
                question: q.sentence,
                options: q.options,
                correctAnswer: q.answer,
                explanation: q.hint,
                word: '',
            });
        });

        // Convert true_false
        story.quiz.true_false?.forEach((q, index) => {
            questions.push({
                id: `tf${index + 1}`,
                type: 'multiple_choice',
                question: q.statement,
                options: ['True', 'False'],
                correctAnswer: q.answer ? 'True' : 'False',
                explanation: q.evidence,
                word: '',
            });
        });

        // Convert comprehension questions
        story.quiz.comprehension?.forEach((q, index) => {
            // If no options provided (old format), create them from answer
            let options = q.options;
            let correctAnswer = q.answer;

            if (!options || options.length === 0) {
                // Fallback: Use answer and generate distractors
                console.log('⚠️ Comprehension question missing options, generating fallback');
                const answer = (q as any).answer_native || q.answer;
                const distractors = [
                    'Hikayede bahsedilmeyen bir neden',
                    'Yanlış bir çıkarım',
                    'İlgisiz bir açıklama'
                ];
                options = [answer, ...distractors].sort(() => Math.random() - 0.5);
                correctAnswer = answer;
            }

            questions.push({
                id: `comp${index + 1}`,
                type: 'comprehension',
                question: q.question,
                options: options,
                correctAnswer: correctAnswer,
                explanation: q.explanation || (q as any).answer || '',
                word: '',
            });
        });

        console.log(`✅ Converted ${questions.length} AI questions`);
    }

    // Fallback: Generate better questions from vocabulary if no AI quiz
    if (questions.length === 0) {
        console.log('⚠️ No AI quiz found, generating smart fallback questions');
        const allVocab = story.vocabulary || [];

        if (allVocab.length === 0) {
            console.log('❌ No vocabulary available for quiz generation');
            return [];
        }

        // Separate by priority
        const highPriority = allVocab.filter(v => v.priority === 'high');
        const mediumPriority = allVocab.filter(v => v.priority === 'medium');
        const lowPriority = allVocab.filter(v => v.priority === 'low');

        // Select words: prefer high > medium > low
        const selectedWords = [
            ...highPriority.slice(0, 3),
            ...mediumPriority.slice(0, 2),
            ...lowPriority.slice(0, 1)
        ].slice(0, 5); // Max 5 questions

        console.log(`📝 Selected ${selectedWords.length} words for quiz:`,
            selectedWords.map(w => `${w.word} (${w.priority})`));

        selectedWords.forEach((vocab, index) => {
            // Get same-type words for better distractors
            const sameType = allVocab.filter(v =>
                v.word !== vocab.word &&
                v.type === vocab.type
            );

            // Get different-type words as backup
            const differentType = allVocab.filter(v =>
                v.word !== vocab.word &&
                v.type !== vocab.type
            );

            // Build distractors (prioritize same type)
            const distractors: string[] = [];

            // Add 2 same-type distractors
            sameType.slice(0, 2).forEach(v => distractors.push(v.translation));

            // Add 1 different-type distractor
            if (differentType.length > 0) {
                distractors.push(differentType[0].translation);
            }

            // Shuffle and ensure we have exactly 3 distractors
            const shuffledDistractors = distractors
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const options = [vocab.translation, ...shuffledDistractors]
                .sort(() => Math.random() - 0.5);

            // Better question format based on type
            let questionText = '';
            if (vocab.type === 'Verb') {
                questionText = `Ne anlama gelir: "${vocab.word}"?`;
            } else if (vocab.type === 'Noun') {
                questionText = `"${vocab.word}" kelimesinin Türkçe karşılığı nedir?`;
            } else if (vocab.type === 'Adjective') {
                questionText = `"${vocab.word}" sıfatı ne demektir?`;
            } else {
                questionText = `"${vocab.word}" ne anlama gelir?`;
            }

            questions.push({
                id: `v${index + 1}`,
                type: 'multiple_choice',
                question: questionText,
                options,
                correctAnswer: vocab.translation,
                explanation: vocab.explanation || vocab.in_story_context || `"${vocab.word}" means "${vocab.translation}"`,
                word: vocab.word,
            });
        });

        console.log(`✅ Generated ${questions.length} smart fallback questions`);
    }

    return questions;
};

export default function PostStoryQuizScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PostStoryQuiz'>>();
    const insets = useSafeAreaInsets();

    const story = route.params?.story;
    const [questions] = useState<QuizQuestion[]>(() => {
        console.log('\n🎯 ===== QUIZ GENERATION START =====');
        console.log('📚 Story:', story?.title);
        console.log('📖 Vocabulary available:', story?.vocabulary?.length || 0);

        // Log AI quiz data if available
        if (story?.quiz) {
            console.log('🤖 AI Quiz Data:');
            console.log(JSON.stringify(story.quiz, null, 2));
        } else {
            console.log('⚠️ No AI quiz in story object');
        }

        const generatedQuestions = generateQuizFromStory(story);

        console.log('\n🎯 Final Questions for UI:');
        generatedQuestions.forEach((q, i) => {
            console.log(`\nQuestion ${i + 1}:`);
            console.log(`   ID: ${q.id}`);
            console.log(`   Type: ${q.type}`);
            console.log(`   Question: ${q.question}`);
            console.log(`   Correct: "${q.correctAnswer}"`);
            console.log(`   Options: [${q.options?.map(o => `"${o}"`).join(', ') || 'No options'}]`);
        });
        console.log('\n🎯 ===== QUIZ GENERATION END =====\n');

        return generatedQuestions;
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);

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

    // Animate results screen when it appears
    useEffect(() => {
        if (showResults) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    }, [showResults]);

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

    const handleFinish = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check if this is the first story
        const xpState = xpService.getState();
        const storiesCompleted = xpState.xpHistory.filter(
            entry => entry.type === 'story_completed'
        ).length;

        console.log('📊 Stories completed:', storiesCompleted);

        // Only show paywall after first story
        if (storiesCompleted === 1) {
            console.log('🔥 First story completed! Showing paywall...');
            navigation.navigate('PaywallScreen');
        } else {
            console.log('✅ Not first story, going back to home');
            navigation.navigate('MainTabs');
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

    // Safety check: if no questions or no current question
    if (!currentQuestion || questions.length === 0) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1e1b4b', '#0f172a', '#000000']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.resultsContainer, { paddingTop: insets.top + 40 }]}>
                    <Text style={styles.resultsTitle}>No Quiz Available</Text>
                    <Text style={styles.resultsSubtitle}>Quiz generation failed</Text>
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPress={() => navigation.navigate('MainTabs')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.finishButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.finishButtonText}>Go Home</Text>
                        </LinearGradient>
                    </TouchableOpacity>
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
                <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                            {currentQuestion.type === 'fill_blank' ? '📝 Fill in Blank' :
                             currentQuestion.type === 'comprehension' ? '💭 Comprehension' :
                             '🎯 Multiple Choice'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.question}>{currentQuestion.question}</Text>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options?.map((option, index) => {
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
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionNumber: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    typeBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    typeBadgeText: {
        color: '#fbbf24',
        fontSize: 11,
        fontFamily: FONTS.semiBold,
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
