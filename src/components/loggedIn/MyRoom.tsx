import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../lib/queryClient";
import { membersCache } from "./RoomMembersComponent";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import styled, { createGlobalStyle } from "styled-components";
import { LuSend, LuX, LuReply, LuCopy, LuRotateCcw } from "react-icons/lu";
import botIcon from "../../assets/chat-gpt.png";
import { useUserInfo } from "../../hooks/queries/useUser";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useInputTracking } from "../../hooks/useInputTracking";
import { useKeyboardInsets } from "../../hooks/useKeyboardInsets";
import sensors, { eventQueue, flushEvents } from "../../utils/tracker";
import { API_BASE_URL } from "../../../config";
import {
  useGroupChatBotList,
  useClearHistory,
  useClearAIContext,
} from "../../hooks/queries/useChat";
import { useGroupInfo } from "../../hooks/queries/useGroup";
import { 
  fetchGroupChatBotInfo, 
  fetchGroupMemberList,
  fetchUserRole,
  type ChatBot 
} from "../../api/group.api";
import { fetchUserInfoInGroup } from "../../api/user.api";
import { fetchMsgByIds, fetchHistoryMsg } from "../../api/chat.api";

interface MyRoomProps {
  title?: string;
  desc?: string;
  groupId?: number;
  onClose?: () => void;
  onBotSelect?: (botName: string, botId: number) => void;
}

// Use ChatBot from API types
interface Bot extends ChatBot {}

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
    /* ================= Visual ================= */
    background-color: rgba(205, 255, 219, 0.24) !important;
    border: 1px solid var(--emerald-green) !important;
    
    /* ================= Animation ================= */
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
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 100%;
  height: calc(100vh - 3.5rem);
  padding: var(--space-2) var(--space-3);
  box-sizing: border-box;

  /* ================= Visual ================= */
  background: var(--white);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: calc(100vh - 4.5rem);
    padding: var(--space-4) var(--space-5) var(--space-4) var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: calc(100vh - 5rem);
    padding: var(--space-5) var(--space-7) var(--space-5) var(--space-8);
    border-left: 1px solid var(--color-line);
  }
`;

const RenderedChatContainer = styled.div`
  /* ================= Layout ================= */
  overflow-y: auto;
  flex: 1;

  /* ================= Box Model ================= */
  width: 100%;
  padding: 0 var(--space-2);

  /* ================= Visual ================= */
  background: var(--white);
  border-radius: var(--radius-5);

  /* ================= Scrollbar ================= */
  &::-webkit-scrollbar {
    width: var(--space-1);
  }

  &::-webkit-scrollbar-track {
    background: var(--gray-100);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: var(--radius-3);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--gray-500);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: calc(100% - var(--space-6));
    padding: 0 var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: calc(100% - var(--space-8));
    padding: 0 var(--space-5);
  }
`;

// 消息容器 - 支持悬浮显示功能按钮
const MessageContainer = styled.div<{ $isOwnMessage: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: flex-start;
  position: relative;

  /* ================= Box Model ================= */
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  gap: var(--space-2);

  /* ================= Visual ================= */
  background-color: ${(props) => (props.$isOwnMessage ? "var(--emerald-green-100)" : "var(--white)")};
  border-radius: var(--radius-5);
  box-shadow: var(--shadow-soft);

  /* ================= Interaction ================= */
  &:hover .message-actions {
    opacity: 1;
    visibility: visible;
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    gap: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    margin-bottom: var(--space-5);
    padding: var(--space-5);
    gap: var(--space-5);
  }
`;

// 消息操作按钮容器
const MessageActions = styled.div`
  /* ================= Layout ================= */
  display: flex;
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  
  /* ================= Box Model ================= */
  gap: var(--space-2);
  padding: var(--space-2);
  
  /* ================= Visual ================= */
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-soft);
  
  /* ================= Animation ================= */
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out;
`;

// 操作按钮
const ActionButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2);
  
  /* ================= Visual ================= */
  background: none;
  border: none;
  border-radius: var(--radius-3);
  color: var(--muted-6b7280);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease-in-out;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--color-text);
  }
  
  svg {
    width: var(--space-4);
    height: var(--space-4);
  }
