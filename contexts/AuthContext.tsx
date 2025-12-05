import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (userData: User | null) => {
      if (userData) {
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem("user");
      }
      return userData;
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  const signIn = async (email: string, password: string) => {
    const userData: User = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      phone: "",
    };
    setUser(userData);
    await syncMutation.mutateAsync(userData);
  };

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    const userData: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
    };
    setUser(userData);
    await syncMutation.mutateAsync(userData);
  };

  const signOut = async () => {
    setUser(null);
    await syncMutation.mutateAsync(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    isLoading: userQuery.isLoading,
  };
});
