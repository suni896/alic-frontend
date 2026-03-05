import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo, updateUserInfo, type UpdateUserInfoRequest } from '../../api/user.api';

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