`;

// 回复预览容器
const ReplyPreview = styled.div<{ $clickable?: boolean }>`
  /* ================= Layout ================= */
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  
  /* ================= Box Model ================= */
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
  
  /* ================= Visual ================= */
  background: var(--gray-50);
  border-left: 3px solid var(--emerald-green);
  border-radius: var(--radius-3);
  opacity: ${(props) => (props.$clickable ? 1 : 0.7)};
  
  /* ================= Interaction ================= */
  &:hover {
    background: ${(props) => (props.$clickable ? 'var(--color-own-message)' : 'var(--gray-50)')};
    border-left-color: ${(props) => (props.$clickable ? 'var(--emerald-green-dark)' : 'var(--emerald-green)')};
  }
`;

const ReplyHeader = styled.div`
  /* ================= Layout ================= */
  margin-bottom: var(--space-2);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  
  /* ================= Visual ================= */
  color: var(--emerald-green);
`;

const ReplyContent = styled.div`
  /* ================= Layout ================= */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-word;

  /* ================= Box Model ================= */
  /* mobile - 基础样式 */
  max-width: 12rem;

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Typography ================= */
  font-size: var(--space-4);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    max-width: 15rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    max-width: 18.75rem;
  }
`;

// 回复输入框容器
const ReplyInputContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  height: 2.3rem;
  padding: 0 var(--space-4);
  
  /* ================= Visual ================= */
  background: var(--color-own-message);
  border-left: 3px solid var(--emerald-green);
  border-radius: var(--radius-3);
`;

// 复制成功提示组件
const CopySuccessToast = styled.div<{ $show: boolean }>`
  /* ================= Layout ================= */
  position: fixed;
  top: 3.75rem;
  right: var(--space-5);
  z-index: 10000;
  
  /* ================= Box Model ================= */
  padding: var(--space-4) var(--space-6);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  background-color: var(--success-green);
  color: var(--white);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-medium);
  
  /* ================= Animation ================= */
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$show ? '0' : '-1.25rem'});
  transition: all 0.3s ease-in-out;
`;

// 清除上下文成功提示样式
const ClearContextToast = styled.div<{ $show: boolean }>`
  /* ================= Layout ================= */
  position: fixed;
  top: 8vh;
  left: 50%;
  z-index: 10000;
  
  /* ================= Box Model ================= */
  padding: var(--space-4) var(--space-6);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  background-color: var(--warning-orange);
  color: var(--white);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-medium);
  
  /* ================= Animation ================= */
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$show ? '0' : '-1.25rem'});
  transition: all 0.3s ease-in-out;
`;

// 清除上下文图标样式
const ClearContextIcon = styled(LuRotateCcw)`
  /* ================= Layout ================= */
  display: block;
  
  /* ================= Typography ================= */
  font-size: 1.6rem;
  
  /* ================= Visual ================= */
  color: var(--black);
  
  /* ================= Interaction ================= */
  cursor: pointer;
`;

// 上下文清除提示消息样式
const ContextClearedMessage = styled.div`
  /* ================= Layout ================= */
  text-align: center;
  
  /* ================= Box Model ================= */
  margin: var(--space-3) 0;
  padding: var(--space-3) var(--space-5);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-style: italic;
  
  /* ================= Visual ================= */
  background-color: var(--warning-light);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-3);
  color: var(--warning-text);
`;

const ReplyInputText = styled.span`
  /* ================= Layout ================= */
  flex: 1;
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  
  /* ================= Visual ================= */
  color: var(--color-text);
`;

const CancelReplyButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2);
  
  /* ================= Visual ================= */
  background: none;
  border: none;
  border-radius: var(--radius-3);
  color: var(--muted-6b7280);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const MessageContent = styled.div`
  /* ================= Layout ================= */
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  /* ================= Layout ================= */
  margin-bottom: var(--space-2);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  line-height: 1.2;
  
  /* ================= Visual ================= */
  color: var(--primary-text);
`;

const MessageText = styled.div`
  /* ================= Layout ================= */
  word-break: break-word;
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  
  /* ================= Visual ================= */
  color: var(--color-text);
`;

const TimeStamp = styled.div`
  /* ================= Layout ================= */
  margin-top: var(--space-3);
  
  /* ================= Typography ================= */
  font-size: var(--space-3);
  line-height: 1;
  
  /* ================= Visual ================= */
  color: var(--muted-6b7280);
`;

const SendMessageContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  z-index: 1;

  /* ================= Box Model ================= */
  width: 100%;
  height: 7rem;
  margin-top: var(--space-1);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: 8rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: 11rem;
  }
`;

const MessageInputWrapper = styled.div<{ $disabled?: boolean; $keyboardHeight?: number }>`
  /* ================= Layout ================= */
  position: relative;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-1) var(--space-2);
  padding-bottom: ${props => props.$keyboardHeight ? `${props.$keyboardHeight + 8}px` : 'var(--space-1)'};
  box-sizing: border-box;

  /* ================= Visual ================= */
  border: 0.5px solid;
  border-color: ${(props) => (props.$disabled ? "var(--gray-300)" : "var(--gray-200)")};
  background-color: ${(props) => (props.$disabled ? "var(--color-line)" : "var(--white)")};
  border-radius: var(--radius-3);

  /* ================= Animation ================= */
  transition: padding-bottom 0.2s ease;

  &:focus-within {
    border-color: ${(props) => (props.$disabled ? "var(--gray-300)" : "transparent")};
    outline: ${(props) => (props.$disabled ? 'none' : '2px solid var(--emerald-green)')};
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 99%;
    padding: var(--space-2) var(--space-4);
    padding-bottom: ${props => props.$keyboardHeight ? `${props.$keyboardHeight + 8}px` : 'var(--space-2)'};
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 98%;
    padding: var(--space-3) var(--space-5);
    padding-bottom: ${props => props.$keyboardHeight ? `${props.$keyboardHeight + 8}px` : 'var(--space-3)'};
  }
`;

const MessageInput = styled.textarea<{ $disabled?: boolean; $isReplying?: boolean }>`
  /* ================= Layout ================= */
  resize: none;
  overflow-y: auto;
  
  /* ================= Box Model ================= */
  width: 100%;
  min-height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  max-height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  height: ${props => props.$isReplying ? '3.5rem' : '5.8rem'};
  padding: 0;
  box-sizing: border-box;
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  line-height: 1.5;
  font-family: inherit;
  
  /* ================= Visual ================= */
  background-color: transparent;
  border: none;
  color: ${(props) => (props.$disabled ? "var(--gray-400)" : "var(--black)")};
  
  /* ================= Interaction ================= */
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "text")};
 
  &:focus {
    outline: none;
  } 
 
  &::placeholder {
    color: ${(props) => (props.$disabled ? "var(--color-text)" : "var(--color-text)")};
    opacity: 1;
  }
`;

const Avatar = styled.img`
  /* ================= Layout ================= */
  flex-shrink: 0;
  align-self: flex-start;
  
  /* ================= Box Model ================= */
  width: 2rem;
  height: 2rem;
  margin-right: var(--space-2);
  margin-top: var(--space-1);
  
  /* ================= Visual ================= */
  border-radius: 50%;
  object-fit: cover;

  @media (min-width: 48rem) {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: var(--space-4);
  }
`;

const LoadingSpinner = styled.div`
  /* ================= Layout ================= */
  margin-left: var(--space-3);
  
  /* ================= Box Model ================= */
  width: var(--space-4);
  height: var(--space-4);
  
  /* ================= Visual ================= */
  border: 2px solid var(--gray-100);
  border-top: 2px solid var(--emerald-green);
  border-radius: 50%;
  
  /* ================= Animation ================= */
  animation: spin 1s linear infinite;
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
  /* ================= Layout ================= */
  display: flex;
  align-items: center;

  /* ================= Visual ================= */
  color: var(--color-text);
`;

const NewMessageNotification = styled.div`
  /* ================= Layout ================= */
  position: absolute;
  right: var(--space-3);
  bottom: calc(8rem + 1vh + var(--space-1));
  z-index: 1000;

  /* ================= Box Model ================= */
  padding: var(--space-1) var(--space-3);

  /* ================= Visual ================= */
  background-color: var(--emerald-green);
  color: var(--white);
  border-radius: var(--radius-12);
  box-shadow: var(--shadow-soft);

  /* ================= Interaction ================= */
  cursor: pointer;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    right: var(--space-4);
    bottom: calc(9rem + 1vh + var(--space-2));
    padding: var(--space-2) var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    right: var(--space-5);
    bottom: calc(11rem + 1vh + var(--space-2));
    padding: var(--space-2) var(--space-4);
  }
