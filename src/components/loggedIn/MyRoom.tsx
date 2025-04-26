import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { LuSend, LuX } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import apiClient from "../loggedOut/apiClient";

interface MyRoomProps {
  title?: string;
  desc?: string;
  groupId?: number;
  onClose?: () => void;
}

interface LocationState {
  title?: string;
  desc?: string;
  groupId?: string;
  adminId?: string;
  adminName?: string;
  memberCount?: number;
  groupType?: string;
}

interface Bot {
  botId: number;
  botName: string;
  accessType: number;
}

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
  padding: 20px;
  box-sizing: border-box;
`;

const RenderedChatContainer = styled.div`
  width: 100%;
  height: 73vh;
  border: solid red;
  color: black;
`;

const SendMessageContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 1vh;
  height: 10vh;
  position: relative;
`;

const MessageInput = styled.input`
  background-color: white;
  width: 78%;
  height: 100%;
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  color: black;
  padding: 0 1rem;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #016532;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-left: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const BotIcon = styled.img`
  width: 2rem;
  height: 2rem;
  margin-left: 4vw;
  margin-right: 2vw;
  cursor: pointer;
`;

const SendIcon = styled(LuSend)`
  font-size: 2rem;
  cursor: pointer;
`;

const PopupContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 78%;
  width: 250px;
  max-height: 300px;
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #d3d3d3;
  position: sticky;
  top: 0;
  background: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;

  &:hover {
    background: #f5f5f5;
    border-radius: 50%;
  }
`;

const BotList = styled.div`
  display: flex;
  flex-direction: column;
`;

const BotItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const BotName = styled.span`
  font-size: 14px;
`;

const AccessType = styled.span`
  font-size: 12px;
  color: #666;
`;

const BotListPopUp: React.FC<MyRoomProps> = ({ onClose, groupId }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/v1/group/get_group_chat_bot_list?groupId=${groupId}`
        );
        if (response.data.code === 200) {
          setBots(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching bots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [groupId]);

  return (
    <PopupContainer>
      <PopupHeader>
        <HeaderContent>
          <span>Available Bots</span>
          {isLoading && <LoadingSpinner />}
        </HeaderContent>
        <CloseButton onClick={onClose}>
          <LuX />
        </CloseButton>
      </PopupHeader>
      <BotList>
        {bots.map((bot) => (
          <BotItem key={bot.botId}>
            <BotName>{bot.botName}</BotName>
            <AccessType>
              ({bot.accessType === 0 ? "Admin Only" : "Public Access"})
            </AccessType>
          </BotItem>
        ))}
      </BotList>
    </PopupContainer>
  );
};

const MyRoom: React.FC<MyRoomProps> = ({
  title: propTitle = "Default Title",
  desc: propDesc = "No description available.",
  groupId,
}) => {
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [isBotClicked, setIsBotClicked] = useState(false);

  const title = state?.title || propTitle;
  const desc = state?.desc || propDesc;

  useEffect(() => {
    console.log(title, desc);
  });
  return (
    <Container>
      <RenderedChatContainer>render chats</RenderedChatContainer>
      <SendMessageContainer>
        <MessageInput placeholder="Type your message..." />
        <BotIcon
          src={botIcon}
          alt="Bot Icon"
          onClick={() => setIsBotClicked(!isBotClicked)}
        />
        {isBotClicked && (
          <BotListPopUp
            onClose={() => setIsBotClicked(false)}
            groupId={groupId}
          />
        )}
        <SendIcon />
      </SendMessageContainer>
    </Container>
  );
};

export default MyRoom;
