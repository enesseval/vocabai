// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types/navigation';
import { useOnboarding } from '../context/OnboardingContext';
import { useVocabulary } from '../context/VocabularyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
    {
        id: 'story',
        title: "Today's Story",
        subtitle: 'New AI adventure',
        icon: 'book',
        gradient: ['#fbbf24', '#f59e0b'],
        action: 'ReadStory' as const,
    },
    {
        id: 'quiz',
        title: 'Daily Quiz',
        subtitle: '10 words review',
        icon: 'school',
        gradient: ['#7c3aed', '#6d28d9'],
        action: 'VocabQuiz' as const,
    },
    {
        id: 'progress',
        title: 'View Progress',
        subtitle: 'Your journey',
        icon: 'stats-chart',
        gradient: ['#10b981', '#059669'],
        action: 'Progress' as const,
    },
];

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { userProfile } = useOnboarding();
    const { savedWords } = useVocabulary();
    const { isPremium, storiesRead } = useSubscription();

    const [greeting, setGreeting] = useState('Good morning');
    const [dailyGoal] = useState({ current: 3, target: 5 });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const handleActionPress = (action: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (action === 'ReadStory') {
            navigation.navigate('ReadStory' as any);
        } else if (action === 'VocabQuiz') {
            // Navigate to vocab quiz when implemented
            navigation.navigate('VocabQuiz' as any);
        } else if (action === 'Progress') {
            // Navigate to progress screen when implemented
            navigation.navigate('Progress' as any);
        }
    };

    const handleProfilePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Profile' as any);
    };

    const recentWords = savedWords.slice(0, 5);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Glassmorphic Navbar */}
            <BlurView
                intensity={50}
                tint="dark"
                style={[styles.navbar, { paddingTop: insets.top + 16 }]}
            >
                <View style={styles.navbarContent}>
                    {/* Streak Badge */}
                    <TouchableOpacity style={styles.streakBadge} activeOpacity={0.7}>
                        <Ionicons name="flame" size={20} color="#f59e0b" />
                        <Text style={styles.streakText}>5</Text>
                    </TouchableOpacity>

                    {/* Center Space */}
                    <View style={{ flex: 1 }} />

                    {/* Notification Bell */}
                    <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                        <Ionicons name="notifications-outline" size={22} color="#fff" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>

                    {/* Profile */}
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={handleProfilePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person" size={20} color="#fff" />
                        {isPremium && <View style={styles.premiumDot} />}
                    </TouchableOpacity>
                </View>
            </BlurView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 100 }
                ]}
            >
                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greetingText}>{greeting},</Text>
                    <Text style={styles.userName}>{userProfile.name || 'Learner'} 👋</Text>
                    <Text style={styles.greetingSubtitle}>
                        Ready to learn {dailyGoal.target - dailyGoal.current} more words today?
                    </Text>
                </View>

                {/* Daily Goal Progress */}
                <BlurView intensity={15} tint="dark" style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View>
                            <Text style={styles.goalTitle}>Daily Goal</Text>
                            <Text style={styles.goalSubtitle}>
                                {dailyGoal.current}/{dailyGoal.target} words learned
                            </Text>
                        </View>
                        <View style={styles.goalPercentage}>
                            <Text style={styles.goalPercentageText}>
                                {Math.round((dailyGoal.current / dailyGoal.target) * 100)}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(dailyGoal.current / dailyGoal.target) * 100}%` }
                            ]}
                        />
                    </View>
                </BlurView>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 24 }}
                    >
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                onPress={() => handleActionPress(action.action)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={action.gradient}
                                    style={styles.actionCard}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.actionIcon}>
                                        <Ionicons name={action.icon as any} size={28} color="#fff" />
                                    </View>
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recently Saved Words */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recently Saved</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentWords.length > 0 ? (
                        <View style={styles.wordsContainer}>
                            {recentWords.map((word, index) => (
                                <BlurView key={index} intensity={10} tint="dark" style={styles.wordCard}>
                                    <View style={styles.wordInfo}>
                                        <Text style={styles.wordText}>{word.word}</Text>
                                        <Text style={styles.wordTranslation}>{word.translation}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.audioButton}
                                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                    >
                                        <Ionicons name="volume-high" size={18} color="#fbbf24" />
                                    </TouchableOpacity>
                                </BlurView>
                            ))}
                        </View>
                    ) : (
                        <BlurView intensity={10} tint="dark" style={styles.emptyCard}>
                            <Ionicons name="bookmark-outline" size={40} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>No saved words yet</Text>
                            <Text style={styles.emptySubtext}>Tap words in stories to save them</Text>
                        </BlurView>
                    )}
                </View>

                {/* Achievements Mini-Widget */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Latest Achievement</Text>
                    <BlurView intensity={15} tint="dark" style={styles.achievementCard}>
                        <View style={styles.achievementIcon}>
                            <LinearGradient
                                colors={['#fbbf24', '#f59e0b']}
                                style={styles.achievementIconGradient}
                            >
                                <Ionicons name="trophy" size={24} color="#000" />
                            </LinearGradient>
                        </View>
                        <View style={styles.achievementInfo}>
                            <Text style={styles.achievementTitle}>First Steps</Text>
                            <Text style={styles.achievementSubtitle}>
                                {storiesRead} {storiesRead === 1 ? 'story' : 'stories'} read
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                    </BlurView>
                </View>

                {/* Learning Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>This Week</Text>
                    <BlurView intensity={15} tint="dark" style={styles.statsCard}>
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="book" size={24} color="#fbbf24" />
                                <Text style={styles.statValue}>{storiesRead}</Text>
                                <Text style={styles.statLabel}>Stories</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="library" size={24} color="#7c3aed" />
                                <Text style={styles.statValue}>{savedWords.length}</Text>
                                <Text style={styles.statLabel}>Words</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="star" size={24} color="#10b981" />
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>XP</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 16,
    },
    navbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        gap: 6,
    },
    streakText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#0f172a',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderWidth: 2,
        borderColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        position: 'relative',
    },
    premiumDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#7c3aed',
        borderWidth: 2,
        borderColor: '#0f172a',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    greetingSection: {
        marginBottom: 24,
    },
    greetingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    userName: {
        color: '#fff',
        fontSize: 32,
        fontFamily: FONTS.bold,
        marginBottom: 8,
    },
    greetingSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
    goalCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginBottom: 32,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    goalTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    goalSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    goalPercentage: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    goalPercentageText: {
        color: '#fbbf24',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fbbf24',
        borderRadius: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    viewAllText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
    actionCard: {
        width: 160,
        height: 180,
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-between',
        marginRight: 16,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginTop: 'auto',
    },
    actionSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    wordsContainer: {
        gap: 12,
    },
    wordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    wordInfo: {
        flex: 1,
    },
    wordText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
    },
    wordTranslation: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    audioButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        overflow: 'hidden',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginTop: 16,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginTop: 4,
    },
    achievementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    achievementIcon: {
        marginRight: 16,
    },
    achievementIconGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    achievementSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    statsCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
