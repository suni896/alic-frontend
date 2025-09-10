import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MdGroup, MdError } from 'react-icons/md';
import Layout from '../components/loggedOut/Layout';
import apiClient from '../components/loggedOut/apiClient';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #016532 0%, #02a043 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Icon = styled.div<{ $type: 'loading' | 'success' | 'error' | 'group' }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 2.5rem;
  
  ${props => {
    switch (props.$type) {
      case 'loading':
        return `
          background: #f8f9fa;
          color: #6c757d;
          animation: pulse 1.5s ease-in-out infinite;
        `;
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      case 'group':
        return `
          background: #e8f5e8;
          color: #016532;
        `;
      default:
        return '';
    }
  }}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.8rem;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const Description = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;


const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 8px;
  
  ${props => props.$variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  ` : `
    background: #016532;
    color: white;
    
    &:hover {
      background: #014a26;
    }
  `}
  
  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const JoinGroupPage: React.FC = () => {
  const { groupId, inviteCode } = useParams<{ groupId: string; inviteCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (groupId && inviteCode) {
      // 直接尝试加入群组，不需要预览
      handleJoinGroup();
    } else {
      setError('无效的邀请链接');
    }
  }, [groupId, inviteCode]);

  const handleJoinGroup = async () => {
    setJoining(true);
    setError('');
    
    try {
      const payload: any = {
        groupId: parseInt(groupId!),
        joinGroupToken: inviteCode
      };
      
      
      const response = await apiClient.post('/v1/group/add_group_member_by_link', payload);
      
      if (response.data.code === 200 || response.data.code === 1009) {
        
          setTimeout(() => {
            navigate(`/my-room/${groupId}`);
          }, 3000);
        
      } else {
        const errorMsg = response.data.message || '加入群组失败';
        
        // 根据错误码提供更具体的错误信息
        let specificError = errorMsg;
        if (response.data.code === 1001) {
          specificError = 'link is invaild';
        } else if (response.data.code === 1011) {
          specificError = 'group member limit exceeded';
        }
        
        setError(specificError);
      }
    } catch (error: any) {
      console.error('加入群组失败:', error);
      let errorMsg = '网络连接失败，请检查网络后重试';
      
      if (error.response?.status === 500) {
        errorMsg = '服务器错误，请稍后重试';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  const handleGoHome = () => {
    navigate('/search-rooms');
  };

  if (error) {
    return (
      <Layout>
        <Container>
          <Card>
            <Icon $type="error">
              <MdError />
            </Icon>
            <Title>无法加入群组</Title>
            <Description>{error}</Description>
            <Button $variant="secondary" onClick={handleGoHome}>返回首页</Button>
          </Card>
        </Container>
      </Layout>
    );
  }

  // 如果正在加入中，显示加载状态
  if (joining) {
    return (
      <Layout>
        <Container>
          <Card>
            <Icon $type="loading">
              <MdGroup />
            </Icon>
            <Title>正在加入群组...</Title>
            <Description>请稍候，正在处理您的加入请求</Description>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Card>
          <Icon $type="group">
            <MdGroup />
          </Icon>
          <Title>加入群组</Title>
          <Description>正在处理您的群组邀请，请稍候...</Description>
        </Card>
      </Container>
    </Layout>
  );
};

export default JoinGroupPage;