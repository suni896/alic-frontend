import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import ETHERPAD_CONFIG from '../../utils/etherpadConfig';
import { useUser } from './UserContext';

interface EtherpadProps {
  roomId?: number;
  width?: string;
  height?: string;
  showControls?: boolean;
}

const EtherpadContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: white;
`;

const EtherpadIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const EtherpadComponent: React.FC<EtherpadProps> = ({
  roomId,
  width = '100%',
  height = '100%',
  showControls = true,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { userInfo } = useUser();

  // 生成 Pad ID
  const padId = roomId ? `${ETHERPAD_CONFIG.PAD_PREFIX}${roomId}` : 'shared-notes';

  // 生成 Etherpad URL
  const generateEtherpadUrl = () => {
    const baseUrl = ETHERPAD_CONFIG.SERVER_URL;
    const userName = userInfo?.userName || ETHERPAD_CONFIG.DEFAULT_SETTINGS.userName;
    
    // 构建 URL 参数
    const params = new URLSearchParams({
      showControls: String(showControls),
      showChat: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.showChat),
      showLineNumbers: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.showLineNumbers),
      useMonospaceFont: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.useMonospaceFont),
      userName: userName,
      lang: ETHERPAD_CONFIG.DEFAULT_SETTINGS.lang,
    });

    // 移除对 userColor 的引用，因为 UserInformation 类型中没有这个属性
    // 可以使用默认颜色
    if (ETHERPAD_CONFIG.DEFAULT_SETTINGS.userColor) {
      params.append('userColor', ETHERPAD_CONFIG.DEFAULT_SETTINGS.userColor);
    }

    return `${baseUrl}/p/${padId}?${params.toString()}`;
  };

  // 处理 iframe 加载完成事件
  const handleIframeLoad = () => {
    console.log('Etherpad iframe loaded successfully');
  };

  return (
    <EtherpadContainer style={{ width, height }}>
      <EtherpadIframe
        ref={iframeRef}
        src={generateEtherpadUrl()}
        title="Etherpad Collaborative Editor"
        allow="fullscreen"
        onLoad={handleIframeLoad}
      />
    </EtherpadContainer>
  );
};

export default EtherpadComponent; 