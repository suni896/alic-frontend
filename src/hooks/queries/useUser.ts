import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo, updateUserInfo, logout, type UpdateUserInfoRequest } from '../../api/user.api';

// Query: Get current user info
export function useUserInfo() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUserInfo,
  });
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
