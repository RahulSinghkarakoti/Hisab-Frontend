// app/_layout.tsx
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { tokenService } from "../services/tokenService";
import { isTokenValid } from "../lib/tokenUtils";
import api from "../lib/axiosInstance";
import { logger } from "@/lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry failed queries once
      staleTime: 1000 * 60, // data considered fresh for 1 min
    },
  },
});

export default function RootLayout() {
  const { isAuthenticated, isLoading, setAuth, setLoading, logout } =useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [accessToken, user] = await Promise.all([
          tokenService.getAccessToken(),
          tokenService.getUser(),
        ]);
        if (!accessToken || !user) {
          logger.info("No accesstoken or user found", { accessToken, user });
          setLoading(false);
          return;
        }
        // ── Case 1: Access token exists and is still valid ─────────────────
        if (isTokenValid(accessToken)) {
          logger.info("accesstoken is still valid ", { accessToken, user });
          const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
          setAuth(parsedUser, accessToken);
          return;
        }
        const refreshToken = await tokenService.getRefreshToken();
        if (!refreshToken) {
          logger.info("no refresh token found  ", { refreshToken });
          setLoading(false);
          return;
        }

        const { data: response } = await api.post("/auth/refresh", {
          refreshToken,
        });
        await tokenService.saveTokens(
          response.data.accessToken,
          response.data.refreshToken ?? refreshToken,
        );
        await tokenService.saveUser(response.data.user);
        setAuth(response.data.user, response.data.accessToken);
      } catch (error) {
        console.log("_layout catch triggered .. logging out", error);
        await tokenService.clearTokens();
        logout();
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) router.replace("/(auth)/login");
    else if (isAuthenticated && inAuthGroup) router.replace("/(app)");
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
