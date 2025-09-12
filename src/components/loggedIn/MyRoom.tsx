import React, { useState, useEffect, useRef, useCallback } from "react";
import { membersCache } from "./RoomMembersComponent";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled, { createGlobalStyle } from "styled-components";
import { LuSend, LuX, LuReply, LuCopy } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useInputTracking } from "../../hooks/useInputTracking";
import sensors, { eventQueue, flushEvents } from "../../utils/tracker";
import { API_BASE_URL } from "../../../config";

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
  width: 100%-40px;
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
  const isInitialMount = useRef(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [isBotClicked, setIsBotClicked] = useState(false);
  
  // 回复功能状态
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // 埋点Hook
  const { handleTyping, handleSend: trackSend, handleMessageReceived } = useInputTracking(groupId);

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
        merged.forEach(msg => {
          if (msg.replyToMsgId) {
            const replyToMsg = merged.find(m => m.infoId === msg.replyToMsgId);
            if (replyToMsg) {
              msg.replyToMessage = replyToMsg;
            }
          }
        });

        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
            setInitialLoading(false);
          }
        });
        return merged;
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
  }>({ currentGroupId: null, connectionPromise: null });

  const manageWebSocketConnection = useCallback(async () => {
    if (connectionStatusRef.current.currentGroupId === groupId) {
      return;
    }

    if (groupId && clientCache.has(groupId)) {
      const cachedClient = clientCache.get(groupId);
      if (cachedClient !== undefined) {
        stompClientRef.current = cachedClient;
      }
      return;
    }

    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect(() => {
        console.log("Disconnected from previous connection");
      });
      console.log(
        `Disconnected from previous room: ${connectionStatusRef.current.currentGroupId}`
      );
    }

    connectionStatusRef.current.currentGroupId = groupId ?? null;

    if (!groupId) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const client = Stomp.over(socket);
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
              if (receivedMessage.replyToMsgId) {
                const replyToMsg = prev.find(m => m.infoId === receivedMessage.replyToMsgId);
                if (replyToMsg) {
                  receivedMessage.replyToMessage = replyToMsg;
                }
              }
              
              const newMessages = [...prev, receivedMessage]
                .filter((v, i, a) => a.findIndex((t) => t.infoId === v.infoId) === i)
                .sort((a, b) => a.infoId - b.infoId);

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
            console.error(`Connection failed for room ${groupId}:`, error);
            reject(error);
          }
        );
      }
    );

    try {
      connectionStatusRef.current.connectionPromise;
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [groupId, handleMessageReceived, userInfo?.userId]);

  // 组件初始化
  useEffect(() => {
    if (!isInitialMount.current) {
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
          }
        } catch (error) {
          console.error("Error fetching group members:", error);
        }
      };

      if (groupId) {
        fetchMembers();
        manageWebSocketConnection();
        fetchMessageHistory(false);
      }
    } else {
      isInitialMount.current = false;
    }

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("Disconnected successfully");
          if (groupId) {
            clientCache.delete(groupId);
          }
        });
        console.log("Cleanup: WebSocket disconnected");
      }
      connectionStatusRef.current = {
        currentGroupId: null,
        connectionPromise: null,
      };
    };
  }, [groupId, manageWebSocketConnection]);

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

      console.log('✅ 消息已发送');
      setInputMessage("");
    } else {
      console.log('❌ 消息发送失败:', {
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
      <RenderedChatContainer ref={chatContainerRef} onScroll={handleScroll}>
        {hasNoMoreMessages && (
          <div style={{ textAlign: "center", padding: "5px", color: "#666" }}>
            No more messages
          </div>
        )}
        {messages.map((msg) => (
          <MessageContainer
            key={msg.infoId}
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
              {msg.replyToMessage && (
                <ReplyPreview onClick={() => scrollToMessage(msg.replyToMessage!.infoId)}>
                  <ReplyHeader>
                    Reply {msg.replyToMessage.senderId === userInfo?.userId ? "You" : msg.replyToMessage.name}
                  </ReplyHeader>
                  <ReplyContent>{msg.replyToMessage.content}</ReplyContent>
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
        ))}
      </RenderedChatContainer>

      {hasNewMessage && (
        <NewMessageNotification onClick={scrollToBottom}>
          新消息 ▼
        </NewMessageNotification>
      )}

      <SendMessageContainer>
        
        <IconContainer>
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
          <IconWrapper onClick={sendMessage}>
            <SendIcon />
          </IconWrapper>
        </IconContainer>
        
        <MessageInputWrapper>
          
          <MessageInput
            $disabled={isLoading}
            $isReplying={!!replyingTo}
            ref={messageInputRef}
            value={inputMessage}
            onChange={(e) => {
              handleInputChange(e);
              handleTyping(e.target.value);
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
            placeholder={isLoading ? "Sending..." : "Type your message..."}
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
      
      {/* 复制成功提示 */}
      <CopySuccessToast $show={!!copySuccess}>
        {copySuccess}
      </CopySuccessToast>
    </Container>
  );
};

export default MyRoom;