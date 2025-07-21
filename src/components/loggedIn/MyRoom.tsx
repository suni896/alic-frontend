import React, { useState, useEffect, useRef } from "react";
import { membersCache, GroupMember } from "./RoomMembersComponent";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { LuSend, LuX } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { EtherpadDrawerWithButton } from "./EtherpadDrawer";

interface MyRoomProps {
  title?: string;
  desc?: string;
  groupId?: number;
  onClose?: () => void;
  onBotSelect?: (botName: string, botId: number) => void;
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

interface Message {
  infoId: number;
  groupId: number;
  senderId: number;
  content: string;
  msgType: number;
  createTime: string;
  senderType: string;
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

const MyRoom: React.FC<MyRoomProps> = ({
  title: propTitle = "Default Title",
  desc: propDesc = "No description available.",
  groupId,
}) => {
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

  const cookie = document.cookie;
  const token = localStorage.getItem("jwtToken");

  console.log("MyRoom enter groupId:", groupId);

  const fetchMessageHistory = async (loadMore = false) => {
    console.log(
      "fetchMessageHistory enter:",
      loadMore,
      hasNoMoreMessages,
      isLoading
    );
    // if (hasNoMoreMessages || isLoading) return;
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

  useEffect(() => {
    if (!isInitialMount.current) {
      setMessages([]);
      setPageNum(1);
      setIsLoading(false);
      setHasNoMoreMessages(false);
      setSelectedBot(null);

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

      if (groupId) fetchMembers();

      const connectWebSocket = () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.disconnect(() => {
            console.log("Disconnected previous WebSocket connection");
          });
          stompClientRef.current = null;
        }

        const socket = new SockJS(`https://112.74.92.135/ws`);
        const client = Stomp.over(socket);

        client.connect(
          {
            cookie: cookie,
            Authorization: `Bearer ${token}`,
          },
          () => {
            client.subscribe(`/topic/chat/${groupId}`, (message) => {
              console.log("Received message:", message.body);
              const receivedMessage = JSON.parse(message.body) as Message;
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
                    console.log(
                      "scrollHeight:",
                      scrollHeight,
                      "scrollTop:",
                      scrollTop,
                      "clientHeight:",
                      clientHeight
                    );

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
          }
        );

        stompClientRef.current = client;

        return () => {
          if (client && client.connected) {
            client.disconnect(() => {
              console.log("Cleanup: WebSocket disconnected");
              stompClientRef.current = null;
            });
          }
        };
      };

      if (groupId) {
        connectWebSocket();
        fetchMessageHistory(false);
      }
    } else {
      isInitialMount.current = false;
    }

    return () => {};
  }, [groupId]);

  const sendMessage = () => {
    if (inputMessage.trim() && stompClientRef.current && userInfo?.userId) {
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
      setInputMessage("");
    }
  };

  const prevScrollHeight = useRef(0);
  const [pageNum, setPageNum] = useState(1);
  const [selectedBot, setSelectedBot] = useState<number | null>(null);

  const handleBotSelect = (botName: string, botId: number) => {
    console.log("Bot selected:", botName);
    setInputMessage(`${inputMessage}@${botName} `);
    setSelectedBot(botId);
    setIsBotClicked(false);
  };

  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [isBotClicked, setIsBotClicked] = useState(false);

  const title = state?.title || propTitle;
  const desc = state?.desc || propDesc;

  useEffect(() => {
    console.log(title, desc);
  }, [title, desc]);

  // 修改滚动事件处理
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

  return (
    <Container>
      {/* 添加 EtherpadDrawerWithButton 组件 */}
      <EtherpadDrawerWithButton roomId={groupId} />
      
      <RenderedChatContainer ref={chatContainerRef} onScroll={handleScroll}>
        {hasNoMoreMessages && (
          <div style={{ textAlign: "center", padding: "5px", color: "#666" }}>
            No more messages
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.infoId}
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor:
                msg.senderId === userInfo?.userId ? "#dcf8c6" : "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Avatar
              src={
                msg.senderType === "CHATBOT"
                  ? botIcon
                  : `data:image/png;base64, ${
                      msg.senderId === userInfo?.userId
                        ? userInfo.userPortrait
                        : membersCache
                            .get(Number(groupId))
                            ?.find((m) => m.userId === msg.senderId)
                            ?.userPortrait || "/default-avatar.png"
                    }`
              }
              alt="User portrait"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>
                {msg.senderType === "CHATBOT"
                  ? `Bot ${msg.senderId}`
                  : msg.senderId === userInfo?.userId
                  ? "You"
                  : `User ${msg.senderId}`}
              </div>
              {/* <MessageText
                dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
              /> */}
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
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginTop: "0.5rem",
                }}
              >
                {new Date(msg.createTime).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </div>
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
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
