// src/screens/StoriesScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Ekran odaklanınca yenilemek için

import { COLORS, FONTS } from '../constants/theme';
import { Story } from '../types/story';
import { EmptyState } from '../components/EmptyState';

export default function StoriesScreen({ navigation }: any) {
    const [history, setHistory] = useState<Story[]>([]);

    // Sayfaya her gelindiğinde listeyi yenile (Yeni hikaye eklendiyse gör)
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem('story_history');
            if (stored) {
                // En yeniden eskiye sırala
                setHistory(JSON.parse(stored).reverse());
            }
        } catch (e) {
            console.error("Geçmiş yüklenemedi", e);
        }
    };

    const renderItem = ({ item }: { item: Story }) => (
        <TouchableOpacity
            style={styles.storyCard}
            activeOpacity={0.7}
            // 🔥 KRİTİK NOKTA: 'ReadStory' değil 'StoryModal' açıyoruz
            onPress={() => navigation.navigate('StoryModal', { story: item })}
        >
            <View style={styles.iconBox}>
                {/* Dile göre ikon veya bayrak konabilir */}
                <Text style={styles.langText}>{item.language.toUpperCase()}</Text>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.storySub} numberOfLines={1}>
                    {item.titleNative || 'Çeviri'} • {item.level || 'A1'}
                </Text>
            </View>

            <View style={styles.arrowBox}>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Kütüphane</Text>
                    <Text style={styles.headerSubtitle}>{history.length} Hikaye</Text>
                </View>

                {/* Liste */}
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={history.length === 0 ? { flex: 1 } : { padding: 24, paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="library-outline"
                            title="No Stories Yet"
                            description="Start your learning journey by creating your first AI-powered story. Each story is personalized just for you!"
                            actionLabel="Create Story"
                            onAction={() => navigation.navigate('ReadStory')}
                        />
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    header: { paddingHorizontal: 24, marginTop: 10, marginBottom: 20 },
    headerTitle: { fontSize: 32, color: '#fff', fontFamily: FONTS.titleItalic },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 },

    storyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    langText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },

    contentBox: { flex: 1 },
    storyTitle: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold, marginBottom: 4 },
    storySub: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },

    arrowBox: { paddingLeft: 10 },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 16 }
});