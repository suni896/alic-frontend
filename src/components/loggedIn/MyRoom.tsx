import React, { useState, useEffect, useRef, useCallback } from "react";
import { membersCache } from "./RoomMembersComponent";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled, { createGlobalStyle } from "styled-components";
import { LuSend, LuX, LuReply, LuCopy, LuRotateCcw } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useInputTracking } from "../../hooks/useInputTracking";
import sensors, { eventQueue, flushEvents } from "../../utils/tracker";
import { EtherpadDrawerWithButton } from "./EtherpadDrawer";
import { API_BASE_URL } from "../../../config";


// 添加清除历史接口响应类型
interface ClearHistoryResponse {
  code: number;
  message: string;
  data: string[]; // 时间戳数组
}

interface MyRoomProps {
  title?: string;
  desc?: string;
  groupId?: number;
  onClose?: () => void;
  onBotSelect?: (botName: string, botId: number) => void;
}

interface Bot {
  botId: number;
  botName: string;
  accessType: number;
}

interface User {
  userId: number;
  userName: string;
  userPortrait: string;
  userEmail: string;
}

// 更新Message接口，添加回复相关字段
interface Message {
  infoId: number;
  groupId: number;
  senderId: number;
  content: string;
  msgType: number;
  createTime: string;
  senderType: string;
  name: string;
  portrait: string;
  replyToMsgId?: number; // 被回复消息的ID
  replyToMessage?: Message; // 被回复的消息对象
  needsFetchReply?: boolean; // 是否需要获取被回复消息
  replyLoading?: boolean; // 被回复消息是否正在加载
}

// 全局样式
const GlobalStyle = createGlobalStyle`
  .highlight-message {
    background-color:rgba(205, 255, 219, 0.24) !important;
    border: 1px solid #016532 !important;
    animation: pulse 0.5s ease-in-out;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
`;

// 样式组件
const Container = styled.div`
  background: white;
  width: 100%;
  padding-top: 20px;
  padding-left: 30px;
  padding-right: 20px;
  box-sizing: border-box;
  position: fixed;
  height: calc(100vh - 7vh);
`;

const RenderedChatContainer = styled.div`
  width: calc(100% - 40px);
  height: calc(100vh - 7vh - 20px - 11rem - 1vh);
  overflow-y: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// 消息容器 - 支持悬浮显示功能按钮
const MessageContainer = styled.div<{ $isOwnMessage: boolean }>`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: ${(props) => (props.$isOwnMessage ? "#dcf8c6" : "white")};
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:hover .message-actions {
    opacity: 1;
    visibility: visible;
  }
`;

// 消息操作按钮容器
const MessageActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 操作按钮
const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// 回复预览容器
const ReplyPreview = styled.div`
  background: #f8f9fa;
  border-left: 3px solid #016532;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  // transition: all 0.2s ease-in-out;
  
  &:hover {
    background: #e8f5e8;
    border-left-color: #014a28;
  }
`;

const ReplyHeader = styled.div`
  font-weight: 600;
  color: #016532;
  margin-bottom: 4px;
  font-size: 0.8rem;
`;

const ReplyContent = styled.div`
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

// 回复输入框容器
const ReplyInputContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f0f9f0;
  padding: 0px 12px;
  border-radius: 6px;
  border-left: 3px solid #016532;
  height: 2.3rem;
`;

// 复制成功提示组件
const CopySuccessToast = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 60px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  font-size: 14px;
  font-weight: 500;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$show ? '0' : '-20px'});
  transition: all 0.3s ease-in-out;
`;

// 清除上下文成功提示样式
const ClearContextToast = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 8vh;
  left: 50%;
  background-color: #ff9800;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  font-size: 14px;
  font-weight: 500;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$show ? '0' : '-20px'});
  transition: all 0.3s ease-in-out;
`;

// 清除上下文图标样式
const ClearContextIcon = styled(LuRotateCcw)`
  font-size: 1.6rem;
  cursor: pointer;
  display: block;
  color: #333;
`;

// 上下文清除提示消息样式
const ContextClearedMessage = styled.div`
  text-align: center;
  padding: 8px 16px;
  margin: 8px 0;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 0.85rem;
  font-style: italic;
`;

const ReplyInputText = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: #333;
`;

const CancelReplyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a202c;
  margin-bottom: 0.25rem;
  line-height: 1.2;
`;

const MessageText = styled.div`
  word-break: break-word;
  font-size: 0.85rem;
  color: #333;
`;

const TimeStamp = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
  line-height: 1;
`;

const SendMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 11rem;
  margin-top: 1vh;
  position: relative;
`;

const MessageInputWrapper = styled.div<{ $disabled?: boolean }>`
  border: 0.5px solid;
  border-radius: 8px;
  width: 98%;
  position: relative;
  
  border-color: ${(props) => (props.$disabled ? "#ccc" : "#d3d3d3")};
  background-color: ${(props) => (props.$disabled ? "#f5f5f5" : "white")};
  padding: 0.5rem 1rem 0.5rem 1rem;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${(props) => (props.$disabled ? "#ccc" : "transparent")};
    outline: ${(props) => (props.$disabled ? 'none' : '2px solid #016532')};
  }
