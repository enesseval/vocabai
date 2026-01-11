import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import OnboardingHeader from '../components/OnboardingHeader';

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#050406',
    primary: '#7c3aed',
    text: '#ffffff',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    activeBorder: '#fbbf24', // Seçilince Altın Sarısı
    activeGlow: 'rgba(251, 191, 36, 0.3)',
};

// --- KATEGORİ DATASI ---
type Topic = {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const TOPICS: Topic[] = [
    { id: 1, name: 'Yazılım & Teknoloji', icon: 'code-slash-outline' },
    { id: 2, name: 'İş Dünyası & Girişim', icon: 'briefcase-outline' },
    { id: 3, name: 'Seyahat & Kültür', icon: 'airplane-outline' },
    { id: 4, name: 'Günlük Konuşma', icon: 'chatbubbles-outline' },
    { id: 5, name: 'Bilim & Uzay', icon: 'planet-outline' },
    { id: 6, name: 'Sanat & Edebiyat', icon: 'color-palette-outline' },
    { id: 7, name: 'Oyun (Gaming)', icon: 'game-controller-outline' },
    { id: 8, name: 'Sağlık & Spor', icon: 'fitness-outline' },
];

const TopicCard = ({ item, isSelected, onPress }: { item: Topic, isSelected: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.cardContainer, isSelected && styles.cardSelected]}
        >
            <LinearGradient
                colors={isSelected ? ['rgba(124, 58, 237, 0.4)', 'rgba(251, 191, 36, 0.1)'] : [COLORS.cardBg, COLORS.cardBg]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.iconBox, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={item.icon} size={24} color={isSelected ? '#fbbf24' : 'rgba(255,255,255,0.6)'} />
                </View>
                <Text style={[styles.cardTitle, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                    {item.name}
                </Text>
                {isSelected && (
                    <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={20} color="#fbbf24" />
                    </View>
                )}
            </LinearGradient>
            {isSelected && <View style={styles.glowBorder} />}
        </TouchableOpacity>
    );
};

export default function InterestsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    // Çoklu seçim için state (Array tutuyoruz)
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

    const toggleTopic = (id: number) => {
        Haptics.selectionAsync();
        if (selectedTopics.includes(id)) {
            setSelectedTopics(selectedTopics.filter(item => item !== id));
        } else {
            setSelectedTopics([...selectedTopics, id]);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                {/* --- HEADER (BİLEŞEN KULLANIMI) --- */}
                <OnboardingHeader currentStep={3} />

                {/* --- BAŞLIK (TASARIM GÜNCELLENDİ) --- */}
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Nelerden</Text>
                    <Text style={styles.highlightTitle}>hoşlanırsın?</Text>
                    <Text style={styles.subtitle}>Sana özel setler hazırlamak için en az 1 tane seçmelisin.</Text>
                </View>

                {/* --- GRID LİSTE (AYNEN KORUNDU) --- */}
                <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {TOPICS.map((item) => (
                            <TopicCard
                                key={item.id}
                                item={item}
                                isSelected={selectedTopics.includes(item.id)}
                                onPress={() => toggleTopic(item.id)}
                            />
                        ))}
                    </View>
                    {/* Footer butonun arkasında kalmaması için boşluk */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* --- FOOTER BUTON (TASARIM GÜNCELLENDİ - OUTLINE STİL) --- */}
                <View style={styles.footer}>
                    {/* Gradient Fade Background */}
                    <LinearGradient
                        colors={['transparent', COLORS.bg, COLORS.bg]}
                        locations={[0, 0.3, 1]}
                        style={styles.footerGradient}
                        pointerEvents="none"
                    />

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            selectedTopics.length === 0 && styles.disabledButton
                        ]}
                        disabled={selectedTopics.length === 0}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            console.log("Seçilenler:", selectedTopics);
                        }}
                    >
                        <Text style={[
                            styles.continueText,
                            selectedTopics.length === 0 && { color: 'rgba(255,255,255,0.3)' }
                        ]}>
                            DEVAM ET
                        </Text>

                        <View style={[
                            styles.iconCircle,
                            selectedTopics.length === 0 && { backgroundColor: 'rgba(255,255,255,0.05)' }
                        ]}>
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color={selectedTopics.length === 0 ? "rgba(255,255,255,0.3)" : "#fff"}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

    // --- YENİ BAŞLIK STİLLERİ ---
    titleContainer: { marginBottom: 30 },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular' },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12 },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'Inter-Regular' },

    // --- GRID (ORİJİNAL KODDAN KORUNDU) ---
    gridContainer: { paddingHorizontal: 0 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    cardContainer: { width: (width - 55) / 2, height: 140, marginBottom: 15, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden', position: 'relative' },
    cardSelected: { borderColor: COLORS.activeBorder },
    cardGradient: { flex: 1, padding: 16, justifyContent: 'space-between' },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
    checkIcon: { position: 'absolute', top: 12, right: 12 },
    glowBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: COLORS.activeBorder, borderRadius: 20, opacity: 0.5, shadowColor: COLORS.activeBorder, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },

    // --- YENİ FOOTER BUTON STİLLERİ ---
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 40, // Gradient için üstten boşluk
    },
    footerGradient: {
        ...StyleSheet.absoluteFillObject,
        top: 0,
    },
    continueButton: {
        height: 72,
        backgroundColor: '#000',
        borderRadius: 36,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30
    },
    disabledButton: { opacity: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
    continueText: { color: '#fff', fontSize: 16, letterSpacing: 2, fontWeight: 'bold' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
});