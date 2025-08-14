import React, { useRef } from 'react';
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

  // Generate Pad ID
  const padId = roomId ? `${ETHERPAD_CONFIG.PAD_PREFIX}${roomId}` : 'shared-notes';

  // Generate Etherpad URL
  const generateEtherpadUrl = () => {
    const baseUrl = ETHERPAD_CONFIG.SERVER_URL;
    const userName = userInfo?.userName || ETHERPAD_CONFIG.DEFAULT_SETTINGS.userName;
    
    // Build URL parameters
    const params = new URLSearchParams({
      showControls: String(showControls),
      showChat: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.showChat),
      showLineNumbers: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.showLineNumbers),
      useMonospaceFont: String(ETHERPAD_CONFIG.DEFAULT_SETTINGS.useMonospaceFont),
      userName: userName,
      lang: ETHERPAD_CONFIG.DEFAULT_SETTINGS.lang,
    });

    // Remove userColor reference as it's not in UserInformation type
    // Use default color instead
    if (ETHERPAD_CONFIG.DEFAULT_SETTINGS.userColor) {
      params.append('userColor', ETHERPAD_CONFIG.DEFAULT_SETTINGS.userColor);
    }

    return `${baseUrl}/p/${padId}?${params.toString()}`;
  };

  // Handle iframe load completion event
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