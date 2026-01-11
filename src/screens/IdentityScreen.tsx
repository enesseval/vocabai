import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'App';
import OnboardingHeader from '../components/OnboardingHeader';

const COLORS = {
    bg: '#050406',
    primary: '#7c3aed',
    inputLabel: '#9ca3af',
    inputBorder: 'rgba(255,255,255,0.2)',
};

export default function IdentityScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" />
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingView}
                    >
                        <OnboardingHeader currentStep={1} />

                        <ScrollView
                            style={styles.contentContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.titleContainer}>
                                <Text style={styles.mainTitle}>Kim</Text>
                                <Text style={styles.highlightTitle}>öğreniyor?</Text>
                                <Text style={styles.subtitle}>Kimliğin, öğrenme yolculuğunu şekillendirir.</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>İSİM</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="İsminizi girin"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={name}
                                        onChangeText={setName}
                                        keyboardAppearance="dark"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>YAŞ</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="00"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={age}
                                        onChangeText={setAge}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        keyboardAppearance="dark"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* FOOTER BUTTON - KeyboardAvoidingView İçinde */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.continueButton, (name.trim() === '' || age.trim() === '') && styles.disabledButton]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    navigation.navigate('Language');
                                }}
                                disabled={name.trim() === '' || age.trim() === ''}
                            >
                                <Text style={styles.continueText}>DEVAM ET</Text>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1 },
    keyboardAvoidingView: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
    // Removed header and progress bar styles as they are now in the component
    contentContainer: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    titleContainer: { marginTop: 20, marginBottom: 40 },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular' },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12 },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
    formContainer: { gap: 30 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontWeight: '600' },
    input: { color: '#fff', fontSize: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, fontFamily: 'Inter-Regular' },
    footer: { paddingBottom: 20 },
    continueButton: { height: 72, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 36, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
    continueText: { color: '#fff', fontSize: 16, letterSpacing: 2, fontWeight: 'bold' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    disabledButton: { opacity: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
});