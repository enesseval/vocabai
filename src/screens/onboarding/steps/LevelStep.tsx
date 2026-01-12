import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '../../../context/OnboardingContext';
import { COLORS, FONTS } from '../../../constants/theme';

export default function LevelStep() {
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    const LEVELS = [
        {
            id: 'Beginner',
            label: t('onboarding.level.options.beginner.label'),
            desc: t('onboarding.level.options.beginner.desc'),
            icon: 'battery-dead'
        },
        {
            id: 'Intermediate',
            label: t('onboarding.level.options.intermediate.label'),
            desc: t('onboarding.level.options.intermediate.desc'),
            icon: 'battery-half'
        },
        {
            id: 'Advanced',
            label: t('onboarding.level.options.advanced.label'),
            desc: t('onboarding.level.options.advanced.desc'),
            icon: 'battery-full'
        }
    ];

    const handleSelect = (level: any) => {
        Haptics.selectionAsync();
        updateProfile({ level });
    };

    return (
        <View style={styles.container}>
            {LEVELS.map((lvl) => {
                const isSelected = userProfile.level === lvl.id;
                return (
                    <TouchableOpacity
                        key={lvl.id}
                        activeOpacity={0.9}
                        onPress={() => handleSelect(lvl.id)}
                        style={[styles.card, isSelected && styles.selectedCard]}
                    >
                        <View style={styles.iconBox}>
                            <Ionicons
                                name={lvl.icon as any}
                                size={24}
                                color={isSelected ? COLORS.bg : COLORS.primary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, isSelected && { color: COLORS.bg }]}>{lvl.label}</Text>
                            <Text style={[styles.desc, isSelected && { color: 'rgba(0,0,0,0.6)' }]}>{lvl.desc}</Text>
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.bg} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 16, marginTop: 20 },
    card: {
        flexDirection: 'row', alignItems: 'center', padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        gap: 16
    },
    selectedCard: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center', alignItems: 'center'
    },
    title: { color: COLORS.text, fontSize: 18, fontFamily: FONTS.semiBold, marginBottom: 4 },
    desc: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular }
});