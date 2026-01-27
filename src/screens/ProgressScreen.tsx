// src/screens/ProgressScreen.tsx

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useVocabulary } from '../context/VocabularyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useHeader } from '../navigation/TabNavigator';
import { FONTS } from '../constants/theme';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MOCK_ACTIVITY = [5, 3, 0, 7, 4, 2, 0];

export default function ProgressScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { savedWords } = useVocabulary();
    const { storiesRead } = useSubscription();
    const { setHeaderLeft } = useHeader();

    // Header'ı her focus'ta güncelle
    useFocusEffect(
        useCallback(() => {
            setHeaderLeft(
                <Text style={styles.headerLeftTitle}>İlerleme</Text>
            );
        }, [setHeaderLeft])
    );

    // Mock mastery breakdown
    const masteryData = [
        { level: 'New', count: 12, percentage: 25, color: '#ef4444' },
        { level: 'Learning', count: 18, percentage: 40, color: '#f59e0b' },
        { level: 'Practicing', count: 10, percentage: 20, color: '#fbbf24' },
        { level: 'Mastered', count: 8, percentage: 15, color: '#10b981' },
    ];

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 100 }
                ]}
            >
                {/* Weekly Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <View style={styles.weekChart}>
                            {WEEK_DAYS.map((day, index) => (
                                <View key={index} style={styles.dayColumn}>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: `${(MOCK_ACTIVITY[index] / 10) * 100}%`,
                                                    backgroundColor: MOCK_ACTIVITY[index] > 0 ? '#fbbf24' : 'rgba(255,255,255,0.1)'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.dayLabel}>{day}</Text>
                                    <Text style={styles.dayValue}>{MOCK_ACTIVITY[index]}</Text>
                                </View>
                            ))}
                        </View>
                    </BlurView>
                </View>

                {/* Vocabulary Mastery */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vocabulary Mastery</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        {masteryData.map((item, index) => (
                            <View key={index}>
                                <View style={styles.masteryRow}>
                                    <Text style={styles.masteryLevel}>{item.level}</Text>
                                    <Text style={styles.masteryCount}>{item.count} words</Text>
                                </View>
                                <View style={styles.masteryBar}>
                                    <View
                                        style={[
                                            styles.masteryFill,
                                            { width: `${item.percentage}%`, backgroundColor: item.color }
                                        ]}
                                    />
                                </View>
                                {index < masteryData.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </BlurView>
                </View>

                {/* Quiz Performance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quiz Performance</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Average Accuracy</Text>
                                <Text style={styles.statValue}>78%</Text>
                            </View>
                            <View style={styles.dividerVertical} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Quizzes</Text>
                                <Text style={styles.statValue}>0</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Best Streak</Text>
                                <Text style={styles.statValue}>0</Text>
                            </View>
                            <View style={styles.dividerVertical} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Stories Read</Text>
                                <Text style={styles.statValue}>{storiesRead}</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>

                {/* Level Progress */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Level Progress</Text>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <View style={styles.levelHeader}>
                            <View>
                                <Text style={styles.currentLevel}>B1 → B2</Text>
                                <Text style={styles.levelSubtitle}>350/500 XP to next level</Text>
                            </View>
                            <View style={styles.percentageBadge}>
                                <Text style={styles.percentageText}>70%</Text>
                            </View>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '70%' }]} />
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
    headerLeftTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    weekChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    dayColumn: {
        flex: 1,
        alignItems: 'center',
    },
    barContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    bar: {
        width: '70%',
        alignSelf: 'center',
        borderRadius: 4,
        minHeight: 4,
    },
    dayLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
    },
    dayValue: {
        color: '#fff',
        fontSize: 11,
        fontFamily: FONTS.regular,
    },
    masteryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    masteryLevel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
    masteryCount: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    masteryBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    masteryFill: {
        height: '100%',
        borderRadius: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    dividerVertical: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginBottom: 8,
        textAlign: 'center',
    },
    statValue: {
        color: '#fbbf24',
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    currentLevel: {
        color: '#fff',
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    levelSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    percentageBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    percentageText: {
        color: '#fbbf24',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    progressBar: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fbbf24',
        borderRadius: 6,
    },
});
