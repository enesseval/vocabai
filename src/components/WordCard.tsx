// src/components/WordCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import { FONTS } from '../constants/theme';

interface SavedWord {
    word: string;
    translation: string;
    explanation: string;
    type: string;
    phonetic?: string;
    level?: string;
}

interface WordCardProps {
    word: SavedWord;
}

export const WordCard: React.FC<WordCardProps> = ({ word }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('WordDetail', { word: word.word });
    };

    const typeTranslations: Record<string, { tr: string; color: string }> = {
        'Noun': { tr: 'İsim', color: '#3B82F6' },
        'Verb': { tr: 'Fiil', color: '#10B981' },
        'Adjective': { tr: 'Sıfat', color: '#F59E0B' },
        'Adverb': { tr: 'Zarf', color: '#8B5CF6' },
        'Phrase': { tr: 'İfade', color: '#EC4899' },
        'Preposition': { tr: 'Edat', color: '#6366F1' },
        'Conjunction': { tr: 'Bağlaç', color: '#14B8A6' },
        'Pronoun': { tr: 'Zamir', color: '#F97316' },
        'Interjection': { tr: 'Ünlem', color: '#EF4444' },
    };

    const typeInfo = typeTranslations[word.type] || { tr: word.type, color: '#6B7280' };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={styles.container}
        >
            <BlurView intensity={20} tint="dark" style={styles.cardContainer}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <View style={styles.wordContainer}>
                            <Text style={styles.wordText} numberOfLines={1}>
                                {word.word}
                            </Text>
                            {word.phonetic && (
                                <Text style={styles.phoneticText} numberOfLines={1}>
                                    {word.phonetic}
                                </Text>
                            )}
                        </View>

                        {/* Type Badge */}
                        <View style={[styles.typeBadge, { backgroundColor: `${typeInfo.color}15` }]}>
                            <View style={[styles.typeDot, { backgroundColor: typeInfo.color }]} />
                            <Text style={[styles.typeText, { color: typeInfo.color }]}>
                                {typeInfo.tr}
                            </Text>
                        </View>
                    </View>

                    {/* Translation */}
                    <View style={styles.translationRow}>
                        <Ionicons name="language" size={14} color="#FCD34D" style={styles.translationIcon} />
                        <Text style={styles.translationText} numberOfLines={1}>
                            {word.translation}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Explanation */}
                    <Text style={styles.explanationText} numberOfLines={2}>
                        {word.explanation}
                    </Text>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {word.level && (
                            <View style={styles.levelBadge}>
                                <Ionicons name="bar-chart" size={10} color="#A78BFA" />
                                <Text style={styles.levelText}>{word.level}</Text>
                            </View>
                        )}

                        <View style={styles.arrowContainer}>
                            <Text style={styles.viewDetailsText}>Detaylar</Text>
                            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.4)" />
                        </View>
                    </View>
                </View>

                {/* Floating Shadow Effect */}
                <View style={styles.shadowEffect} />
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 0,
    },
    cardContainer: {
        position: 'relative',
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        borderWidth: .7,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    accentLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    content: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    wordContainer: {
        flex: 1,
        marginRight: 12,
    },
    wordText: {
        color: '#fff',
        fontSize: 22,
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    phoneticText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: 2,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 5,
    },
    typeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    typeText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    translationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    translationIcon: {
        marginRight: 6,
    },
    translationText: {
        color: '#FCD34D',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginBottom: 12,
    },
    explanationText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.2)',
    },
    levelText: {
        color: '#A78BFA',
        fontSize: 11,
        fontFamily: FONTS.semiBold,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    shadowEffect: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
});
