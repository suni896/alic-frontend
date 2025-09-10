import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const LoadingCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #666;
  margin-top: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const groupId = searchParams.get('groupId');
    const token = searchParams.get('token');

    if (groupId && token) {
      // 使用groupId和token重定向到加入群组页面
      navigate(`/join/${groupId}/${token}`, { replace: true });
    } else {
      // 如果参数不完整，重定向到首页
      navigate('/', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <Container>
      <LoadingCard>
        <Spinner />
        <LoadingText>正在处理邀请链接...</LoadingText>
      </LoadingCard>
    </Container>
  );
};

export default RedirectHandler;