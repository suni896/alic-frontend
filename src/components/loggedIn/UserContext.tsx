import React, { createContext, useContext } from "react";
import { useUserInfo } from "../../hooks/queries/useUser";

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, isLoading, error, refetch } = useUserInfo();

  const userInfo = data?.code === 200 ? data.data : null;
  const userInfoError = error?.message || (data?.code !== 200 ? data?.message || null : null);

  const refreshUserInfo = async () => {
    await refetch();
  };

  const value = {
    userInfo,
    isUserInfoLoading: isLoading,
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
