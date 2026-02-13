import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiUser } from 'react-icons/fi';
import LabeledInputWithCount from '../Input';
import Button from '../button';
import { useUser } from './UserContext';
import apiClient from '../loggedOut/apiClient';
import { Input as SharedInput } from '../SharedComponents';

const Overlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--overlay-dark-60);   /* 使用令牌 */
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// 弹窗容器
const Modal = styled.div`
  position: absolute;
  top: 70px;
  background: var(--white);
  border: none;
  border-radius: var(--radius-12);
  padding: var(--space-7);      /* 2rem */
  width: 751px;                 /* 固定宽度 */
  min-height: 24rem;            /* 近似 h-96 */
  box-shadow: 0 25px 50px -12px var(--shadow-25);
`;

// 顶部标题区域（不使用 ModalHeader）
const HeaderTitle = styled.div`
  color: var(--gray-900);
  font-size: var(--space-8);         /* text-lg */
  font-weight: var(--weight-bold);
  font-family: var(--font-urbanist);
  line-height: 1.75rem;
`;

const HeaderSubTitle = styled.div`
  color: var(--muted-6b7280);
  font-size: var(--space-10);        /* text-sm */
  font-weight: var(--weight-medium);
  font-family: var(--font-urbanist);
  line-height: var(--space-6);
`;

// 字段标签
const InputLabel = styled.label`
  display: block;
  font-family: var(--font-roboto);
  font-weight: var(--weight-medium);
  font-size: var(--space-10);
  color: var(--slate-grey);
  margin-bottom: var(--space-3);
`;

// 输入容器（浅灰背景 + 圆角 + 固定高度）
const FieldBox = styled.div`
  height: 3.5rem;                        /* h-14 */
  padding: var(--space-5);               /* p-4 */
  background: var(--input-bg);           /* bg-neutral-50 */
  border-radius: var(--radius-12);       /* rounded-lg */
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
`;

// 底部按钮区域右对齐
const ButtonContainer = styled.div`
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  justify-content: flex-end;
  height: var(--space-12);               /* 3rem 近似 */
`;

// 成功提示（令牌）
const SuccessMessage = styled.div`
  color: var(--emerald-green);
  font-size: var(--space-10);
  margin-top: var(--space-3);
`;

const UserIcon = styled(FiUser)`
  color: #white;
  font-size: 1.5rem;
`;

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;



const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;



interface UserNameEditProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserNameEdit: React.FC<UserNameEditProps> = ({ onClose, onSuccess }) => {
  const { userInfo, refreshUserInfo } = useUser();
  const [username, setUsername] = useState(userInfo?.userName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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
    setSuccess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUpdateUsername();
    }
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

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/v1/user/edit_user_info', {
        userName: username.trim(),
        userId: userInfo.userId
      });
      
      // 刷新用户信息
      await refreshUserInfo();
      
      setSuccess('Username updated successfully!');
      
      // 延迟关闭弹窗，让用户看到成功消息
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update username:', error);
      setError(error.response?.data?.message || 'Failed to update username, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Overlay>
      <Modal ref={modalRef}>
        {/* 顶部标题（不再使用 ModalHeader） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
          <HeaderTitle>Account Setting</HeaderTitle>
          <HeaderSubTitle>View and update your account details, profile, and more.</HeaderSubTitle>
        </div>

        {/* Username 字段 */}
        <InputLabel>Username</InputLabel>
        <FieldBox>
          <SharedInput
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter username"
            disabled={isLoading}
            $hasError={!!error}
          />
        </FieldBox>

        {/* 成功/错误提示 */}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {error && <div style={{ color: 'var(--error-red)', fontSize: 'var(--space-10)', marginTop: '0.5rem' }}>{error}</div>}

        {/* 底部按钮：右对齐 */}
        <ButtonContainer>
          <Button variant="cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUsername} $isLoading={isLoading} disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default UserNameEdit;