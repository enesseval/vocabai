import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Bu değerleri Supabase Dashboard -> Project Settings -> API kısmından alacaksın.
// Güvenlik notu: ANON key istemci tarafında durabilir, güvenlidir.
const SUPABASE_URL = "https://inhgwfmbhysvnjaazqip.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E3AaRNr98m1i2-i8q97Zjg_0wwcw6GJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});