`;

const MessageInput = styled.textarea<{ $disabled?: boolean; $isReplying?: boolean }>`
  background-color: transparent;
  width: 100%;
  min-height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  max-height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  resize: none;
  overflow-y: auto;
  border: none;
  // border-radius: 8px;
  color: ${(props) => (props.$disabled ? "#999" : "black")};
  padding: 0;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "text")};
  font-size: 0.85rem;
  line-height: 1.5;
  box-sizing: border-box;
  font-family: inherit;
  // transition: all 0.2s ease-in-out;
 
  &:focus {
    outline: none;
  } 
 
  &::placeholder {
    color: ${(props) => (props.$disabled ? "#ccc" : "#999")};
    opacity: 1;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;

  @media (max-width: 1000px) {
    width: 30px;
    height: 30px;
  }
  @media (max-width: 700px) {
    margin-right: 5px;
  }
  @media (max-width: 400px) {
    width: 23px;
    height: 23px;
  }
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #016532;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-left: 8px;
  transition: opacity 0.3s ease-in-out;

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
  color: #333;
  
`;

const NewMessageNotification = styled.div`
  position: absolute;
  right: 20px;
  bottom: 11rem + 1vh + 6px;
  background-color: #016532;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
`;

// 连接状态提示组件
const ConnectionStatus = styled.div<{ $status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' }>`
  position: fixed;
  top: 8vh;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease-in-out;

  ${props => {
    switch (props.$status) {
      case 'connected':
        return 'background-color: #4caf50; color: white; opacity: 0; visibility: hidden;';
      case 'connecting':
        return 'background-color: #2196f3; color: white;';
      case 'disconnected':
        return 'background-color: #f44336; color: white;';
      case 'reconnecting':
        return 'background-color: #ff9800; color: white;';
      default:
        return 'background-color: #9e9e9e; color: white;';
    }
  }}
`;

const StatusDot = styled.span<{ $status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;

  ${props => props.$status === 'connecting' || props.$status === 'reconnecting' ? `
    animation: pulse-dot 1.5s ease-in-out infinite;
  ` : ''}

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  margin: 0 0.2em;
  
  &:hover {
    background-color: #cccccc;
  }
`;

const BotIcon = styled.img`
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
  display: block;
`;

const SendIcon = styled(LuSend)`
  font-size: 1.6rem;
  cursor: pointer;
  display: block;
  color: #333;
`;

const IconContainer = styled.div`
  display: flex;
  height: 2rem;
  align-items: center;
  margin-bottom: 0.4em;
  gap: 0.2em;
  padding: 0.2em 0.4em;
  border-radius: 20px;
`;

const PopupContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 60px;
  transform: translateX(-25%);
  width: 250px;
  max-height: 300px;
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  margin-bottom: 5px;
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
  color: #333;

  &:hover {
    background: #f5f5f5;
    border-radius: 50%;
  }
`;

const BotList = styled.div`
  display: flex;
  flex-direction: column;
  color: #333;
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

// Bot列表弹窗组件
const BotListPopUp: React.FC<MyRoomProps> = ({
  onClose,
  onBotSelect,
  groupId,
}) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  // const [groupMode, setGroupMode] = useState<'free' | 'feedback' | undefined>('free');

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

    const checkIfAdmin = (): boolean => {
      if (!groupId || !userInfo?.userId) return false;
      try {
        const members = membersCache.get(Number(groupId));
        return (
          members?.some(
            (m) => m.userId === userInfo.userId && m.groupMemberType === "ADMIN"
          ) ?? false
        );
      } catch (error) {
        console.error("Error accessing membersCache:", error);
        return false;
      }
    };

    setIsAdmin(checkIfAdmin());
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
          <BotItem
            key={bot.botId}
            onClick={() => {
              if (bot.accessType === 0 && !isAdmin) {
                alert("Only admins can mention this bot");
                return;
              }
              onClose?.();
              onBotSelect?.(bot.botName, bot.botId);
            }}
          >
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

// 缓存
const botsCache = new Map<number, Bot>();
const clientCache = new Map<number, Stomp.Client | null>();
const usersCache = new Map<number, User>();

// 主组件
const MyRoom: React.FC<MyRoomProps> = ({ groupId }) => {
  // 状态管理
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // const isInitialMount = useRef(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [isBotClicked, setIsBotClicked] = useState(false);

  // 回复功能状态
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [showClearContextToast, setShowClearContextToast] = useState(false);
  const [contextClearedTimes, setContextClearedTimes] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupMode, setGroupMode] = useState<'free' | 'feedback'>('free');

  // 获取上下文清除历史记录
  const fetchClearHistory = useCallback(async (groupId: number) => {
    try {
      const url = `/v1/group/clearHistory?groupId=${groupId}`;
      const response = await apiClient.get<ClearHistoryResponse>(url);

      if (
        response.status === 200 &&
        response.data.code === 200 &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // 保存所有清除时间
        setContextClearedTimes(response.data.data);
      } else {
        setContextClearedTimes([]);
      }
    } catch (error) {
      console.error('Failed to fetch clear history:', error);
      setContextClearedTimes([]);
    }
  }, []);

    // 使用埋点Hook - 已更新埋点规则（包含输入法组合事件处理）
  const { handleTyping, handleSend: trackSend, handleMessageReceived, handleCompositionStart, handleCompositionEnd } = useInputTracking(groupId);
  // 连接状态管理
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // 检查用户是否为管理员
  const checkIfAdmin = useCallback((): boolean => {
    if (!groupId || !userInfo?.userId) return false;
    try {
      const members = membersCache.get(Number(groupId));
      return (
        members?.some(
          (m) => m.userId === userInfo.userId && m.groupMemberType === "ADMIN"
        ) ?? false
      );
    } catch (error) {
      console.error("Error accessing membersCache:", error);
      return false;
    }
  }, [groupId, userInfo?.userId]);

  // 更新管理员状态
  useEffect(() => {
    setIsAdmin(checkIfAdmin());
  }, [checkIfAdmin]);

  useEffect(() => {
    const fetchGroupMode = async () => {
      if (!groupId) return;
      try {
        const url = `/v1/group/get_group_info?groupId=${groupId}`;
        const response = await apiClient.get(url);
        if (response.status === 200 && response.data?.code === 200 && response.data?.data) {
          const data = response.data.data;
          const isFeedback = data.groupMode;
          setGroupMode(isFeedback);
        } else {
          setGroupMode('free');
        }
      } catch (error) {
        console.error('Failed to fetch group mode:', error);
        setGroupMode('free');
      }
    };
    fetchGroupMode();
  }, [groupId]);

  // 在组件初始化时获取清除历史
  useEffect(() => {
    if (groupId) {
      fetchClearHistory(groupId);
    }
  }, [groupId, fetchClearHistory]);

  // 回复功能处理函数
  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };



  // 跳转到指定消息
  const scrollToMessage = (messageId: number) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement && chatContainerRef.current) {
      // 高亮显示目标消息
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // 添加临时高亮效果
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    } else {
      // 消息未加载，显示提示
      console.log('消息未加载，无法跳转');
      // 可以添加用户提示，比如显示toast
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess('复制成功');
      // 2秒后自动隐藏提示
      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    }).catch(err => {
      console.error('复制失败:', err);
      setCopySuccess('复制失败');
      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    });
  };

  // 清除AI上下文函数
  const handleClearContext = async () => {
    if (!groupId) return;

    try {
      const clearContextTime = new Date().toISOString();

      const response = await apiClient.post('/v1/group/clear_ai_context', {
        groupId: groupId,
        clearContextTime: clearContextTime
      });

      if (response.data.code === 200) {
        // 添加新的清除时间到数组中
        setContextClearedTimes(prev => [...prev, clearContextTime]);

        // 显示成功提示
        setShowClearContextToast(true);
        setTimeout(() => {
          setShowClearContextToast(false);
        }, 3000);

        console.log('AI context cleared successfully');
      } else {
        console.error('Failed to clear AI context:', response.data.message);
        alert('Failed to clear AI context. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing AI context:', error);
      alert('Failed to clear AI context. Please try again.');
    }
  };

  // 检查消息是否需要显示上下文清除提示
  const shouldShowContextClearedMessage = useCallback((message: Message, index: number) => {
    if (contextClearedTimes.length === 0) return null;

    const messageTime = new Date(message.createTime).getTime();
    const nextMessage = messages[index + 1];
    const nextMessageTime = nextMessage ? new Date(nextMessage.createTime).getTime() : Date.now();

    // 查找在当前消息之后、下一条消息之前的所有清除时间
    const relevantClearTimes = contextClearedTimes.filter(clearTime => {
      const clearedTime = new Date(clearTime).getTime();
      return messageTime < clearedTime && clearedTime <= nextMessageTime;
    });

    // 如果没有下一条消息，检查是否有在当前消息之后的清除时间
    if (!nextMessage) {
      const futureClearTimes = contextClearedTimes.filter(clearTime => {
        const clearedTime = new Date(clearTime).getTime();
        return messageTime < clearedTime;
      });
      return futureClearTimes.length > 0 ? futureClearTimes : null;
    }

    return relevantClearTimes.length > 0 ? relevantClearTimes : null;
  }, [contextClearedTimes, messages]);

  // 存储用户信息到本地存储
  useEffect(() => {
    if (userInfo && userInfo.userId) {
      try {
        localStorage.setItem('userId', String(userInfo.userId));
        sessionStorage.setItem('userId', String(userInfo.userId));
        (window as any).userInfo = userInfo;
      } catch (e) {
        console.error('保存用户信息失败', e);
      }
    }
  }, [userInfo]);

  // 开发调试信息
  useEffect(() => {
    console.log('🏠 聊天室组件已加载', { groupId, userId: userInfo?.userId });
    return () => {
      console.log('🏠 聊天室组件已卸载', { groupId });
    };
  }, [groupId, userInfo]);

  // 获取Bot信息
  const fetchBotInfo = async (botId: number): Promise<Bot> => {
    if (botsCache.has(botId)) {
      return botsCache.get(botId)!;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/v1/group/get_group_chat_bot_info?botId=${botId}`
      );
      if (response.data.code === 200) {
        botsCache.set(botId, response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching bots:", error);
    } finally {
      setIsLoading(false);
    }
    return {
      botId,
      botName: `Bot ${botId}`,
      accessType: 0,
    };
  };

  // 获取用户信息
  const fetchUserInfo = async (userId: number): Promise<User> => {
    if (usersCache.has(userId)) {
      return usersCache.get(userId)!;
    }

    try {
      const response = await apiClient.get(
        `/v1/user/get_user_info_in_group?userId=${userId}`
      );
      if (response.data.code === 200) {
        usersCache.set(userId, response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
    return {
      userId,
      userName: `User ${userId}`,
      userPortrait: "/default-avatar.png",
      userEmail: "",
    };
  };

  // 批量获取消息
  const fetchMultipleMessages = async (messageIds: number[]): Promise<Message[]> => {
    try {
      console.log('批量获取消息:', messageIds);
      const response = await apiClient.post('/v1/chat/getMsgByIds', {
        groupId: groupId,
        msgIds: messageIds
      });

      console.log('批量获取响应:', response.data);

      if (response.data.data && Array.isArray(response.data.data)) {
        const messages = response.data.data;

        // 批量处理发送者信息
        await Promise.all(
          messages.map(async (msg: Message) => {
            if (msg.senderType === "CHATBOT") {
              const botInfo = await fetchBotInfo(msg.senderId);
              msg.name = botInfo.botName;
              msg.portrait = botIcon;
            } else {
              const userInfo = await fetchUserInfo(msg.senderId);
              msg.name = userInfo.userName;
              msg.portrait = userInfo.userPortrait;
            }
          })
        );
        return messages;
      }
      console.log('响应中没有消息数据');
      return [];
      } catch (error) {
      console.error('批量获取消息失败:', error);
      return [];
      }
    };

  // 获取消息历史
  const fetchMessageHistory = async (loadMore = false) => {
    const prevMessages = messages.length;
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/v1/chat/getHistoryMsg`, {
        groupId: groupId,
        lastMsgId: loadMore ? messages[0]?.infoId : -1,
        pageSize: 20,
      });

      const newMessages = response.data.data as Message[];
      setHasNoMoreMessages(newMessages.length < 20);

      // 处理消息的用户/Bot信息
      await Promise.all(
        newMessages.map(async (msg) => {
          if (msg.senderType === "CHATBOT") {
            const botInfo = await fetchBotInfo(msg.senderId);
            msg.name = botInfo.botName;
            msg.portrait = botIcon;
          } else {
            const userInfo = await fetchUserInfo(msg.senderId);
            msg.name = userInfo.userName;
            msg.portrait = userInfo.userPortrait;
          }
        })
      );

      setMessages((prev) => {
        const merged = [...newMessages, ...prev]
          .filter((v, i, a) => a.findIndex((t) => t.infoId === v.infoId) === i)
          .sort((a, b) => a.infoId - b.infoId);

        // 在合并后的消息数组中处理回复关系
        const processedMessages = merged.map(msg => {
          if (msg.replyToMsgId) {
            // 首先在已加载消息中查找
            const replyToMsg = merged.find(m => m.infoId === msg.replyToMsgId);
            if (replyToMsg) {
              return { ...msg, replyToMessage: replyToMsg };
            } else {
              // 如果未找到，标记为需要获取
              return { ...msg, needsFetchReply: true, replyLoading: true };
            }
          }
          return msg;
        });

        // 收集所有需要获取的被回复消息ID
        const missingReplyIds = processedMessages
          .filter(msg => msg.needsFetchReply && msg.replyToMsgId && !msg.replyToMessage)
          .map(msg => msg.replyToMsgId!)
          .filter((id, index, arr) => arr.indexOf(id) === index); // 去重

        // 批量获取缺失的被回复消息
        if (missingReplyIds.length > 0) {
          console.log('🔄 批量获取缺失的被回复消息:', missingReplyIds);
          fetchMultipleMessages(missingReplyIds).then(replyMessages => {
            if (replyMessages.length > 0) {
              // 创建消息ID到消息对象的映射
              const replyMessageMap = new Map(replyMessages.map(msg => [msg.infoId, msg]));

              setMessages(prevMsgs =>
                prevMsgs.map(m => {
                  if (m.needsFetchReply && m.replyToMsgId && replyMessageMap.has(m.replyToMsgId)) {
                    const replyMessage = replyMessageMap.get(m.replyToMsgId)!;
                    console.log('更新消息回复信息:', m.infoId, '->', replyMessage.infoId);
                    return {
                      ...m,
                      replyToMessage: replyMessage,
                      needsFetchReply: false,
                      replyLoading: false
                    };
                  }
                  return m;
                })
              );
            } else {
              // 批量获取失败，标记所有相关消息为无法获取
              setMessages(prevMsgs =>
                prevMsgs.map(m =>
                  missingReplyIds.includes(m.replyToMsgId!)
                    ? { ...m, needsFetchReply: false, replyLoading: false }
                    : m
                )
              );
            }
          }).catch(error => {
            console.error('批量获取被回复消息出错:', error);
            setMessages(prevMsgs =>
              prevMsgs.map(m =>
                missingReplyIds.includes(m.replyToMsgId!)
                  ? { ...m, needsFetchReply: false, replyLoading: false }
                  : m
              )
            );
          });
        }

        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
            setInitialLoading(false);
          }
        });
        return processedMessages;
      });

      if (loadMore) {
        const container = chatContainerRef.current;
        if (container) {
          setTimeout(() => {
            container.scrollTop =
              container.scrollHeight - prevScrollHeight.current;
          }, 50);
        }
      }
    } catch (error) {
      console.error("Error fetching message history:", error);
    } finally {
      if (messages.length === prevMessages) {
        setIsLoading(false);
      }
    }
  };

  // WebSocket连接管理
  const connectionStatusRef = useRef<{
    currentGroupId: number | null;
    connectionPromise: Promise<void> | null;
    isConnecting: boolean; // 添加连接中标志
  }>({ currentGroupId: null, connectionPromise: null, isConnecting: false });

  // 计算重连延迟(指数退避)
  const getReconnectDelay = (attempt: number): number => {
    const baseDelay = 1000; // 1秒
    const maxDelay = 30000; // 最大30秒
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    // 添加随机抖动,避免多个客户端同时重连
    return delay + Math.random() * 1000;
  };

  // 清理重连定时器
  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const manageWebSocketConnection = useCallback(async () => {
    // 防止重复连接 - 如果正在连接同一个房间,直接返回
    if (connectionStatusRef.current.currentGroupId === groupId &&
        connectionStatusRef.current.isConnecting) {
      console.log('⏸️ 连接正在进行中,跳过重复连接请求');
      return;
    }

    // 如果已经有连接且连接正常,复用
    if (groupId && clientCache.has(groupId)) {
      const cachedClient = clientCache.get(groupId);
      if (cachedClient !== undefined && cachedClient?.connected) {
        console.log('♻️ 复用现有连接');
        stompClientRef.current = cachedClient;
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        connectionStatusRef.current.currentGroupId = groupId;
      return;
      } else {
        // 缓存的连接已失效,清除
        console.log('🗑️ 清除失效的缓存连接');
        clientCache.delete(groupId);
      }
    }

    // 如果切换房间,断开之前的连接
    if (stompClientRef.current?.connected &&
        connectionStatusRef.current.currentGroupId !== groupId) {
      console.log(`🔄 切换房间: ${connectionStatusRef.current.currentGroupId} -> ${groupId}`);
      stompClientRef.current.disconnect(() => {
        console.log("已断开之前的连接");
      });
    }

    if (!groupId) return;

    // 检查网络状态
    if (!navigator.onLine) {
      console.log('🌐 网络离线,等待网络恢复');
      setConnectionStatus('disconnected');
      connectionStatusRef.current.isConnecting = false;
      return;
    }

    // 标记为正在连接
    connectionStatusRef.current.currentGroupId = groupId;
    connectionStatusRef.current.isConnecting = true;
    setConnectionStatus('connecting');

    console.log(`🔌 开始建立WebSocket连接 (房间: ${groupId})`);

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const client = Stomp.over(socket);

    // 配置心跳机制 (10秒发送,10秒接收超时)
    client.heartbeat.outgoing = 10000;
    client.heartbeat.incoming = 10000;

    // 禁用调试日志(生产环境)
    client.debug = (str) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('STOMP Debug:', str);
      }
    };

    stompClientRef.current = client;
    clientCache.set(groupId, client);

    connectionStatusRef.current.connectionPromise = new Promise(
      (resolve, reject) => {
        client.connect(
          {
            cookie: document.cookie,
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          () => {
            console.log('✅ WebSocket连接成功');
            setConnectionStatus('connected');
            reconnectAttemptsRef.current = 0; // 重置重连计数
            connectionStatusRef.current.isConnecting = false;
            clearReconnectTimeout();

            client.subscribe(`/topic/chat/${groupId}`, (message) => {
              console.log("Received message:", message.body);
              const receivedMessage = JSON.parse(message.body) as Message;

              if (receivedMessage.senderId !== userInfo?.userId) {
                handleMessageReceived(
                  receivedMessage.content,
                  receivedMessage.senderId
                );
              }

              Promise.all([
                receivedMessage.senderType === "CHATBOT"
                  ? fetchBotInfo(receivedMessage.senderId).then((botInfo) => {
                      receivedMessage.name = botInfo.botName;
                      receivedMessage.portrait = botIcon;
                    })
                  : fetchUserInfo(receivedMessage.senderId).then((userInfo) => {
                      receivedMessage.name = userInfo.userName;
                      receivedMessage.portrait = userInfo.userPortrait;
                    }),
          ]).then(() => {
              setMessages((prev) => {
              // Process replyToMsgId for the received message
              let processedMessage = { ...receivedMessage };
              if (receivedMessage.replyToMsgId) {
                const replyToMsg = prev.find(m => m.infoId === receivedMessage.replyToMsgId);
                if (replyToMsg) {
                  processedMessage.replyToMessage = replyToMsg;
                  console.log('在现有消息中找到被回复消息:', replyToMsg.infoId);
                } else {
                  processedMessage.needsFetchReply = true;
                  processedMessage.replyLoading = true;
                  console.log('需要异步获取被回复消息:', receivedMessage.replyToMsgId);

                  // 异步获取被回复消息
                  fetchMultipleMessages([receivedMessage.replyToMsgId]).then(replyMessages => {
                    console.log('异步获取被回复消息结果:', replyMessages);
                    const replyMessage = replyMessages.length > 0 ? replyMessages[0] : null;
                    if (replyMessage) {
                      setMessages(prevMsgs => {
                        console.log('更新消息状态，当前消息数量:', prevMsgs.length);
                        const updatedMessages = prevMsgs.map(m => {
                          if (m.infoId === receivedMessage.infoId) {
                            console.log('找到目标消息，更新回复信息:', m.infoId);
                            return {
                              ...m,
                              replyToMessage: replyMessage,
                              needsFetchReply: false,
                              replyLoading: false
                            };
                          }
                          return m;
                        });
                        console.log('更新后的消息:', updatedMessages.find(m => m.infoId === receivedMessage.infoId));
                        return updatedMessages;
                      });
                    } else {
                      console.log('获取被回复消息失败，标记为不可用');
                      setMessages(prevMsgs =>
                        prevMsgs.map(m =>
                          m.infoId === receivedMessage.infoId
                            ? { ...m, needsFetchReply: false, replyLoading: false }
                            : m
                        )
                      );
                    }
                  }).catch(error => {
                    console.error('异步获取被回复消息出错:', error);
                    setMessages(prevMsgs =>
                      prevMsgs.map(m =>
                        m.infoId === receivedMessage.infoId
                          ? { ...m, needsFetchReply: false, replyLoading: false }
                          : m
                      )
                    );
                  });
                }
              }

              const newMessages = [...prev, processedMessage]
                .filter((v, i, a) => a.findIndex((t) => t.infoId === v.infoId) === i)
                .sort((a, b) => a.infoId - b.infoId);

              console.log('📋 处理后的消息列表长度:', newMessages.length);

                requestAnimationFrame(() => {
                  if (chatContainerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } =
                      chatContainerRef.current;
                    const isNearBottom =
                    scrollHeight - (scrollTop + clientHeight) < 300;

                    if (isNearBottom) {
                      chatContainerRef.current.scrollTop = scrollHeight;
                      setHasNewMessage(false);
                    } else {
                      setHasNewMessage(true);
                    }
                  }
                });

                return newMessages;
            });
              });
            });

            resolve();
          },
          (error) => {
            console.error(`❌ WebSocket连接失败:`, error);
            setConnectionStatus('disconnected');
            connectionStatusRef.current.isConnecting = false;

            // 清除失败的缓存
            if (groupId) {
              clientCache.delete(groupId);
            }

            // 尝试重连
            if (reconnectAttemptsRef.current < maxReconnectAttempts && navigator.onLine) {
              const delay = getReconnectDelay(reconnectAttemptsRef.current);
              console.log(`🔄 将在${(delay/1000).toFixed(1)}秒后重连 (第${reconnectAttemptsRef.current + 1}次尝试)`);

              setConnectionStatus('reconnecting');
              reconnectAttemptsRef.current += 1;

              clearReconnectTimeout();
              reconnectTimeoutRef.current = setTimeout(() => {
                console.log('⏰ 开始重连...');
                connectionStatusRef.current.currentGroupId = null; // 重置状态以允许重连
                connectionStatusRef.current.isConnecting = false;
                manageWebSocketConnection();
                console.log("📥 拉取断线期间的历史消息");
                fetchMessageHistory(false);
              }, delay);
            } else {
              console.error('⛔ 已达到最大重连次数或网络离线');
              setConnectionStatus('disconnected');
            }

            reject(error);
          }
        );
      }
    );

    try {
      await connectionStatusRef.current.connectionPromise;
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [groupId, handleMessageReceived, userInfo?.userId]);

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 网络已恢复');
      isOnlineRef.current = true;

      // 网络恢复后,如果连接断开则尝试重连
      if ((connectionStatus === 'disconnected' || connectionStatus === 'reconnecting') && groupId) {
        console.log('🔄 网络恢复,尝试重连WebSocket');
        reconnectAttemptsRef.current = 0; // 重置重连计数
        connectionStatusRef.current.currentGroupId = null;
        connectionStatusRef.current.isConnecting = false;
        if (groupId) {
          clientCache.delete(groupId);
        }
        manageWebSocketConnection();
        console.log("📥 拉取断线期间的历史消息");
        fetchMessageHistory(false);
      }
    };

    const handleOffline = () => {
      console.log('🌐 网络已断开');
      isOnlineRef.current = false;
      setConnectionStatus('disconnected');
      connectionStatusRef.current.isConnecting = false;
      clearReconnectTimeout();

      // 断开现有连接
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
          console.log('因网络断开而断开WebSocket');
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [groupId, connectionStatus, manageWebSocketConnection, fetchMessageHistory]);

  // 组件初始化
  useEffect(() => {
    console.log(`🏠 MyRoom组件挂载/更新 (groupId: ${groupId})`);

    if (!groupId) return;

    // 使用flag避免StrictMode导致的重复执行
    let isSubscribed = true;

    const initRoom = async () => {
      if (!isSubscribed) return;

      setMessages([]);
      setIsLoading(false);
      setHasNoMoreMessages(false);
      setSelectedBot(null);
      setReplyingTo(null);

      const fetchMembers = async () => {
        try {
          const response = await apiClient.get(
            `/v1/group/get_group_member_list?groupId=${groupId}`
          );
          if (response.data.code === 200) {
            membersCache.set(Number(groupId), response.data.data);
            // 在membersCache更新后立即更新isAdmin状态
            setIsAdmin(checkIfAdmin());
          }
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };

      await fetchMembers();

      if (isSubscribed) {
        manageWebSocketConnection();
        fetchMessageHistory(false);
      }
    };

    initRoom();

    return () => {
      console.log(`🏠 MyRoom组件卸载 (groupId: ${groupId})`);
      isSubscribed = false;
      clearReconnectTimeout();

      // 注意: 不要在这里断开连接,因为我们使用了缓存
      // 连接会在切换房间时由manageWebSocketConnection管理
      // 或者在组件真正销毁时清理

      // 只在组件完全卸载(不是重新渲染)时清理状态
      if (!groupId) {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
            console.log("✂️ 组件卸载,断开WebSocket");
        });
      }
      connectionStatusRef.current = {
        currentGroupId: null,
        connectionPromise: null,
          isConnecting: false,
      };
      }
    };
  }, [groupId]); // 移除manageWebSocketConnection依赖,避免不必要的重新执行

  // 发送消息
  const sendMessage = () => {
    if (inputMessage.trim() && stompClientRef.current && userInfo?.userId) {
      console.log('💬 即将发送消息:', {
        content: inputMessage,
        groupId,
        userId: userInfo.userId,
        botId: selectedBot || 0,
        replyToMsgId: replyingTo?.infoId
      });

      trackSend(inputMessage);

      if (eventQueue && eventQueue.length > 0) {
        console.log(`🚀 发送消息触发埋点批量发送: 队列长度 ${eventQueue.length}`);
        if ((sensors as any).debug?.dumpQueue) {
          console.log('📊 发送消息前的埋点队列内容:');
          (sensors as any).debug.dumpQueue();
        }
        flushEvents();
      }

      const message = {
        groupId: groupId,
        senderId: userInfo.userId,
        content: inputMessage,
        msgType: 0,
        createTime: new Date().toISOString(),
        botId: selectedBot || 0,
        replyToMsgId: replyingTo?.infoId || null, // 添加回复消息ID
      };

      setSelectedBot(null);
      setReplyingTo(null); // 清除回复状态

      stompClientRef.current.send(
        `/app/chat/${groupId}`,
        {},
        JSON.stringify(message)
      );

      console.log('消息已发送');
      setInputMessage("");
    } else {
      console.log('消息发送失败:', {
        hasContent: !!inputMessage.trim(),
        hasClient: !!stompClientRef.current,
        hasUser: !!userInfo?.userId
      });
    }
  };

  const prevScrollHeight = useRef(0);

  const handleBotSelect = (botName: string, botId: number) => {
    console.log("Bot selected:", botName);
    setInputMessage(`${inputMessage}@${botName} `);
    setSelectedBot(botId);
    setIsBotClicked(false);
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop } = container;
      const isNearBottom =
        container.scrollHeight - (scrollTop + container.clientHeight) < 300;
      if (!isNearBottom) {
        setHasNewMessage(false);
      }

      if (scrollTop < 300 && !isLoading && !hasNoMoreMessages) {
        setHasNewMessage(false);
        prevScrollHeight.current = container.scrollHeight;
        setIsLoading(true);
        fetchMessageHistory(true);
      }
    }
  };

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      setHasNewMessage(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInputMessage(textarea.value);
    textarea.scrollTop = textarea.scrollHeight;
  };

  // 初始化滚动
  useEffect(() => {
    if (initialLoading && messages.length > 0) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.style.overflowY = "auto";
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages, initialLoading]);

  return (
    <Container>
      <GlobalStyle />

      {/* 清除上下文成功提示 */}
      <ClearContextToast $show={showClearContextToast}>
        AI context cleared successfully
      </ClearContextToast>

      {/* 连接状态提示 */}
      {connectionStatus !== 'connected' && (
        <ConnectionStatus $status={connectionStatus}>
          <StatusDot $status={connectionStatus} />
          {connectionStatus === 'connecting' && 'connecting...'}
          {connectionStatus === 'disconnected' && 'disconnected'}
          {connectionStatus === 'reconnecting' && `reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`}
        </ConnectionStatus>
      )}

      <EtherpadDrawerWithButton roomId={groupId} currentRoomId={groupId}>
      <RenderedChatContainer ref={chatContainerRef} onScroll={handleScroll}>
        {hasNoMoreMessages && (
          <div style={{ textAlign: "center", padding: "5px", color: "#666" }}>
            No more messages
          </div>
        )}
        {messages.map((msg, index) => (
          <React.Fragment key={msg.infoId}>
          <MessageContainer
            $isOwnMessage={msg.senderType === "USER" && msg.senderId === userInfo?.userId}
              data-message-id={msg.infoId}
          >
            <Avatar
              src={
                msg.senderType === "CHATBOT"
                  ? botIcon
                  : `data:image/png;base64, ${msg.portrait}`
              }
              alt="User portrait"
            />
            <MessageContent>
              <UserName>
                {msg.senderId === userInfo?.userId ? "You" : `${msg.name}`}
              </UserName>

              {/* 显示被回复消息的引用 */}
              {msg.replyToMsgId && (
                <ReplyPreview
                  onClick={() => {
                    if (msg.replyToMessage && !msg.replyLoading) {
                      scrollToMessage(msg.replyToMessage.infoId);
                    }
                  }}
                  style={{
                    cursor: msg.replyToMessage && !msg.replyLoading ? 'pointer' : 'default',
                    opacity: msg.replyToMessage && !msg.replyLoading ? 1 : 0.7
                  }}
                >
                  <ReplyHeader>
                    回复 {msg.replyToMessage
                      ? (msg.replyToMessage.senderId === userInfo?.userId ? "你" : msg.replyToMessage.name)
                      : "未知用户"
                    }
                  </ReplyHeader>
                  <ReplyContent>
                    {msg.replyLoading
                      ? "正在加载被回复消息..."
                      : msg.replyToMessage
                        ? msg.replyToMessage.content
                        : "被回复消息不可用"
                    }
                  </ReplyContent>
                  {!msg.replyToMessage && !msg.replyLoading && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      该消息未加载，无法跳转
                    </div>
                  )}
                </ReplyPreview>
              )}

              <MessageText>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    p: (props) => (
                      <p {...props} style={{ margin: "0.5em 0" }} />
                    ),
                    code: (props) => (
                      <code
                        {...props}
                        style={{
                          backgroundColor: "#f5f5f5",
                          padding: "2px 4px",
                          borderRadius: "4px",
                        }}
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </MessageText>
              <TimeStamp>
                {new Date(msg.createTime).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </TimeStamp>
            </MessageContent>

            {/* 消息操作按钮 */}
            <MessageActions className="message-actions">
              <ActionButton
                onClick={() => handleReplyToMessage(msg)}
                title="回复"
              >
                <LuReply />
              </ActionButton>
              <ActionButton
                onClick={() => handleCopyMessage(msg.content)}
                title="复制"
              >
                <LuCopy />
              </ActionButton>
            </MessageActions>
          </MessageContainer>

            {/* 显示上下文清除提示 */}
            {shouldShowContextClearedMessage(msg, index) && (
              <ContextClearedMessage>
                AI agent context has been cleared
              </ContextClearedMessage>
            )}
          </React.Fragment>
        ))}
      </RenderedChatContainer>

      {hasNewMessage && (
        <NewMessageNotification onClick={scrollToBottom}>
          新消息 ▼
        </NewMessageNotification>
      )}

      <SendMessageContainer>

        <IconContainer>
          {groupMode === 'free' && (
            <>
              <IconWrapper onClick={() => setIsBotClicked(!isBotClicked)}>
        <BotIcon
          src={botIcon}
          alt="Bot Icon"
        />
              </IconWrapper>
        {isBotClicked && (
          <BotListPopUp
            onClose={() => setIsBotClicked(false)}
            groupId={groupId}
            onBotSelect={handleBotSelect}
          />
        )}
            </>
          )}
          <IconWrapper onClick={sendMessage}>
            <SendIcon />
          </IconWrapper>
          {isAdmin && (
            <IconWrapper>
              <ClearContextIcon
                onClick={handleClearContext}
                title="clear ai agent context"
              />
            </IconWrapper>
          )}
        </IconContainer>

        <MessageInputWrapper $disabled={connectionStatus !== 'connected'}>

        <MessageInput
            $disabled={isLoading || connectionStatus !== 'connected'}
            $isReplying={!!replyingTo}
            ref={messageInputRef}
          value={inputMessage}
          onChange={(e) => {
              handleInputChange(e);
            handleTyping(e.target.value);
          }}
            onCompositionStart={() => {
              // 输入法组合开始（拼音输入开始）
              handleCompositionStart();
            }}
            onCompositionEnd={(e) => {
              // 输入法组合结束（拼音转换为中文完成）
              handleCompositionEnd((e.target as HTMLTextAreaElement).value);
            }}
            onKeyDown={e => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                const { selectionStart, selectionEnd, value } = e.currentTarget;
                setInputMessage(
                    value.slice(0, selectionStart) + "\n" + value.slice(selectionEnd)
                );
                setTimeout(() => {
                  if (messageInputRef.current) {
                    messageInputRef.current.selectionStart = messageInputRef.current.selectionEnd = selectionStart + 1;
                  }
                }, 0);
              } else if (e.key === "Enter") {
                e.preventDefault();
              sendMessage();
            }
          }}
            placeholder={
              connectionStatus !== 'connected'
                ? "连接断开,无法发送消息..."
                : isLoading
                  ? "Sending..."
                  : "Type your message..."
            }
            rows={4}
          />
          {/* 回复预览 */}
        {replyingTo && (
          <ReplyInputContainer>
            <ReplyInputText>
              Reply {replyingTo.senderId === userInfo?.userId ? "You" : replyingTo.name}: {replyingTo.content.slice(0, 50)}{replyingTo.content.length > 50 ? '...' : ''}
            </ReplyInputText>
            <CancelReplyButton onClick={handleCancelReply}>
              <LuX />
            </CancelReplyButton>
          </ReplyInputContainer>
        )}
        </MessageInputWrapper>
      </SendMessageContainer>
      </EtherpadDrawerWithButton>

      {/* 复制成功提示 */}
      <CopySuccessToast $show={!!copySuccess}>
        {copySuccess}
      </CopySuccessToast>
    </Container>
  );
};

export default MyRoom;
