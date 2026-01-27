// src/components/home/StoryHeroCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Story } from '../../types/story';
import { FONTS } from '../../constants/theme';
import { CategoryBadge } from './CategoryBadge';

interface StoryHeroCardProps {
    story: Story;
    onPress: () => void;
    position: number; // 0 = front, 1 = second, 2 = third
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // 24px padding each side

export const StoryHeroCard: React.FC<StoryHeroCardProps> = ({ story, onPress, position }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const scale = 1 - position * 0.05; // 0.95, 0.90
    const translateY = position * 8; // 8px, 16px
    const opacity = position === 0 ? 1 : 0.6;

    const metadata = story.metadata || {};
    const {
        teaser = 'An intriguing story awaits...',
        category = 'Drama',
        difficulty = 'Intermediate',
        estimatedMinutes = 5,
        xpReward = 60,
        imageUrl,
    } = metadata;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            disabled={position !== 0}
            style={[
                styles.container,
                {
                    transform: [{ scale }, { translateY }],
                    opacity,
                    zIndex: 10 - position,
                },
            ]}
        >
            <BlurView intensity={20} tint="dark" style={styles.card}>
                {/* Story image with gradient overlay */}
                {imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.imageGradient}
                        />
                    </View>
                )}

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>
                        {story.title}
                    </Text>

                    <Text style={styles.teaser} numberOfLines={3}>
                        {teaser}
                    </Text>

                    {/* Metadata row */}
                    <View style={styles.metadataRow}>
                        <CategoryBadge category={category} />
                        <Text style={styles.metadataText}>· {difficulty}</Text>
                        <Text style={styles.metadataText}>· {estimatedMinutes} min</Text>
                    </View>

                    {/* XP badge */}
                    <View style={styles.xpBadge}>
                        <Text style={styles.xpText}>+{xpReward} XP</Text>
                    </View>

                    {/* CTA Button */}
                    {position === 0 && (
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.ctaButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.ctaText}>Continue Story →</Text>
                        </LinearGradient>
                    )}
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginVertical: 4,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    content: {
        padding: 20,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontFamily: FONTS.bold,
        lineHeight: 36,
        marginBottom: 12,
    },
    teaser: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 22,
        marginBottom: 16,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    metadataText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
    xpBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(251, 189, 35, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    xpText: {
        color: '#fbbf24',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    ctaButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    ctaText: {
        color: '#000',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
});
