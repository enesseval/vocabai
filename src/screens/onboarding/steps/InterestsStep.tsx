import React, { useMemo } from 'react'; // useMemo performansı artırır
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next'; // i18n
import { useOnboarding } from '../../../context/OnboardingContext';
import { COLORS, FONTS, SIZES } from '../../../constants/theme';

type Topic = { id: number; key: string; icon: keyof typeof Ionicons.glyphMap; };

export default function InterestsStep() {
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    // Konuları i18n anahtarlarıyla (key) tanımlıyoruz
    // useMemo kullanarak gereksiz yeniden hesaplamaları önlüyoruz
    const TOPICS: Topic[] = useMemo(() => [
        { id: 1, key: 'tech', icon: 'hardware-chip-outline' },
        { id: 2, key: 'philosophy', icon: 'library-outline' },
        { id: 3, key: 'art', icon: 'color-palette-outline' },
        { id: 4, key: 'business', icon: 'briefcase-outline' },
        { id: 5, key: 'nature', icon: 'leaf-outline' },
        { id: 6, key: 'science', icon: 'flask-outline' },
        { id: 7, key: 'literature', icon: 'book-outline' },
        { id: 8, key: 'history', icon: 'hourglass-outline' },
        { id: 9, key: 'cinema', icon: 'film-outline' },
        { id: 10, key: 'travel', icon: 'airplane-outline' },
    ], []);

    const toggleTopic = (id: number) => {
        Haptics.selectionAsync();
        const current = userProfile.interests;
        if (current.includes(id)) {
            updateProfile({ interests: current.filter(item => item !== id) });
        } else {
            updateProfile({ interests: [...current, id] });
        }
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <View style={styles.pillContainer}>
                {TOPICS.map((item) => {
                    const isSelected = userProfile.interests.includes(item.id);
                    // Çeviriyi burada alıyoruz: t(`onboarding.interests.topics.${item.key}`)
                    const translatedName = t(`onboarding.interests.topics.${item.key}`);

                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            onPress={() => toggleTopic(item.id)}
                            style={[styles.pill, isSelected && styles.pillSelected]}
                        >
                            <View style={styles.pillContent}>
                                <Ionicons
                                    name={item.icon}
                                    size={18}
                                    color={isSelected ? COLORS.primary : 'rgba(255,255,255,0.6)'}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[
                                    styles.pillText,
                                    isSelected && { color: COLORS.primary, fontFamily: FONTS.semiBold }
                                ]}>
                                    {translatedName}
                                </Text>
                            </View>
                            {isSelected && <View style={styles.pillGlow} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '100%', marginTop: 20 },
    pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    pillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.activeGlow },
    pillContent: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
    pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: FONTS.regular, letterSpacing: 0.5 },
    pillGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.primary, opacity: 0.05 },
});