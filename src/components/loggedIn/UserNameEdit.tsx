import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '../ui/Button';
import { useUserInfo, useUpdateUserInfo } from '../../hooks/queries/useUser';
import { Input as SharedInput } from '../ui/SharedComponents';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { userInfo, refreshUserInfo } = useUserInfo();
  const [username, setUsername] = useState(userInfo?.userName || '');
  const [error, setError] = useState('');
  const updateUserInfoMutation = useUpdateUserInfo();

  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return t('userProfile.usernameEmpty');
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return t('userProfile.usernameInvalid');
    }
    if (value.length > 20) {
      return t('userProfile.usernameTooLong');
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
      setError(t('userProfile.userInfoIncomplete'));
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
      
      // 显示成功消息
      alert(t('userProfile.usernameUpdated'));
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to update username:', error);
      setError(error.message || t('userProfile.updateUsernameFailed'));
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label={t('common.close')}>
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>{t('userProfile.accountSetting')}</HeaderTitle>
          <HeaderSubTitle>{t('userProfile.accountSettingSubtitle')}</HeaderSubTitle>
        </HeaderSection>

        {/* Username 字段 */}
        <InputLabel>{t('userProfile.usernameLabel')}</InputLabel>
        <InputWrapper>
          <SharedInput
            value={username}
            onChange={handleUsernameChange}
            placeholder={t('userProfile.usernamePlaceholder')}
            disabled={updateUserInfoMutation.isPending}
            $hasError={!!error}
          />
          <ErrorText $visible={!!error}>{error || " "}</ErrorText>
        </InputWrapper>
        

        {/* 底部按钮：居中 */}
        <ButtonContainer>
          <FixedButtonContainer>
            <Button variant="cancel" onClick={onClose} disabled={updateUserInfoMutation.isPending}>
              {t('common.cancel')}
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button onClick={handleUpdateUsername} $isLoading={updateUserInfoMutation.isPending} disabled={updateUserInfoMutation.isPending}>
              {updateUserInfoMutation.isPending ? t('userProfile.processing') : t('common.submit')}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default UserNameEdit;
