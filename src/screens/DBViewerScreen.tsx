import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS } from '../constants/theme';
import { useVocabulary } from '../context/VocabularyContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function DBViewerScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { savedWords } = useVocabulary();
    const { userProfile } = useOnboarding();
    const { storiesRead } = useSubscription();

    const handleClearWords = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Kelimeleri Sil',
            'Tüm kelime veritabanı silinecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('user_vocabulary');
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Başarılı', 'Kelimeler silindi. Uygulamayı yeniden başlatın.');
                    }
                }
            ]
        );
    };

    const handleClearStories = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Hikayeleri Sil',
            'Tüm hikaye geçmişi silinecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('story_history');
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Başarılı', 'Hikayeler silindi. Uygulamayı yeniden başlatın.');
                    }
                }
            ]
        );
    };

    const handleResetAll = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            'Tüm Verileri Sil',
            'TÜM kullanıcı verileri silinecek ve onboarding\'e döneceksiniz. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Başarılı', 'Tüm veriler silindi. Uygulamayı yeniden başlatın.');
                    }
                }
            ]
        );
    };

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

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Database Viewer</Text>
                    <View style={styles.placeholder} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: 20, paddingBottom: insets.bottom + 40 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* User Profile Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>User Profile</Text>
                    </View>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <Text style={styles.jsonText}>
                            {JSON.stringify(userProfile, null, 2)}
                        </Text>
                    </BlurView>
                </View>

                {/* Vocabulary Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Vocabulary ({savedWords.length})
                        </Text>
                        <TouchableOpacity onPress={handleClearWords} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <Text style={styles.jsonText}>
                            {JSON.stringify(savedWords, null, 2)}
                        </Text>
                    </BlurView>
                </View>

                {/* Subscription Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Subscription</Text>
                    </View>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <Text style={styles.jsonText}>
                            {JSON.stringify({ storiesRead }, null, 2)}
                        </Text>
                    </BlurView>
                </View>

                {/* Stories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Story History</Text>
                        <TouchableOpacity onPress={handleClearStories} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <BlurView intensity={15} tint="dark" style={styles.card}>
                        <Text style={styles.jsonText}>
                            Check AsyncStorage for 'story_history'
                        </Text>
                    </BlurView>
                </View>

                {/* Reset All Button */}
                <TouchableOpacity onPress={handleResetAll} style={styles.resetButton}>
                    <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={styles.resetButtonGradient}
                    >
                        <Ionicons name="warning" size={20} color="#fff" />
                        <Text style={styles.resetButtonText}>Reset All Data</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
        backgroundColor: 'rgba(30, 27, 75, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    placeholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        overflow: 'hidden',
    },
    jsonText: {
        fontFamily: 'Courier',
        fontSize: 11,
        color: '#d1d5db',
        lineHeight: 16,
    },
    resetButton: {
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
