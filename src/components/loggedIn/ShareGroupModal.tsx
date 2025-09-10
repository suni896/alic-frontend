import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoClose, IoCopy, IoCheckmark } from 'react-icons/io5';
import { MdLock, MdPublic } from 'react-icons/md';
import apiClient from '../loggedOut/apiClient';

interface ShareGroupModalProps {
  groupId: number;
  onClose: () => void;
}

interface GroupInfo {
  groupId: number;
  groupName: string;
  groupDescription: string;
  isPrivate: boolean;
  hasPassword: boolean;
}

interface InviteResponse {
  generateLink: string;
  expireAt: number; // 改为 number 类型，表示时间戳
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const GroupInfoSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const GroupName = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GroupDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const InviteSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1rem;
`;

const InviteUrlContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const InviteUrlInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #f8f9fa;
  color: #333;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  padding: 12px 16px;
  background: ${props => props.$copied ? '#28a745' : '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.$copied ? '#218838' : '#0056b3'};
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #016532;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 12px;
  
  &:hover {
    background: #014a26;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 8px 0;
  line-height: 1.4;
`;

const ErrorText = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin: 8px 0;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 8px 0;
  text-align: center;
`;

const ShareGroupModal: React.FC<ShareGroupModalProps> = ({ groupId, onClose }) => {
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchGroupInfo();
  }, [groupId]);

  const fetchGroupInfo = async () => {
    try {
      const response = await apiClient.get(`/v1/group/get_group_info?groupId=${groupId}`);
      if (response.data.code === 200) {
        const data = response.data.data;
        setGroupInfo({
          groupId: data.groupId,
          groupName: data.groupName,
          groupDescription: data.groupDescription || '暂无描述',
          isPrivate: data.isPrivate || false,
          hasPassword: data.hasPassword || false
        });
      }
    } catch (error) {
      console.error('获取群组信息失败:', error);
      setError('获取群组信息失败');
    }
  };

  const generateInviteLink = async () => {
    setGenerating(true);
    setError('');
    
    try {
      const response = await apiClient.post('/v1/group/generate_invite_link', {
        groupId: groupId
      });
      
      if (response.data.code === 200) {
        const generateLink = response.data.data.generateLink;
        const expireAt = response.data.data.expireAt;
        // 确保邀请链接格式正确
        const baseUrl = window.location.origin;
        const fullInviteUrl = generateLink.startsWith('http') 
          ? generateLink 
          : `${baseUrl}${generateLink}`;
        
        setInviteData({
          generateLink: fullInviteUrl,
          expireAt: expireAt // 直接使用时间戳
        });
      } else {
        setError(response.data.message || '生成邀请链接失败');
      }
    } catch (error: any) {
      console.error('生成邀请链接失败:', error);
      setError(error.response?.data?.message || '生成邀请链接失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteData?.generateLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteData.generateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = inviteData.generateLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

return (
  <Overlay onClick={handleOverlayClick}>
    <Modal>
      <Header>
        <Title>Share Group</Title>
        <CloseButton onClick={onClose}>
          <IoClose />
        </CloseButton>
      </Header>

      {groupInfo && (
        <GroupInfoSection>
          <GroupName>
            {groupInfo.isPrivate ? <MdLock /> : <MdPublic />}
            {groupInfo.groupName}
          </GroupName>
          <GroupDescription>{groupInfo.groupDescription}</GroupDescription>
        </GroupInfoSection>
      )}

      <InviteSection>
        <SectionTitle>Invite Link</SectionTitle>
        
        {!inviteData ? (
          <>
            <GenerateButton 
              onClick={generateInviteLink} 
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Invite Link'}
            </GenerateButton>
            <InfoText>
              After generating an invite link, other users can join the group through this link.
              {groupInfo?.isPrivate && 'Private groups require admin approval.'}
            </InfoText>
          </>
        ) : (
          <>
            <InviteUrlContainer>
              <InviteUrlInput 
                value={inviteData.generateLink} 
                readOnly 
              />
              <CopyButton onClick={copyToClipboard} $copied={copied}>
                {copied ? (
                  <>
                    <IoCheckmark /> Copied
                  </>
                ) : (
                  <>
                    <IoCopy /> Copy
                  </>
                )}
              </CopyButton>
            </InviteUrlContainer>
            <InfoText>
              Link valid until: {new Date(inviteData.expireAt).toLocaleString('en-US')}
              <br />
              Share this link to invite others to join the group
            </InfoText>
            <GenerateButton onClick={generateInviteLink} disabled={generating}>
              {generating ? 'Generating...' : 'Regenerate Link'}
            </GenerateButton>
          </>
        )}
        
        {generating && <LoadingText>Generating invite link...</LoadingText>}
        {error && <ErrorText>{error}</ErrorText>}
      </InviteSection>
    </Modal>
  </Overlay>
);
};

export default ShareGroupModal;