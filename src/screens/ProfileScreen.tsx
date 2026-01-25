// src/screens/ProfileScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '../context/OnboardingContext';
import { useVocabulary } from '../context/VocabularyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { FONTS } from '../constants/theme';

const ACHIEVEMENTS = [
    { id: 1, name: 'First Story', icon: 'book', unlocked: true },
    { id: 2, name: '7-Day Streak', icon: 'flame', unlocked: false },
    { id: 3, name: '50 Words', icon: 'library', unlocked: false },
    { id: 4, name: '100% Quiz', icon: 'trophy', unlocked: false },
];

export default function ProfileScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userProfile } = useOnboarding();
    const { savedWords } = useVocabulary();
    const { isPremium, subscription, storiesRead } = useSubscription();
    const [showDevTools, setShowDevTools] = useState(false);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
    };

    const handleClearDatabase = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your progress, vocabulary, and settings. This action cannot be undone. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All Data',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Alert.alert('Success', 'All data has been cleared. Please restart the app.');
                        } catch (error) {
                            console.error('Error clearing database:', error);
                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleViewData = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('DBViewer' as any);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>
                                {userProfile.name?.charAt(0).toUpperCase() || 'L'}
                            </Text>
                        </LinearGradient>
                        {isPremium && (
                            <View style={styles.premiumBadge}>
                                <Ionicons name="star" size={16} color="#000" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.profileName}>{userProfile.name || 'Learner'}</Text>
                    <Text style={styles.profileDetail}>
                        {userProfile.age} years old
                    </Text>
                    {isPremium && (
                        <View style={styles.premiumTag}>
                            <Text style={styles.premiumTagText}>Premium Member</Text>
                        </View>
                    )}
                </View>

                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <BlurView intensity={15} tint="dark" style={styles.statCard}>
                        <Ionicons name="book" size={28} color="#fbbf24" />
                        <Text style={styles.statValue}>{storiesRead}</Text>
                        <Text style={styles.statLabel}>Stories Read</Text>
                    </BlurView>

                    <BlurView intensity={15} tint="dark" style={styles.statCard}>
                        <Ionicons name="library" size={28} color="#7c3aed" />
                        <Text style={styles.statValue}>{savedWords.length}</Text>
                        <Text style={styles.statLabel}>Words Learned</Text>
                    </BlurView>

                    <BlurView intensity={15} tint="dark" style={styles.statCard}>
                        <Ionicons name="flame" size={28} color="#f59e0b" />
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </BlurView>

                    <BlurView intensity={15} tint="dark" style={styles.statCard}>
                        <Ionicons name="star" size={28} color="#10b981" />
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </BlurView>
                </View>

                {/* Learning Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Learning Journey</Text>
                    <BlurView intensity={15} tint="dark" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Native Language</Text>
                            <Text style={styles.infoValue}>{userProfile.nativeLang || '-'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Learning</Text>
                            <Text style={styles.infoValue}>{userProfile.targetLang || '-'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Level</Text>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelBadgeText}>{userProfile.level || 'A1'}</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>

                {/* Achievements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <View style={styles.achievementsGrid}>
                        {ACHIEVEMENTS.map((achievement) => (
                            <BlurView
                                key={achievement.id}
                                intensity={achievement.unlocked ? 20 : 10}
                                tint="dark"
                                style={[
                                    styles.achievementCard,
                                    !achievement.unlocked && styles.achievementLocked
                                ]}
                            >
                                <View style={[
                                    styles.achievementIcon,
                                    !achievement.unlocked && styles.achievementIconLocked
                                ]}>
                                    <Ionicons
                                        name={achievement.icon as any}
                                        size={24}
                                        color={achievement.unlocked ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
                                    />
                                </View>
                                <Text style={[
                                    styles.achievementName,
                                    !achievement.unlocked && styles.achievementNameLocked
                                ]}>
                                    {achievement.name}
                                </Text>
                            </BlurView>
                        ))}
                    </View>
                </View>

                {/* Settings & Dev Tools */}
                <View style={styles.section}>
                    <TouchableOpacity
                        onPress={() => setShowDevTools(!showDevTools)}
                        style={styles.sectionHeader}
                    >
                        <Text style={styles.sectionTitle}>Settings & Dev Tools</Text>
                        <Ionicons
                            name={showDevTools ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    {showDevTools && (
                        <BlurView intensity={15} tint="dark" style={styles.infoCard}>
                            <TouchableOpacity
                                onPress={handleViewData}
                                style={styles.devToolButton}
                            >
                                <View style={styles.devToolLeft}>
                                    <Ionicons name="eye-outline" size={24} color="#10b981" />
                                    <View style={styles.devToolText}>
                                        <Text style={styles.devToolTitle}>View Database</Text>
                                        <Text style={styles.devToolDescription}>
                                            View all AsyncStorage data in console
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                onPress={handleClearDatabase}
                                style={styles.devToolButton}
                            >
                                <View style={styles.devToolLeft}>
                                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                                    <View style={styles.devToolText}>
                                        <Text style={[styles.devToolTitle, { color: '#ef4444' }]}>
                                            Clear Database
                                        </Text>
                                        <Text style={styles.devToolDescription}>
                                            Delete all data (cannot be undone)
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </BlurView>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.section}>
                    {!isPremium && (
                        <TouchableOpacity style={styles.premiumButton}>
                            <LinearGradient
                                colors={['#fbbf24', '#f59e0b']}
                                style={styles.premiumButtonGradient}
                            >
                                <Ionicons name="star" size={20} color="#000" />
                                <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    headerSpacer: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#000',
        fontSize: 40,
        fontFamily: FONTS.bold,
    },
    premiumBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7c3aed',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    profileName: {
        color: '#fff',
        fontSize: 28,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    profileDetail: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    premiumTag: {
        marginTop: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#7c3aed',
    },
    premiumTagText: {
        color: '#7c3aed',
        fontSize: 12,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
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
        fontSize: 11,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    infoValue: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    levelBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    levelBadgeText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    achievementCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    achievementIconLocked: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    achievementName: {
        color: '#fff',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: 'rgba(255,255,255,0.4)',
    },
    premiumButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    premiumButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    premiumButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    devToolButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    devToolLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    devToolText: {
        flex: 1,
    },
    devToolTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
    },
    devToolDescription: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
});
