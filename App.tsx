// App.tsx 
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tipleri yeni dosyadan çekiyoruz
import { RootStackParamList } from './src/types/navigation';

import './src/i18n';
import { OnboardingProvider } from './src/context/OnboardingContext';

// Importları standart hale getirelim
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReadStoryScreen from '@/screens/ReadStoryScreen';
import { VocabularyProvider } from '@/context/VocabularyContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Merriweather-Bold': require('./src/assets/fonts/Merriweather-Bold.ttf'),
    'Merriweather-Regular': require('./src/assets/fonts/Merriweather-Regular.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
  });

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Welcome');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Kullanıcı var mı kontrol et
        const user = await AsyncStorage.getItem('user_persona');
        if (user) {
          setInitialRoute('Home');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <OnboardingProvider>
      <VocabularyProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <NavigationContainer>
              {/* initialRouteName'i dinamik yaptık */}
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="ReadStory" component={ReadStoryScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </SafeAreaProvider>
      </VocabularyProvider>
    </OnboardingProvider>
  );
}