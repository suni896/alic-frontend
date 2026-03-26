import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo, updateUserInfo, logout, type UpdateUserInfoRequest, type UserInformation } from '../../api/user.api';

// Query: Get current user info
// Returns processed user data for direct consumption
export function useUserInfo() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getUserInfo,
  });

  const userInfo: UserInformation | null = data?.code === 200 ? data.data : null;
  const userInfoError = error?.message || (data?.code !== 200 ? data?.message || null : null);

  const refreshUserInfo = async () => {
    await refetch();
  };

  return {
    userInfo,
    isUserInfoLoading: isLoading,
    userInfoError,
    refreshUserInfo,
  };
}

// Mutation: Update user info
export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => updateUserInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Mutation: Logout
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
