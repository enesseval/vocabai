/**
 * Vocabulary Screen
 *
 * Displays saved words with search, filter, and review capabilities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { useVocabulary } from '../context/VocabularyContext';
import { usePurchase } from '../context/PurchaseContext';
import { COLORS, FONTS } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';

export default function VocabularyScreen() {
  const navigation = useNavigation<any>();
  const { savedWords, removeWord } = useVocabulary();
  const { subscription, limits, usage } = usePurchase();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter words based on search
  const filteredWords = savedWords.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveWord = async (word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate list changes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    await removeWord(word);
  };

  const renderWordCard = ({ item }: any) => (
    <View style={styles.wordCard}>
      <View style={styles.wordContent}>
        <Text style={styles.wordText}>{item.word}</Text>
        <Text style={styles.wordTranslation}>{item.translation}</Text>
        {item.explanation && (
          <Text style={styles.wordExplanation} numberOfLines={2}>
            {item.explanation}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveWord(item.word)}
      >
        <Ionicons name="trash-outline" size={20} color="rgba(255,92,92,0.8)" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Words</Text>
            <Text style={styles.headerSubtitle}>
              {usage.savedWordsCount} / {limits.savedWords === 'unlimited' ? '∞' : limits.savedWords} words
              {subscription.tier === 'free' && (
                <Text style={styles.upgradeBadge}> • Free Plan</Text>
              )}
            </Text>
          </View>

          {subscription.tier === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Paywall')}
            >
              <Ionicons name="star" size={16} color="#FBB F24" />
            </TouchableOpacity>
          )}
        </View>

        {savedWords.length > 0 && (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="rgba(255,255,255,0.4)"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search words..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{savedWords.length}</Text>
                <Text style={styles.statLabel}>Total Words</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {savedWords.filter((w) => w.masteryLevel >= 3).length}
                </Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {savedWords.filter((w) => w.masteryLevel < 3).length}
                </Text>
                <Text style={styles.statLabel}>Learning</Text>
              </View>
            </View>
          </>
        )}

        {/* Words List */}
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.word}
          renderItem={renderWordCard}
          contentContainerStyle={
            filteredWords.length === 0 ? { flex: 1 } : { padding: 24, paddingBottom: 100 }
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <EmptyState
                icon="search-outline"
                title="No Results"
                description={`No words found matching "${searchQuery}"`}
                variant="compact"
              />
            ) : (
              <EmptyState
                icon="book-outline"
                title="No Saved Words"
                description="Start saving words from stories to build your vocabulary. Tap on any word while reading to save it!"
                actionLabel="Read a Story"
                onAction={() => navigation.navigate('HomeTab')}
              />
            )
          }
        />
      </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: FONTS.titleItalic,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 4,
  },
  upgradeBadge: {
    color: '#FBBF24',
  },
  upgradeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: FONTS.regular,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  wordContent: {
    flex: 1,
    marginRight: 12,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  wordTranslation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  wordExplanation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,92,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
