import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTag, type CreateTagRequest } from '../../api/tag.api';

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTagRequest) => createTag(data),
    onSuccess: () => {
      // Invalidate tags list to refresh
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
