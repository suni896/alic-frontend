import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserInfo, type UpdateUserInfoRequest } from '../../api/user.api';

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => updateUserInfo(data),
    onSuccess: () => {
      // Invalidate user info to refresh
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
