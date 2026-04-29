/**
 * AI Trace Panel
 *
 * 主面板：消息列表 + 滚动加载更多 + 空态/错误态
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAITraces } from '../../hooks/queries/useAITrace';
import type { ChatMessageVO, AITraceDetailVO } from '../../types/aiTrace';
import AITraceMessageItem from './AITraceMessageItem';

// ==================== Types ====================

interface AITracePanelProps {
  groupId: number;
}

// ==================== Styled Components ====================

const Container = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 100%;
  height: 100vh;
  padding: var(--space-3);
  box-sizing: border-box;

  /* ================= Visual ================= */
  background: var(--white);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-4) var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-5) var(--space-8);
  }
`;

const Header = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;

  /* ================= Box Model ================= */
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);

  /* ================= Visual ================= */
  border-bottom: 1px solid var(--gray-200);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
  }
`;

const BackButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;

  /* ================= Box Model ================= */
  padding: var(--space-1);

  /* ================= Visual ================= */
  background: none;
  border: none;
  color: var(--color-text);

  /* ================= Typography ================= */
  font-size: var(--space-6);

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    color: var(--emerald-green);
  }
`;

const HeaderTitle = styled.h1`
  /* ================= Layout ================= */
  margin: 0;

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-5);
  font-weight: var(--weight-bold);
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-6);
  }
`;

const HeaderSubTitle = styled.span`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  color: var(--muted-6b7280);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const MessageList = styled.div`
  /* ================= Layout ================= */
  flex: 1;
  overflow-y: auto;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-2);

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

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-3);
  }
`;

const LoadingIndicator = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;

  /* ================= Box Model ================= */
  padding: var(--space-4);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  color: var(--muted-6b7280);
`;

const EmptyState = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* ================= Box Model ================= */
  height: 100%;
  gap: var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  color: var(--muted-6b7280);
`;

const ErrorState = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* ================= Box Model ================= */
  height: 100%;
  gap: var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  color: var(--error-red);
`;

// ==================== Component ====================

const AITracePanel: React.FC<AITracePanelProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useAITraces(groupId);

  // 合并所有页的消息和 traces
  // API 每页返回倒序，需要 reverse 后按正序渲染
  const { messages, traces } = useMemo(() => {
    if (!data) return { messages: [] as ChatMessageVO[], traces: {} as Record<string, AITraceDetailVO> };

    const allMessages: ChatMessageVO[] = [];
    const allTraces: Record<string, AITraceDetailVO> = {};

    // pages 是按请求顺序排列的：第一页是最新消息，后续页是更旧的消息
    // 所以我们需要把每页 reverse 后，按旧→新顺序拼接
    const pages = data.pages;
    for (let i = pages.length - 1; i >= 0; i--) {
      const page = pages[i];
      // 每页内部 reverse：从旧到新
      allMessages.push(...[...page.messages].reverse());
      Object.assign(allTraces, page.traces);
    }

    return { messages: allMessages, traces: allTraces };
  }, [data]);

  // 滚动加载更多
  const handleScroll = useCallback(() => {
    const container = listRef.current;
    if (!container) return;

    // 滚动到顶部附近时加载更多（更旧的消息）
    if (container.scrollTop < 300 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeight.current = container.scrollHeight;
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 加载更多后保持滚动位置
  useEffect(() => {
    const container = listRef.current;
    if (!container || !isFetchingNextPage) return;

    const observer = new MutationObserver(() => {
      const newScrollHeight = container.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeight.current;
      if (heightDiff > 0) {
        container.scrollTop = heightDiff;
        observer.disconnect();
      }
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isFetchingNextPage]);

  // 首次加载后滚动到底部（最新消息）
  useEffect(() => {
    const container = listRef.current;
    if (container && messages.length > 0 && !isFetchingNextPage && data?.pages.length === 1) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, isFetchingNextPage, data?.pages.length]);

  if (isLoading) {
    return (
      <Container>
        <LoadingIndicator>Loading AI Traces...</LoadingIndicator>
      </Container>
    );
  }

  if (isError) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to load AI Traces';
    const isForbidden = errorMsg.includes('403') || errorMsg.toLowerCase().includes('whitelist');
    return (
      <Container>
        <ErrorState>
          {isForbidden ? (
            <>You are not in the AI Trace whitelist</>
          ) : (
            <>
              <div>Error loading AI Traces</div>
              <div style={{ fontSize: 'var(--space-3)', color: 'var(--muted-6b7280)' }}>{errorMsg}</div>
            </>
          )}
        </ErrorState>
      </Container>
    );
  }

  if (messages.length === 0) {
    return (
      <Container>
        <EmptyState>
          <div>No messages found</div>
          <div style={{ fontSize: 'var(--space-3)' }}>This group has no chat history yet.</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Go back">
          <MdKeyboardArrowLeft />
        </BackButton>
        <HeaderTitle>AI Trace</HeaderTitle>
        <HeaderSubTitle>Group #{groupId}</HeaderSubTitle>
      </Header>

      <MessageList ref={listRef} onScroll={handleScroll}>
        {isFetchingNextPage && (
          <LoadingIndicator>Loading more...</LoadingIndicator>
        )}

        {messages.map((msg) => (
          <AITraceMessageItem
            key={msg.infoId}
            message={msg}
            trace={traces[msg.infoId.toString()]}
          />
        ))}
      </MessageList>
    </Container>
  );
};

export default AITracePanel;