`;

// 连接状态提示组件
const ConnectionStatus = styled.div<{ $status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  position: fixed;
  top: 6vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;

  /* ================= Box Model ================= */
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);

  /* ================= Typography ================= */
  font-size: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    top: 7vh;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    top: 8vh;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-6);
    font-size: var(--space-4);
  }
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-medium);
  
  /* ================= Animation ================= */
  transition: all 0.3s ease-in-out;

  ${props => {
    switch (props.$status) {
      case 'connected':
        return 'background-color: var(--success-green); color: var(--white); opacity: 0; visibility: hidden;';
      case 'connecting':
        return 'background-color: var(--info-blue); color: var(--white);';
      case 'disconnected':
        return 'background-color: var(--error-red); color: var(--white);';
      case 'reconnecting':
        return 'background-color: var(--warning-orange); color: var(--white);';
      default:
        return 'background-color: var(--gray-400); color: var(--white);';
    }
  }}
`;

const StatusDot = styled.span<{ $status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' }>`
  /* ================= Box Model ================= */
  width: var(--space-2);
  height: var(--space-2);
  
  /* ================= Visual ================= */
  background-color: var(--white);
  border-radius: 50%;

  /* ================= Animation ================= */
  ${props => props.$status === 'connecting' || props.$status === 'reconnecting' ? `
    animation: pulse-dot 1.5s ease-in-out infinite;
  ` : ''}

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const IconWrapper = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* ================= Box Model ================= */
  width: 2.2rem;
  height: 2.2rem;
  margin: 0 var(--space-2);
  
  /* ================= Visual ================= */
  background-color: var(--white);
  border-radius: 50%;
  
  /* ================= Animation ================= */
  transition: all 0.2s ease-in-out;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    background-color: var(--gray-300);
  }
`;

const BotIcon = styled.img`
  /* ================= Layout ================= */
  display: block;
  
  /* ================= Box Model ================= */
  width: 1.6rem;
  height: 1.6rem;
  
  /* ================= Interaction ================= */
  cursor: pointer;
`;

const SendIcon = styled(LuSend)`
  /* ================= Layout ================= */
  display: block;
  
  /* ================= Typography ================= */
  font-size: 1.6rem;
  
  /* ================= Visual ================= */
  color: var(--black);
  
  /* ================= Interaction ================= */
  cursor: pointer;
`;

const IconContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  height: 2rem;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  padding: var(--space-2) var(--space-3);
  
  /* ================= Visual ================= */
  border-radius: var(--radius-12);
`;

const PopupContainer = styled.div`
  /* ================= Layout ================= */
  position: absolute;
  bottom: 100%;
  left: 3.75rem;
  transform: translateX(-25%);
  overflow-y: auto;
  z-index: 1000;
  
  /* ================= Box Model ================= */
  width: 15.625rem;
  max-height: 18.75rem;
  margin-bottom: var(--space-2);
  
  /* ================= Visual ================= */
  background: var(--white);
  border: 1px solid var(--emerald-green);
  border-radius: var(--radius-5);
  box-shadow: var(--shadow-soft);
`;

const PopupHeader = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  
  /* ================= Box Model ================= */
  padding: var(--space-3);
  
  /* ================= Visual ================= */
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
`;

const CloseButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2);
  
  /* ================= Typography ================= */
  font-size: 1.2rem;
  
  /* ================= Visual ================= */
  background: none;
  border: none;
  color: var(--color-text);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    background: var(--color-line);
    border-radius: 50%;
  }
`;

const BotList = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Visual ================= */
  color: var(--color-text);
`;

const BotItem = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-4);
  
  /* ================= Visual ================= */
  border-bottom: 1px solid var(--gray-100);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    background: var(--color-line);
  }
`;

const BotName = styled.span`
  /* ================= Typography ================= */
  font-size: var(--space-4);
`;

const AccessType = styled.span`
  /* ================= Typography ================= */
  font-size: var(--space-3);
  
  /* ================= Visual ================= */
  color: var(--muted-6b7280);
`;

