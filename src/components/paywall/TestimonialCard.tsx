// src/components/paywall/TestimonialCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS } from '../../constants/theme';

interface Testimonial {
    name: string;
    role: string;
    quote: string;
    avatar: string;
}

interface TestimonialCardProps {
    testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
    return (
        <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.header}>
                <Image
                    source={{ uri: testimonial.avatar }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.name}>{testimonial.name}</Text>
                    <Text style={styles.role}>{testimonial.role}</Text>
                </View>
            </View>
            <Text style={styles.quote}>"{testimonial.quote}"</Text>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: 280,
        marginHorizontal: 8,
        overflow: 'hidden', // Fix border radius clipping
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(251, 189, 35, 0.3)',
    },
    userInfo: {
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    role: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    quote: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        fontFamily: FONTS.regular,
        fontStyle: 'italic',
        lineHeight: 24,
    },
});
