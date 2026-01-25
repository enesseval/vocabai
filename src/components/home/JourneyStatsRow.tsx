// src/components/home/JourneyStatsRow.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS } from '../../constants/theme';

interface JourneyStatsRowProps {
    stats: {
        storiesRead: number;
        wordsLearned: number;
        currentRank: string;
    };
}

interface StatCardProps {
    value: string | number;
    label: string;
    icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => {
    return (
        <BlurView intensity={10} tint="dark" style={styles.statCard}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </BlurView>
    );
};

export const JourneyStatsRow: React.FC<JourneyStatsRowProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            <StatCard value={stats.storiesRead} label="Stories" icon="📖" />
            <StatCard value={stats.wordsLearned} label="Words" icon="📝" />
            <StatCard value={stats.currentRank} label="Rank" icon="🏆" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    icon: {
        fontSize: 24,
        marginBottom: 8,
    },
    value: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
});
