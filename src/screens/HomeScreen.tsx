import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { useVocabulary } from '../context/VocabularyContext';

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { userProfile, resetProfile } = useOnboarding();
    const { savedWords } = useVocabulary();
    const [hasReadToday, setHasReadToday] = useState(false);

    useEffect(() => {
        checkDailyStatus();
    }, []);

    const checkDailyStatus = async () => {
        const lastFetchDate = await AsyncStorage.getItem('last_story_date');
        const today = new Date().toISOString().split('T')[0];
        setHasReadToday(lastFetchDate === today);
    };

    const handleReset = async () => {
        await AsyncStorage.clear();
        resetProfile();
        navigation.replace('Welcome');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>HOŞ GELDİN,</Text>
                        <Text style={styles.username}>{userProfile?.name || 'Gezgin'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={handleReset}>
                        {/* Avatar yerine baş harf */}
                        <Text style={styles.avatarText}>{userProfile?.name?.charAt(0)}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* STATS ROW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{savedWords.length}</Text>
                            <Text style={styles.statLabel}>Kelime</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>1</Text>
                            <Text style={styles.statLabel}>Gün Serisi</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{userProfile?.targetLang?.toUpperCase()}</Text>
                            <Text style={styles.statLabel}>Hedef</Text>
                        </View>
                    </View>

                    {/* MAIN ACTION CARD */}
                    <View style={[styles.mainCard, hasReadToday && styles.completedCard]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>GÜNLÜK HİKAYE</Text>
                            {hasReadToday && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                        </View>

                        <Text style={styles.cardDesc}>
                            {hasReadToday
                                ? "Bugünkü hikayeni tamamladın! Yarın yeni bir macera seni bekliyor."
                                : "Yapay zeka senin için yeni bir hikaye hazırlamaya hazır."}
                        </Text>

                        <TouchableOpacity
                            style={[styles.actionBtn, hasReadToday && styles.secondaryBtn]}
                            onPress={() => navigation.navigate('ReadStory')}
                        >
                            <Text style={[styles.btnText, hasReadToday && { color: COLORS.text }]}>
                                {hasReadToday ? "Tekrar Oku" : "Hikayeyi Başlat"}
                            </Text>
                            <Ionicons name={hasReadToday ? "book-outline" : "play"} size={20} color={hasReadToday ? COLORS.text : "#000"} />
                        </TouchableOpacity>
                    </View>

                    {/* VOCABULARY TEASER */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>SON KAYDEDİLENLER</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>Tümü</Text>
                            </TouchableOpacity>
                        </View>

                        {savedWords.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {savedWords.slice(0, 5).map((w, i) => (
                                    <View key={i} style={styles.wordCard}>
                                        <Text style={styles.wordText}>{w.word}</Text>
                                        <Text style={styles.transText}>{w.translation}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Henüz kelime kaydetmedin.</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.devFooter}>
                        <Ionicons name="flask-outline" size={14} color="rgba(255,255,255,1)" />
                        <Text style={styles.devText}>VocabAI Beta v0.1</Text>
                        <Text style={styles.devText}>Bu sayfa henüz deney aşamasında</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    devFooter: { marginTop: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, paddingBottom: 20 },
    devText: { color: 'rgba(255,255,255,1)', fontSize: 14, fontFamily: FONTS.regular, letterSpacing: 1 },
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, padding: 24 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    greeting: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.bold, letterSpacing: 1 },
    username: { color: COLORS.text, fontSize: 28, fontFamily: FONTS.titleItalic },
    profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontFamily: FONTS.bold },

    content: { gap: 30 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    statNumber: { color: COLORS.text, fontSize: 20, fontFamily: FONTS.bold, marginBottom: 4 },
    statLabel: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.regular },

    mainCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 24 },
    completedCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { color: '#000', fontSize: 14, fontFamily: FONTS.bold, letterSpacing: 1, opacity: 0.7 },
    cardDesc: { color: '#000', fontSize: 16, fontFamily: FONTS.regular, lineHeight: 24, marginBottom: 24, opacity: 0.9 },

    actionBtn: { backgroundColor: '#000', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
    btnText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold },

    section: { gap: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.bold },
    seeAll: { color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.regular },

    wordCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, minWidth: 120 },
    wordText: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.bold, marginBottom: 4 },
    transText: { color: COLORS.textSecondary, fontSize: 14 },

    emptyState: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
    emptyText: { color: COLORS.textSecondary, fontStyle: 'italic' }
});