// 消息提示组件
const NoMoreMessagesHint = styled.div`
  /* ================= Layout ================= */
  text-align: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2);
  
  /* ================= Visual ================= */
  color: var(--muted-6b7280);
`;

// @ 提及弹窗组件
const MentionPopup = styled.div<{ $top: number; $left: number }>`
  /* ================= Layout ================= */
  position: absolute;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  z-index: 1000;
  
  /* ================= Box Model ================= */
  min-width: 200px;
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
  
  /* ================= Visual ================= */
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const MentionHeader = styled.div`
  /* ================= Box Model ================= */
  padding: var(--space-2) var(--space-3);
  
  /* ================= Visual ================= */
  border-bottom: 1px solid var(--gray-100);
  
  /* ================= Typography ================= */
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-6b7280);
`;

const MentionItem = styled.div<{ $disabled?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2) var(--space-3);
  
  /* ================= Typography ================= */
  font-size: 0.875rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  /* ================= Visual ================= */
  border-bottom: 1px solid var(--gray-50);
  
  &:hover {
    background: ${props => props.$disabled ? 'transparent' : 'var(--gray-50)'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const MentionBotName = styled.span`
  /* ================= Typography ================= */
  font-weight: 500;
  color: var(--color-text);
`;

const MentionAccessType = styled.span`
  /* ================= Typography ================= */
  font-size: 0.75rem;
  color: var(--muted-6b7280);
`;

// 回复消息状态提示
const ReplyStatusHint = styled.div`
  /* ================= Layout ================= */
  margin-top: var(--space-2);
  
  /* ================= Typography ================= */
  font-size: var(--space-3);
  
  /* ================= Visual ================= */
  color: var(--gray-400);
`;

// Markdown 段落
const MarkdownParagraph = styled.p`
  /* ================= Box Model ================= */
  margin: 0.5em 0;
`;

// Markdown 代码
const MarkdownCode = styled.code`
  /* ================= Box Model ================= */
  padding: 2px var(--space-2);
  
  /* ================= Visual ================= */
  background-color: var(--color-line);
  border-radius: var(--radius-3);
