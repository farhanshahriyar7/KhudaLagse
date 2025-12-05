import { Stack, useRouter } from "expo-router";
import { Camera, LogOut, ChevronRight, Lock, FileText, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { supabase } from "@/services/supabase";

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    // Protect the route
    React.useEffect(() => {
        if (!user) {
            router.replace("/auth");
        }
    }, [user]);

    if (!user) return null;

    const { orders } = useOrders();
    const [isUploading, setIsUploading] = useState(false);

    // Get last used address from most recent order
    const lastAddress = orders.length > 0 ? orders[0].deliveryAddress : "No address saved";

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    await signOut();
                    router.replace("/(tabs)");
                },
            },
        ]);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission", "Sorry, we need camera roll permissions to make this work!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setIsUploading(true);
            try {
                // NOTE: In a real production app, upload to Supabase Storage here.
                // For this demo/beta without storage setup, we'll store the base64 data URL directly in metadata.
                // This has size limits (usually < 4MB metadata limit), but works for small avatars.
                const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;

                const { error } = await supabase.auth.updateUser({
                    data: { image: imageUri }
                });

                if (error) throw error;

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                Alert.alert("Upload Failed", "Could not update profile picture.");
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleChangePassword = () => {
        Alert.alert("Feature", "Password change functionality coming soon!");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "Profile",
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: "bold",
                        color: Colors.light.text,
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: Colors.light.backgroundSecondary,
                    },
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
                        {user?.image ? (
                            <Image source={{ uri: user.image }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarInitials}>{getInitials(user?.name || "U")}</Text>
                            </View>
                        )}

                        <View style={styles.editBadge}>
                            <Camera size={14} color="#FFF" />
                        </View>

                        {isUploading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.userName}>{user?.name || "No User"}</Text>
                    <Text style={styles.userPhone}>{user?.phone || user?.email || "No contact info"}</Text>
                </View>

                {/* Info & Options Section */}
                <View style={styles.section}>
                    <View style={styles.infoCard}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>{user?.name}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.label}>Mobile Number</Text>
                        <Text style={styles.value}>{user?.phone || "Not set"}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.label}>Last Used Address</Text>
                        <Text style={styles.value} numberOfLines={2}>{lastAddress}</Text>
                    </View>

                    <TouchableOpacity style={styles.optionButton} onPress={handleChangePassword}>
                        <View style={styles.optionIcon}>
                            <Lock size={20} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.optionText}>Change Password</Text>
                        <ChevronRight size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => router.push("/(tabs)/orders" as any)}
                    >
                        <View style={styles.optionIcon}>
                            <FileText size={20} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.optionText}>Previous Orders</Text>
                        <ChevronRight size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
                        <View style={[styles.optionIcon, styles.logoutIcon]}>
                            <LogOut size={20} color="#FF3B30" />
                        </View>
                        <Text style={[styles.optionText, styles.logoutText]}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>Version 0.0.9 beta</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.backgroundSecondary,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderAvatar: {
        backgroundColor: Colors.light.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#FFF",
    },
    avatarInitials: {
        color: "#FFF",
        fontSize: 36,
        fontWeight: "bold",
    },
    editBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: Colors.light.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.light.text,
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    section: {
        gap: 16,
    },
    infoCard: {
        backgroundColor: Colors.light.background,
        borderRadius: 16,
        padding: 20,
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 4,
        textTransform: "uppercase",
        fontWeight: "600",
    },
    value: {
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginVertical: 12,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.background,
        padding: 16,
        borderRadius: 16,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${Colors.light.primary}15`,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: Colors.light.text,
    },
    logoutButton: {
        marginTop: 8,
    },
    logoutIcon: {
        backgroundColor: "#FF3B3015",
    },
    logoutText: {
        color: "#FF3B30",
    },
    versionText: {
        textAlign: "center",
        marginTop: 32,
        color: Colors.light.textSecondary,
        fontSize: 12,
    },
});
