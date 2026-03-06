import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '../ui/Button';
import { useUserInfo, useUpdateUserInfo } from '../../hooks/queries/useUser';
import { Input as SharedInput } from '../ui/SharedComponents';
import {
  ModalBackdrop,
  ModalContainer,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  InputLabel,
  InputWrapper,
  ButtonContainer,
  FixedButtonContainer,
  ErrorText,
} from '../ui/SharedComponents';


interface UserNameEditProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserNameEdit: React.FC<UserNameEditProps> = ({ onClose, onSuccess }) => {
  const { userInfo, refreshUserInfo } = useUserInfo();
  const [username, setUsername] = useState(userInfo?.userName || '');
  const [error, setError] = useState('');
  const updateUserInfoMutation = useUpdateUserInfo();

  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return 'Username cannot be empty';
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return 'Username can only contain letters and numbers';
    }
    if (value.length > 20) {
      return 'Username cannot exceed 20 characters';
    }
    return '';
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setError('');
  };

  const handleUpdateUsername = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!userInfo?.userId) {
      setError('User information incomplete, please log in again');
      return;
    }

    setError('');

    try {
      await updateUserInfoMutation.mutateAsync({
        userName: username.trim(),
        userId: userInfo.userId
      });
      
      // 刷新用户信息
      await refreshUserInfo();
      
      // 延迟关闭弹窗，让用户看到成功消息
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update username:', error);
      setError(error.message || 'Failed to update username, please try again later');
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>Account Setting</HeaderTitle>
          <HeaderSubTitle>View and update your account details.</HeaderSubTitle>
        </HeaderSection>

        {/* Username 字段 */}
        <InputLabel>Username</InputLabel>
        <InputWrapper>
          <SharedInput
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter username"
            disabled={updateUserInfoMutation.isPending}
            $hasError={!!error}
          />
          <ErrorText $visible={!!error}>{error || " "}</ErrorText>
        </InputWrapper>
        

        {/* 底部按钮：居中 */}
        <ButtonContainer>
          <FixedButtonContainer>
            <Button variant="cancel" onClick={onClose} disabled={updateUserInfoMutation.isPending}>
              Cancel
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button onClick={handleUpdateUsername} $isLoading={updateUserInfoMutation.isPending} disabled={updateUserInfoMutation.isPending}>
              {updateUserInfoMutation.isPending ? "Processing..." : "Submit"}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default UserNameEdit;
