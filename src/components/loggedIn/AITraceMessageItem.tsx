/**
 * AI Trace Message Item
 *
 * 单条消息展示 + 可选的 AI Trace 展开按钮
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaRobot, FaUser } from 'react-icons/fa';
import type { ChatMessageVO, AITraceDetailVO } from '../../types/aiTrace';
import AITraceDetailCard from './AITraceDetailCard';

// ==================== Types ====================

interface AITraceMessageItemProps {
  message: ChatMessageVO;
  trace?: AITraceDetailVO;
}

// ==================== Styled Components ====================

const Container = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 100%;
  margin-bottom: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-bottom: var(--space-4);
  }
`;

const MessageRow = styled.div<{ $isUser: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: flex-start;
  flex-direction: ${(props) => (props.$isUser ? 'row-reverse' : 'row')};

  /* ================= Box Model ================= */
  gap: var(--space-2);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
  }
`;

const Avatar = styled.div<{ $isUser: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* ================= Box Model ================= */
  width: 2rem;
  height: 2rem;

  /* ================= Visual ================= */
  background: ${(props) => (props.$isUser ? 'var(--blue-100)' : 'var(--green-100)')};
  border-radius: 50%;
  color: ${(props) => (props.$isUser ? 'var(--blue-600)' : 'var(--green-600)')};

  /* ================= Typography ================= */
  font-size: var(--space-4);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: var(--space-5);
  }
`;

const Bubble = styled.div<{ $isUser: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  max-width: 80%;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-1);

  /* ================= Visual ================= */
  background: ${(props) => (props.$isUser ? 'var(--blue-50)' : 'var(--white)')};
  border: 1px solid ${(props) => (props.$isUser ? 'var(--blue-200)' : 'var(--gray-200)')};
  border-radius: ${(props) => (props.$isUser ? 'var(--radius-5) 0 var(--radius-5) var(--radius-5)' : '0 var(--radius-5) var(--radius-5) var(--radius-5)')};

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    max-width: 70%;
    padding: var(--space-3) var(--space-4);
  }
`;

const SenderName = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const MessageText = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);
  line-height: 1.5;
  color: var(--slate-grey);
  word-break: break-word;
  white-space: pre-wrap;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const MessageTime = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--muted-6b7280);
`;

const TraceToggle = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;

  /* ================= Box Model ================= */
  gap: var(--space-1);
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);

  /* ================= Visual ================= */
  background: var(--emerald-green);
  color: var(--white);
  border: none;
  border-radius: var(--radius-5);

  /* ================= Animation ================= */
  transition: background 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    background: var(--emerald-green-600);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
    padding: var(--space-2) var(--space-4);
  }
`;

// ==================== Component ====================

const AITraceMessageItem: React.FC<AITraceMessageItemProps> = ({ message, trace }) => {
  const isUser = message.senderType === 'USER';
  const [traceOpen, setTraceOpen] = useState(false);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString();
  };

  return (
    <Container>
      <MessageRow $isUser={isUser}>
        <Avatar $isUser={isUser}>
          {isUser ? <FaUser /> : <FaRobot />}
        </Avatar>
        <Bubble $isUser={isUser}>
          <SenderName>{message.senderName}</SenderName>
          <MessageText>{message.content}</MessageText>
          <MessageTime>{formatTime(message.createTime)}</MessageTime>
        </Bubble>
      </MessageRow>

      {trace && (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding: `0 ${isUser ? '0' : '2.5rem'}` }}>
          <TraceToggle onClick={() => setTraceOpen(!traceOpen)}>
            {traceOpen ? <FiChevronUp /> : <FiChevronDown />}
            {traceOpen ? 'Hide AI Trace' : 'Show AI Trace'}
          </TraceToggle>
        </div>
      )}

      {trace && traceOpen && (
        <div style={{ paddingLeft: isUser ? '0' : '2.5rem', paddingRight: isUser ? '2.5rem' : '0' }}>
          <AITraceDetailCard trace={trace} />
        </div>
      )}
    </Container>
  );
};

export default AITraceMessageItem;
