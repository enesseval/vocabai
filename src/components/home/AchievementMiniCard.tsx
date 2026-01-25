// src/components/home/AchievementMiniCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from '../../types/xp';
import { FONTS } from '../../constants/theme';

interface AchievementMiniCardProps {
    achievement: Achievement;
}

export const AchievementMiniCard: React.FC<AchievementMiniCardProps> = ({ achievement }) => {
    return (
        <BlurView intensity={15} tint="dark" style={styles.card}>
            <LinearGradient
                colors={['rgba(251, 189, 35, 0.1)', 'rgba(245, 158, 11, 0.05)']}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{achievement.icon}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>
                        {achievement.title}
                    </Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {achievement.description}
                    </Text>
                    <Text style={styles.xp}>+{achievement.xpReward} XP</Text>
                </View>
            </LinearGradient>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(251, 189, 35, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    description: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginBottom: 4,
    },
    xp: {
        color: '#fbbf24',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
});
