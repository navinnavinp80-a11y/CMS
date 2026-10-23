import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getCurrentUser } from "../services/api";

export interface UserSession {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: "free" | "premium";
  premiumExpiresAt?: string | null;
}

export interface AuthContextType {
  token: string | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  isLoading: boolean;
  login: (token: string, user?: UserSession) => void;
  logout: () => void;
  checkTokenValidity: () => boolean;
  refreshUser: () => Promise<UserSession | null>;
  updateUser: (updatedFields: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Validates a JWT string:
 * 1. Must be a valid 3-part string.
 * 2. Payload must be decodeable JSON.
 * 3. Must not be expired (exp > Date.now()).
 * 4. Must contain an identifier (id, userId, or sub).
 */
export function isTokenValid(token: string | null): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.trim().split(".");
  if (parts.length !== 3) return false;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // Check expiration if present
    if (payload.exp && typeof payload.exp === "number") {
      const currentTimeSec = Math.floor(Date.now() / 1000);
      if (payload.exp <= currentTimeSec) {
        return false; // Token has expired
      }
    }

    // Must have a user identifier
    if (!payload.id && !payload.userId && !payload.sub && !payload.email) {
      return false; // Malformed payload
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clears any invalid or stale authentication tokens and user information
 */
export function clearStoredAuth(): void {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cms_site_settings");
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronously initialize auth state from localStorage with strict validation
  const [authState, setAuthState] = useState<{
    token: string | null;
    user: UserSession | null;
    isAuthenticated: boolean;
  }>(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken && isTokenValid(storedToken)) {
        let storedUser: UserSession | null = null;
        const userJson = localStorage.getItem("user");
        if (userJson) {
          try {
            storedUser = JSON.parse(userJson);
          } catch {
            storedUser = null;
          }
        }
        return {
          token: storedToken,
          user: storedUser,
          isAuthenticated: true,
        };
      }
      // If token is missing, invalid, or expired, clear any residue immediately
      if (storedToken) {
        clearStoredAuth();
      }
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    } catch {
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    }
  });

  const [isLoading] = useState(false);

  const checkTokenValidity = useCallback((): boolean => {
    const currentToken = localStorage.getItem("token");
    const valid = isTokenValid(currentToken);
    if (!valid && authState.isAuthenticated) {
      clearStoredAuth();
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
    return valid;
  }, [authState.isAuthenticated]);

  const login = useCallback((newToken: string, newUser?: UserSession) => {
    if (!isTokenValid(newToken)) {
      clearStoredAuth();
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
      });
      return;
    }

    try {
      clearStoredAuth();
      localStorage.setItem("token", newToken);
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      }
    } catch (e) {
      console.error("Error persisting auth session:", e);
    }

    setAuthState({
      token: newToken,
      user: newUser || null,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  }, []);

  const updateUser = useCallback((updatedFields: Partial<UserSession>) => {
    setAuthState((prev) => {
      const mergedUser: UserSession = prev.user
        ? { ...prev.user, ...updatedFields }
        : (updatedFields as UserSession);
      try {
        localStorage.setItem("user", JSON.stringify(mergedUser));
      } catch (e) {
        console.error("Error saving updated user session:", e);
      }
      return {
        ...prev,
        user: mergedUser,
      };
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<UserSession | null> => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken || !isTokenValid(currentToken)) {
      return null;
    }

    try {
      const freshUser = await getCurrentUser();
      if (freshUser) {
        const normalizedUser: UserSession = {
          id: freshUser.id || freshUser._id,
          name: freshUser.name,
          email: freshUser.email,
          role: freshUser.role,
          plan: freshUser.plan,
          premiumExpiresAt: freshUser.premiumExpiresAt,
        };

        try {
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        } catch { }

        setAuthState((prev) => ({
          ...prev,
          user: normalizedUser,
          isAuthenticated: true,
        }));

        return normalizedUser;
      }
    } catch (err) {
      console.error("Failed to refresh user profile from server:", err);
    }
    return null;
  }, []);

  // Automatically refresh user plan and entitlement status from the server on mount if authenticated
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken && isTokenValid(currentToken)) {
      refreshUser();
    }
  }, [refreshUser]);

  // Periodic check / storage sync (e.g. if token expires or tab logs out)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        const storedToken = localStorage.getItem("token");
        if (storedToken && isTokenValid(storedToken)) {
          let parsedUser: UserSession | null = null;
          try {
            const raw = localStorage.getItem("user");
            if (raw) parsedUser = JSON.parse(raw);
          } catch {
            // ignore
          }
          setAuthState({
            token: storedToken,
            user: parsedUser,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isPremium = Boolean(
    authState.user?.role === "admin" ||
    (authState.user?.plan === "premium" &&
      Boolean(authState.user?.premiumExpiresAt) &&
      new Date(authState.user.premiumExpiresAt!).getTime() > Date.now())
  );

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isPremium,
        isLoading,
        login,
        logout,
        checkTokenValidity,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
