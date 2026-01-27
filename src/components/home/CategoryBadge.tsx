// src/components/home/CategoryBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoryCategory } from '../../types/story';
import { FONTS } from '../../constants/theme';

interface CategoryBadgeProps {
    category: StoryCategory;
}

const CATEGORY_EMOJIS: Record<StoryCategory, string> = {
    Mystery: '🎭',
    Romance: '❤️',
    Adventure: '⚔️',
    'Sci-Fi': '🚀',
    Comedy: '😄',
    Drama: '🎬',
};

const CATEGORY_COLORS: Record<StoryCategory, string> = {
    Mystery: '#6366f1',
    Romance: '#ec4899',
    Adventure: '#f59e0b',
    'Sci-Fi': '#8b5cf6',
    Comedy: '#fbbf24',
    Drama: '#10b981',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
    return (
        <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[category] + '20' }]}>
            <Text style={styles.emoji}>{CATEGORY_EMOJIS[category]}</Text>
            <Text style={styles.label}>{category}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    emoji: {
        fontSize: 14,
    },
    label: {
        color: '#fff',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
});
