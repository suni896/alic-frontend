import React, { useState, useEffect, useRef, useCallback } from "react";
import { membersCache } from "./RoomMembersComponent";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled from "styled-components";
import { LuSend, LuX } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useInputTracking } from "../../hooks/useInputTracking";
import sensors, { eventQueue } from "../../utils/tracker";

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
}

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 60px;
  padding: 20px;
  box-sizing: border-box;
`;

const RenderedChatContainer = styled.div`
  width: 100%;
  height: 73vh;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;

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

const MessageText = styled.div`
  word-break: break-word;
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

const botsCache = new Map<number, Bot>();

const clientCache = new Map<number, Stomp.Client | null>();

const usersCache = new Map<number, User>();

const MyRoom: React.FC<MyRoomProps> = ({ groupId }) => {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);
  
  // 使用埋点Hook - 已更新埋点规则
  const { handleTyping, handleSend: trackSend, handleMessageReceived } = useInputTracking(groupId);

  // 存储用户信息到本地存储，便于埋点使用
  useEffect(() => {
    if (userInfo && userInfo.userId) {
      // 保存用户ID到多个位置，确保埋点能够获取
      try {
        localStorage.setItem('userId', String(userInfo.userId));
        sessionStorage.setItem('userId', String(userInfo.userId));
        // 同时在window对象上设置，便于调试
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

  useEffect(() => {
    const fetchBots = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/v1/group/get_group_chat_bot_list?groupId=${groupId}`
        );
        if (response.data.code === 200) {
          // response.data.data.forEach((bot: Bot) => {
          //   botsCache.set(bot.botId, bot.botName);
          // });
        }
      } catch (error) {
        console.error("Error fetching bots:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBots();
  }, [groupId]);

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

  const connectionStatusRef = useRef<{
    currentGroupId: number | null;
    connectionPromise: Promise<void> | null;
  }>({ currentGroupId: null, connectionPromise: null });

  const manageWebSocketConnection = useCallback(async () => {
    // 如果正在连接相同房间，直接返回
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

    // 断开之前的连接
    if (stompClientRef.current?.connected) {
      stompClientRef.current.disconnect(() => {
        console.log("Disconnected from previous connection");
      });
      console.log(
        `Disconnected from previous room: ${connectionStatusRef.current.currentGroupId}`
      );
    }

    // 更新连接状态
    connectionStatusRef.current.currentGroupId = groupId ?? null;

    // 如果没有groupId，停止连接
    if (!groupId) return;

    // 创建新的连接
    const socket = new SockJS(`https://112.74.92.135/ws`);
    const client = Stomp.over(socket);
    stompClientRef.current = client;
    clientCache.set(groupId, client);

    // 创建连接Promise
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
              
              // 只有接收到的消息不是自己发送的，才触发接收消息埋点
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
              ]);
              setMessages((prev) => {
                const newMessages = [...prev, receivedMessage].sort(
                  (a, b) => a.infoId - b.infoId
                );

                requestAnimationFrame(() => {
                  if (chatContainerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } =
                      chatContainerRef.current;
                    const isNearBottom =
                      scrollHeight - (scrollTop + clientHeight) < 200;

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

  useEffect(() => {
    if (!isInitialMount.current) {
      setMessages([]);
      setIsLoading(false);
      setHasNoMoreMessages(false);
      setSelectedBot(null);

      // 获取群组成员
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

    // 清理函数
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

  const sendMessage = () => {
    if (inputMessage.trim() && stompClientRef.current && userInfo?.userId) {
      // 调试日志
      console.log('💬 即将发送消息:', {
        content: inputMessage,
        groupId,
        userId: userInfo.userId,
        botId: selectedBot || 0
      });
      
      // 发送消息前记录最终输入状态
      trackSend(inputMessage);
      
      const message = {
        groupId: groupId,
        senderId: userInfo.userId,
        content: inputMessage,
        msgType: 0,
        createTime: new Date().toISOString(),
        botId: selectedBot || 0,
      };
      setSelectedBot(null);
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
  const [selectedBot, setSelectedBot] = useState<number | null>(null);

  const handleBotSelect = (botName: string, botId: number) => {
    console.log("Bot selected:", botName);
    setInputMessage(`${inputMessage}@${botName} `);
    setSelectedBot(botId);
    setIsBotClicked(false);
  };

  const [isBotClicked, setIsBotClicked] = useState(false);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop } = container;
      const isNearBottom =
        container.scrollHeight - (scrollTop + container.clientHeight) < 200;
      if (!isNearBottom) {
        setHasNewMessage(false);
      }

      if (scrollTop < 200 && !isLoading && !hasNoMoreMessages) {
        setHasNewMessage(false); // 立即关闭新消息提示
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

  const MessageContainer = styled.div<{ $isOwnMessage: boolean }>`
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: ${props => props.$isOwnMessage ? "#dcf8c6" : "white"};
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  const TimeStamp = styled.div`
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.5rem;
    line-height: 1;
  `;

  return (
    <Container>
      <RenderedChatContainer ref={chatContainerRef} onScroll={handleScroll}>
        {hasNoMoreMessages && (
          <div style={{ textAlign: "center", padding: "5px", color: "#666" }}>
            No more messages
          </div>
        )}
        {messages.map((msg) => (
          <MessageContainer key={msg.infoId} $isOwnMessage={msg.senderId === userInfo?.userId}>
            <Avatar
              src={
                msg.senderType === "CHATBOT"
                  ? botIcon
                  : `data:image/png;base64, ${msg.portrait}`
              }
              alt="User portrait"
            />
            <MessageContent>
              <UserName>{msg.senderId === userInfo?.userId ? "You" : `${msg.name}`}</UserName>
              <MessageText>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
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
                    // 自定义其他组件的样式
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
          </MessageContainer>
        ))}
      </RenderedChatContainer>
      
      {hasNewMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            backgroundColor: "#016532",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
          onClick={scrollToBottom}
        >
          新消息 ▼
        </div>
      )}
      
      <SendMessageContainer>
        <MessageInput
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            
            // 使用更新后的埋点规则处理输入事件
            // 无论是增加还是删除都会触发，但规则逻辑在hook内部处理
            handleTyping(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              console.log('⌨️ 按下回车键发送消息');
              sendMessage();
            }
          }}
        />
        <BotIcon
          src={botIcon}
          alt="Bot Icon"
          onClick={() => setIsBotClicked(!isBotClicked)}
        />
        {isBotClicked && (
          <BotListPopUp
            onClose={() => setIsBotClicked(false)}
            groupId={groupId}
            onBotSelect={handleBotSelect}
          />
        )}
        <SendIcon onClick={sendMessage} />
      </SendMessageContainer>
    </Container>
  );
};

export default MyRoom;
