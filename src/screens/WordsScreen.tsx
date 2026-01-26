// src/screens/WordsScreen.tsx - Simple Words List

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useVocabulary } from '../context/VocabularyContext';
import { FONTS } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { useHeader } from '../navigation/TabNavigator';
import { WordCard } from '../components/WordCard';

type SortType = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc';
type FilterType = 'all' | 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Phrase';

export default function WordsScreen() {
    const insets = useSafeAreaInsets();
    const { savedWords, removeWord } = useVocabulary();
    const { setHeaderLeft } = useHeader();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date_desc');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [showFilters, setShowFilters] = useState(false);

    const filteredAndSortedWords = useMemo(() => {
        let result = [...savedWords];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(w =>
                w.word.toLowerCase().includes(query) ||
                w.translation.toLowerCase().includes(query) ||
                (w.explanation && w.explanation.toLowerCase().includes(query))
            );
        }

        // Type filter
        if (filterType !== 'all') {
            result = result.filter(w => w.type === filterType);
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
                case 'date_asc':
                    return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
                case 'alpha_asc':
                    return a.word.localeCompare(b.word);
                case 'alpha_desc':
                    return b.word.localeCompare(a.word);
                default:
                    return 0;
            }
        });

        return result;
    }, [savedWords, searchQuery, filterType, sortBy]);

    // Header'ı her focus'ta güncelle
    useFocusEffect(
        useCallback(() => {
            setHeaderLeft(
                <View>
                    <Text style={styles.headerTitle}>Kelimelerim</Text>
                    <Text style={styles.headerCount}>{filteredAndSortedWords.length} kelime</Text>
                </View>
            );
        }, [filteredAndSortedWords.length, setHeaderLeft])
    );

    const handleDeleteWord = async (word: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
            'Kelimeyi Sil',
            `"${word}" kelimesini silmek istediğinden emin misin?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => await removeWord(word)
                }
            ]
        );
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'date_desc': return 'En Yeni';
            case 'date_asc': return 'En Eski';
            case 'alpha_asc': return 'A-Z';
            case 'alpha_desc': return 'Z-A';
            default: return 'Sırala';
        }
    };

    const getFilterCount = (type: FilterType) => {
        if (type === 'all') return savedWords.length;
        return savedWords.filter(w => w.type === type).length;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 100 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Search & Filter Controls */}
                <View style={styles.controlsSection}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Kelime ara..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Toggle Button */}
                    <TouchableOpacity
                        onPress={() => {
                            setShowFilters(!showFilters);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.filterToggle, (showFilters || filterType !== 'all') && styles.filterToggleActive]}
                    >
                        <Ionicons
                            name="options"
                            size={20}
                            color={showFilters || filterType !== 'all' ? '#fbbf24' : 'rgba(255,255,255,0.6)'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Filters Panel */}
                {showFilters && (
                    <BlurView intensity={15} tint="dark" style={styles.filtersPanel}>
                        {/* Sort Options */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Sırala</Text>
                            <View style={styles.sortButtons}>
                                {[
                                    { value: 'date_desc' as SortType, icon: 'calendar', label: 'En Yeni' },
                                    { value: 'date_asc' as SortType, icon: 'calendar-outline', label: 'En Eski' },
                                    { value: 'alpha_asc' as SortType, icon: 'text', label: 'A-Z' },
                                    { value: 'alpha_desc' as SortType, icon: 'text-outline', label: 'Z-A' },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => {
                                            setSortBy(option.value);
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        }}
                                        style={[styles.sortButton, sortBy === option.value && styles.sortButtonActive]}
                                    >
                                        <Ionicons
                                            name={option.icon as any}
                                            size={16}
                                            color={sortBy === option.value ? '#fbbf24' : 'rgba(255,255,255,0.6)'}
                                        />
                                        <Text style={[styles.sortButtonText, sortBy === option.value && styles.sortButtonTextActive]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Type Filters */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Tür ({savedWords.length})</Text>
                            <View style={styles.typeFilters}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setFilterType('all');
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    style={[styles.typeButton, filterType === 'all' && styles.typeButtonActive]}
                                >
                                    <Text style={[styles.typeButtonText, filterType === 'all' && styles.typeButtonTextActive]}>
                                        Tümü <Text style={styles.typeCount}>({getFilterCount('all')})</Text>
                                    </Text>
                                </TouchableOpacity>

                                {(['Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase'] as FilterType[])
                                    .filter(type => getFilterCount(type) > 0)
                                    .map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => {
                                                setFilterType(type);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                            style={[styles.typeButton, filterType === type && styles.typeButtonActive]}
                                        >
                                            <Text style={[styles.typeButtonText, filterType === type && styles.typeButtonTextActive]}>
                                                {type === 'Noun' ? 'İsim' :
                                                 type === 'Verb' ? 'Fiil' :
                                                 type === 'Adjective' ? 'Sıfat' :
                                                 type === 'Adverb' ? 'Zarf' :
                                                 type === 'Phrase' ? 'Deyim' : type}{' '}
                                                <Text style={styles.typeCount}>({getFilterCount(type)})</Text>
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        </View>
                    </BlurView>
                )}

                {/* Word List */}
                {savedWords.length === 0 ? (
                    <BlurView intensity={15} tint="dark" style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyTitle}>Henüz kelime eklemedin</Text>
                        <Text style={styles.emptySubtitle}>
                            Hikaye okurken kelimelere dokun ve kaydet
                        </Text>
                    </BlurView>
                ) : filteredAndSortedWords.length === 0 ? (
                    <BlurView intensity={15} tint="dark" style={styles.emptyState}>
                        <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
                        <Text style={styles.emptySubtitle}>
                            Farklı bir arama terimi dene
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setFilterType('all');
                            }}
                            style={styles.clearFiltersButton}
                        >
                            <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
                        </TouchableOpacity>
                    </BlurView>
                ) : (
                    filteredAndSortedWords.map((word, index) => (
                        <View key={index} style={styles.wordCardWrapper}>
                            <WordCard word={word} />
                            <TouchableOpacity
                                onPress={() => handleDeleteWord(word.word)}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    wordCardWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    deleteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    headerCount: {
        color: '#fbbf24',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    controlsSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontFamily: FONTS.regular,
        height: '100%',
    },
    clearButton: {
        padding: 4,
    },
    filterToggle: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterToggleActive: {
        backgroundColor: 'rgba(251, 189, 35, 0.1)',
        borderColor: 'rgba(251, 189, 35, 0.3)',
    },
    filtersPanel: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    filterSection: {
        gap: 12,
    },
    filterLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sortButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sortButtonActive: {
        backgroundColor: 'rgba(251, 189, 35, 0.15)',
        borderColor: 'rgba(251, 189, 35, 0.3)',
    },
    sortButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    sortButtonTextActive: {
        color: '#fbbf24',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    typeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    typeButtonActive: {
        backgroundColor: '#fbbf24',
        borderColor: '#fbbf24',
    },
    typeButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    typeButtonTextActive: {
        color: '#000',
    },
    typeCount: {
        fontSize: 11,
        opacity: 0.6,
    },
    wordCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        overflow: 'hidden',
    },
    wordLeft: {
        flex: 1,
    },
    wordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    wordText: {
        color: '#fff',
        fontSize: 17,
        fontFamily: FONTS.bold,
    },
    wordTypeBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    wordTypeBadgeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
    },
    wordTranslation: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        marginBottom: 8,
    },
    wordExplanation: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        lineHeight: 18,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 60,
        alignItems: 'center',
        marginTop: 40,
        overflow: 'hidden',
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginTop: 24,
        marginBottom: 12,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        marginBottom: 16,
    },
    clearFiltersButton: {
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(251, 189, 35, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(251, 189, 35, 0.3)',
    },
    clearFiltersText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
});
