import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiUser } from 'react-icons/fi';
import LabeledInputWithCount from '../Input';
import Button from '../button';
import { useUser } from './UserContext';
import apiClient from '../loggedOut/apiClient';
import ModalHeader from '../Header';

const Overlay = styled.div`
  position: fixed;
  top: 7vh;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  position: absolute;
  top: 70px;
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2.5rem;
  width: 28%;
  max-width: 480px;
  min-width: 320px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 1200px) {
    width: 35%;
  }
  @media (max-width: 1000px) {
    width: 45%;
  }
  @media (max-width: 700px) {
    width: 55%;
    padding: 2rem;
  }
  @media (max-width: 500px) {
    width: 70%;
    padding: 1.5rem;
  }
  @media (max-width: 400px) {
    width: 85%;
    padding: 1.25rem;
  }
`;

const UserIcon = styled(FiUser)`
  color: #white;
  font-size: 1.5rem;
`;

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
  display: block;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: center;
  height: 40px;
  
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
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

const SuccessMessage = styled.div`
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <ModalHeader icon={UserIcon} title="Edit Username" onClose={onClose} />
        <InputContainer>
          <InputLabel>Username</InputLabel>
          <LabeledInputWithCount
            value={username}
            onChange={handleUsernameChange}
            onKeyPress={handleKeyPress}
            error={error}
            maxLength={20}
            placeholder="Enter username"
            type="text"
            disabled={isLoading}
          />
        </InputContainer>
        
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <ButtonContainer>
          <Button variant="cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUsername} disabled={isLoading || !username.trim()}>
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default UserNameEdit;