`;

// Bot列表弹窗组件
const BotListPopUp: React.FC<MyRoomProps> = ({
  onClose,
  onBotSelect,
  groupId,
}) => {
  const { userInfo } = useUserInfo();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Use React Query hook with refetch on mount
  const { data: botsData, isLoading, refetch } = useGroupChatBotList(groupId);
  const bots = botsData?.code === 200 ? botsData.data : [];

  // 组件挂载时强制刷新数据（避免缓存问题）
  useEffect(() => {
    if (groupId) {
      refetch();
    }
  }, [groupId, refetch]);

  useEffect(() => {
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
  }, [groupId, userInfo?.userId]);

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

// WebSocket client cache
const clientCache = new Map<number, Stomp.Client | null>();

// 主组件
const MyRoom: React.FC<MyRoomProps> = ({ groupId }) => {
  const navigate = useNavigate();
  
  // 键盘高度（移动端适配）
  const [keyboardHeight, scrollToVisible] = useKeyboardInsets();

  // 状态管理
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUserInfo();
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
  
  // @ 提及相关状态
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const mentionStartIndexRef = useRef<number>(-1);
  
  // 获取 Bot 列表用于 @ 提及
  const { data: botsData, isLoading: isLoadingBots } = useGroupChatBotList(groupId);
  const bots = botsData?.code === 200 ? botsData.data : [];

  // 回复功能状态
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [showClearContextToast, setShowClearContextToast] = useState(false);
  const [contextClearedTimes, setContextClearedTimes] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupMode, setGroupMode] = useState<'free' | 'feedback'>('free');

  // Use React Query hook for clear history
  const { data: clearHistoryData } = useClearHistory(groupId);
  
  // Sync clear history data to state
  useEffect(() => {
    if (clearHistoryData?.code === 200 && clearHistoryData.data && clearHistoryData.data.length > 0) {
      setContextClearedTimes(clearHistoryData.data);
    } else {
      setContextClearedTimes([]);
    }
  }, [clearHistoryData]);

  // 连接状态管理
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // 埋点Hook
  const { handleTyping, handleSend: trackSend, handleMessageReceived } = useInputTracking(groupId);

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

  // Use React Query hook for group info
  const { data: groupInfoData } = useGroupInfo(groupId);
  
  // Sync group mode to state
  useEffect(() => {
    if (groupInfoData?.code === 200 && groupInfoData.data) {
      setGroupMode(groupInfoData.data.groupMode || 'free');
    } else {
      setGroupMode('free');
    }
  }, [groupInfoData]);

  // 检查用户是否已加入群组
  const hasCheckedRoleRef = useRef(false);
  useEffect(() => {
    if (!groupId || hasCheckedRoleRef.current) return;
    
    const checkUserRole = async () => {
      hasCheckedRoleRef.current = true;
      try {
        const response = await fetchUserRole(groupId);
        // 如果 code 不是 200 或 data 为空/undefined，说明用户未加入群组
        if (response.code !== 200 || !response.data) {
          alert('You have not joined this group. Please join the group first.');
          navigate('/search-rooms');
        }
      } catch (error) {
        // API 调用失败（如 401/403）也说明用户未加入或无权限
        alert('You have not joined this group. Please join the group first.');
        navigate('/search-rooms');
      }
    };
    
    checkUserRole();
  }, [groupId, navigate]);

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

  // Clear AI Context Mutation
  const clearAiContextMutation = useClearAIContext();

  // 清除AI上下文函数
  const handleClearContext = async () => {
    if (!groupId) return;
    
    try {
      const clearContextTime = new Date().toISOString();
      
      await clearAiContextMutation.mutateAsync({
        groupId,
        clearContextTime
      });
      
      // 添加新的清除时间到数组中
      setContextClearedTimes(prev => [...prev, clearContextTime]);
      
      // 显示成功提示
      setShowClearContextToast(true);
      setTimeout(() => {
        setShowClearContextToast(false);
      }, 3000);
      
      console.log('AI context cleared successfully');
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
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ['groupChatBotInfo', botId],
        queryFn: () => fetchGroupChatBotInfo(botId),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
      // API 返回的是 GetGroupChatBotInfoResponse，需要提取 data 字段
      return response.data;
    } catch (error) {
      console.error("Error fetching bots:", error);
      return {
        botId,
        botName: `Bot ${botId}`,
        accessType: 0,
      };
    }
  };

  // 获取用户信息
  const fetchUserInfo = async (userId: number): Promise<User> => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ['userInfoInGroup', userId],
        queryFn: () => fetchUserInfoInGroup(userId),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching group members:", error);
      return {
        userId,
        userName: `User ${userId}`,
        userPortrait: "/default-avatar.png",
        userEmail: "",
      };
    }
  };

  // 批量获取消息
  const fetchMultipleMessages = async (messageIds: number[]): Promise<Message[]> => {
    try {
      console.log('批量获取消息:', messageIds);
      const response = await fetchMsgByIds({
        groupId: groupId!,
        msgIds: messageIds
      });
      
      console.log('批量获取响应:', response);
      
      if (response.data && Array.isArray(response.data)) {
        const apiMessages = response.data;
        
        // 转换为组件 Message 类型
        const messages: Message[] = apiMessages.map(apiMsg => ({
          ...apiMsg,
          msgType: 0, // 默认消息类型
          name: apiMsg.name || '',
          portrait: apiMsg.portrait || '',
        }));
        
        // 批量处理发送者信息
        await Promise.all(
          messages.map(async (msg) => {
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
      const response = await fetchHistoryMsg({
        groupId: groupId!,
        lastMsgId: loadMore ? messages[0]?.infoId : -1,
        pageSize: 20,
      });

      const apiMessages = response.data;
      setHasNoMoreMessages(apiMessages.length < 20);
      
      // 转换为组件 Message 类型并处理用户/Bot信息
      const newMessages: Message[] = await Promise.all(
        apiMessages.map(async (apiMsg) => {
          let name = apiMsg.name || '';
          let portrait = apiMsg.portrait || '';
          
          if (apiMsg.senderType === "CHATBOT") {
            const botInfo = await fetchBotInfo(apiMsg.senderId);
            name = botInfo.botName;
            portrait = botIcon;
          } else {
            const userInfo = await fetchUserInfo(apiMsg.senderId);
            name = userInfo.userName;
            portrait = userInfo.userPortrait;
          }
          
          return {
            ...apiMsg,
            msgType: 0, // 默认消息类型
            name,
            portrait,
          };
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

    // 如果已经有连接且连接正常，复用
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
        console.log("切换房间，已断开之前的连接");
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
          const response = await fetchGroupMemberList(groupId!);
          if (response.code === 200) {
            membersCache.set(Number(groupId), response.data);
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

      isSubscribed = false;
      clearReconnectTimeout();

      // 注意: 不要在这里断开连接,因为我们使用了缓存
      // 连接会在切换房间时由manageWebSocketConnection管理
      // 或者在组件真正销毁时清理

      // 组件卸载时清理：
      // 1. 断开连接
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("✂️ 组件卸载,断开WebSocket");
        });

      }
      // 2.从缓存中移除，下次进入时会重新建立连接（避免复用旧订阅）
      if (groupId) {
        console.log(`从缓存中移除 (groupId: ${groupId}), 重新建立连接`);
        clientCache.delete(groupId);
      } 
      connectionStatusRef.current = {
        currentGroupId: null,
        connectionPromise: null,
        isConnecting: false,
      };
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

  const handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void = (e) => {
    const textarea = e.target;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart || 0;
    
    setInputMessage(value);
    setCursorPosition(cursorPos);
    textarea.scrollTop = textarea.scrollHeight;
    
    // 检测 @ 提及
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // 检查 @ 后面是否有空格（如果有空格，说明已经完成提及）
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt) {
        // 显示提及弹窗
        mentionStartIndexRef.current = lastAtIndex;
        setMentionQuery(textAfterAt.toLowerCase());
        setShowMentionPopup(true);
        
        // 计算弹窗位置在光标附近
        if (messageInputRef.current) {
          const coords = getCaretCoordinates(messageInputRef.current, lastAtIndex);
          const wrapperRect = messageInputRef.current.parentElement?.getBoundingClientRect();
          
          if (wrapperRect) {
            // 计算相对于 MessageInputWrapper 的位置
            const lineHeight = 24; // 一行的高度
            const relativeLeft = coords.left;
            const relativeTop = coords.top + lineHeight; // 在光标下方一行显示
            
            setMentionPosition({
              top: relativeTop,
              left: Math.min(relativeLeft, wrapperRect.width - 220) // 不要超出右边
            });
          }
        }
      } else {
        setShowMentionPopup(false);
        // 检查刚刚输入的内容是否完成了一个精准匹配（用户输入了空格）
        if (value.slice(cursorPos - 1, cursorPos) === ' ') {
          checkExactMentionMatch(value);
        }
      }
    } else {
      setShowMentionPopup(false);
      // 弹窗关闭时也检查一次精准匹配
      checkExactMentionMatch(value);
    }
  };
  
  // 获取 textarea 中字符的像素位置
  const getCaretCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = getComputedStyle(textarea);
    
    // 复制 textarea 的样式到 div
    div.style.cssText = `
      position: absolute;
      white-space: pre-wrap;
      word-wrap: break-word;
      visibility: hidden;
      font: ${style.font};
      padding: ${style.padding};
      border: ${style.border};
      width: ${textarea.clientWidth}px;
      line-height: ${style.lineHeight};
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      letter-spacing: ${style.letterSpacing};
    `;
    
    // 设置内容到光标位置
    const textBeforeCursor = textarea.value.slice(0, position);
    const textNode = document.createTextNode(textBeforeCursor);
    const span = document.createElement('span');
    span.textContent = textarea.value.slice(position) || '.';
    
    div.appendChild(textNode);
    div.appendChild(span);
    document.body.appendChild(div);
    
    const { offsetLeft: left, offsetTop: top } = span;
    document.body.removeChild(div);
    
    return { left, top };
  };

  // 处理选择提及的 Bot
  const handleMentionSelect = (botName: string, botId: number, accessType: number) => {
    if (accessType === 0 && !isAdmin) {
      alert("Only admins can mention this bot");
      return;
    }
    
    if (mentionStartIndexRef.current !== -1) {
      const beforeMention = inputMessage.slice(0, mentionStartIndexRef.current);
      const afterQuery = inputMessage.slice(cursorPosition);
      
      setInputMessage(`${beforeMention}@${botName} ${afterQuery}`);
      setSelectedBot(botId); // 保存选中的 botId
      setShowMentionPopup(false);
      mentionStartIndexRef.current = -1;
      
      // 聚焦输入框
      setTimeout(() => {
        if (messageInputRef.current) {
          const newCursorPos = beforeMention.length + botName.length + 2; // +2 for @ and space
          messageInputRef.current.selectionStart = newCursorPos;
          messageInputRef.current.selectionEnd = newCursorPos;
          messageInputRef.current.focus();
        }
      }, 0);
    }
  };
  
  // 检测输入文本中是否有精准匹配的 @BotName，自动设置 botId
  const checkExactMentionMatch = useCallback((text: string) => {
    // 查找所有 @BotName 模式
    const mentionPattern = /@([\w\u4e00-\u9fa5]+)/g;
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
      const botName = match[1];
      const matchedBot = bots.find(b => b.botName === botName);
      
      if (matchedBot) {
        // 精准匹配上了，设置选中的 bot
        console.log(`自动匹配到 Bot: ${matchedBot.botName} (ID: ${matchedBot.botId})`);
        setSelectedBot(matchedBot.botId);
      }
    }
  }, [bots]);
  
  // 点击外部关闭提及弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMentionPopup) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-mention-popup]')) {
          setShowMentionPopup(false);
          // 关闭弹窗时检查是否有精准匹配
          checkExactMentionMatch(inputMessage);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentionPopup, inputMessage, checkExactMentionMatch]);

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

      <RenderedChatContainer ref={chatContainerRef} onScroll={handleScroll}>
        {hasNoMoreMessages && (
          <NoMoreMessagesHint>
            No more messages
          </NoMoreMessagesHint>
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
                  $clickable={!!msg.replyToMessage && !msg.replyLoading}
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
                    <ReplyStatusHint>
                      该消息未加载，无法跳转
                    </ReplyStatusHint>
                  )}
                </ReplyPreview>
              )}
              
              <MessageText>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    p: (props) => (
                      <MarkdownParagraph {...props} />
                    ),
                    code: (props) => (
                      <MarkdownCode {...props} />
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
        
        <MessageInputWrapper $disabled={connectionStatus !== 'connected'} $keyboardHeight={keyboardHeight}>

          <MessageInput
            $disabled={isLoading || connectionStatus !== 'connected'}
            $isReplying={!!replyingTo}
            ref={messageInputRef}
            value={inputMessage}
            onFocus={scrollToVisible}
            onChange={(e) => {
              handleInputChange(e);
              handleTyping(e.target.value);
            }}
            onKeyDown={e => {
              // ESC 键关闭提及弹窗
              if (e.key === "Escape" && showMentionPopup) {
                e.preventDefault();
                setShowMentionPopup(false);
                return;
              }
              
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
          
          {/* @ 提及弹窗 */}
          {showMentionPopup && groupMode === 'free' && (
            <MentionPopup $top={mentionPosition.top} $left={mentionPosition.left} data-mention-popup>
              <MentionHeader>
                Available Bots
                {isLoadingBots && <span style={{ marginLeft: '8px' }}>加载中...</span>}
              </MentionHeader>
              {bots
                .filter(bot => bot.botName.toLowerCase().includes(mentionQuery))
                .map(bot => (
                  <MentionItem
                    key={bot.botId}
                    $disabled={bot.accessType === 0 && !isAdmin}
                    onClick={() => handleMentionSelect(bot.botName, bot.botId, bot.accessType)}
                  >
                    <MentionBotName>@{bot.botName}</MentionBotName>
                    <MentionAccessType>
                      ({bot.accessType === 0 ? 'Admin Only' : 'Public'})
                    </MentionAccessType>
                  </MentionItem>
                ))}
              {bots.filter(bot => bot.botName.toLowerCase().includes(mentionQuery)).length === 0 && (
                <MentionItem $disabled>
                  <MentionBotName style={{ color: 'var(--muted-6b7280)' }}>
                    没有匹配的 Bot
                  </MentionBotName>
                </MentionItem>
              )}
            </MentionPopup>
          )}
          
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