import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get env vars from expo-constants or process.env
const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://vfvmrudunsxeyimcqfeu.supabase.co";

const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdm1ydWR1bnN4ZXlpbWNxZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODg2MTksImV4cCI6MjA3NDk2NDYxOX0.6XNbpHceoySOMlkezx5eZSERGRHIUuM3phFyx4PxJ5g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

