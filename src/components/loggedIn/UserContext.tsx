import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../loggedOut/apiClient";

interface UserInformation {
  userId: number;
  userEmail: string;
  userName: string;
  userPortrait: string;
}

interface UserContextType {
  userInfo: UserInformation | null;
  isUserInfoLoading: boolean;
  userInfoError: string | null;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// In-memory cache for user info
let userInfoCache: UserInformation | null = null;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfo] = useState<UserInformation | null>(null);
  const [isUserInfoLoading, setIsLoading] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  const fetchUserInformation = async () => {
    // Check if user info is already cached
    if (userInfoCache) {
      setUserInfo(userInfoCache);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get("/v1/user/get_user_info");

      if (response.data.code === 200) {
        setUserInfo(response.data.data);
        userInfoCache = response.data.data; // Cache the user info
        setUserInfoError(null);
      } else {
        setUserInfoError(response.data.message || "Failed to fetch user info");
      }
    } catch (err) {
      userInfoCache = null;
      setUserInfoError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInformation();
  }, []);

  const refreshUserInfo = async () => {
    userInfoCache = null;
    await fetchUserInformation();
  };

  const value = {
    userInfo,
    isUserInfoLoading,
    userInfoError,
    refreshUserInfo,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
