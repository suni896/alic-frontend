/**
 * AI Trace Detail Card
 *
 * 展示单轮 AI Trace 的完整详情：
 * - Environment State
 * - Manager IO
 * - State Analyzer IO
 * - Assistant IOs
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { AITraceDetailVO, LLMContextLogVO, EnvStateVO } from '../../types/aiTrace';

// ==================== Types ====================

interface AITraceDetailCardProps {
  trace: AITraceDetailVO;
}

// ==================== Styled Components ====================

const Card = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: var(--space-3);

  /* ================= Visual ================= */
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-8);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-4);
    gap: var(--space-3);
  }
`;

const SectionHeader = styled.button<{ $isOpen: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-2) var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);

  /* ================= Visual ================= */
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-5);
  color: var(--color-text);

  /* ================= Animation ================= */
  transition: all 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    border-color: var(--emerald-green);
    background: var(--green-50);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
    padding: var(--space-3) var(--space-4);
  }
`;

const SectionContent = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);

  /* ================= Visual ================= */
  background: var(--white);
  border-radius: var(--radius-5);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-3) var(--space-4);
  }
`;

const MetaRow = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  /* ================= Box Model ================= */
  gap: var(--space-2);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--muted-6b7280);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const MetaBadge = styled.span<{ $type?: 'success' | 'error' | 'info' }>`
  /* ================= Box Model ================= */
  padding: var(--space-1) var(--space-2);

  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-medium);

  /* ================= Visual ================= */
  border-radius: var(--radius-3);
  background: ${(props) => {
    switch (props.$type) {
      case 'success': return 'var(--green-100)';
      case 'error': return 'var(--red-100)';
      case 'info': return 'var(--blue-100)';
      default: return 'var(--gray-100)';
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case 'success': return 'var(--green-700)';
      case 'error': return 'var(--red-700)';
      case 'info': return 'var(--blue-700)';
      default: return 'var(--slate-grey)';
    }
  }};
`;

const FieldLabel = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  color: var(--color-text);

  /* ================= Box Model ================= */
  margin-top: var(--space-2);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const CodeBlock = styled.pre<{ $collapsed?: boolean }>`
  /* ================= Box Model ================= */
  max-height: ${(props) => (props.$collapsed ? '6rem' : '30rem')};
  padding: var(--space-3);
  margin: var(--space-1) 0 0 0;
  overflow: auto;

  /* ================= Typography ================= */
  font-family: var(--font-mono, monospace);
  font-size: var(--space-3);
  line-height: 1.5;
  color: var(--slate-grey);

  /* ================= Visual ================= */
  background: var(--gray-100);
  border-radius: var(--radius-5);
  white-space: pre-wrap;
  word-break: break-word;

  /* ================= Animation ================= */
  transition: max-height 0.3s ease;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const ToggleTextButton = styled.button`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  color: var(--emerald-green);

  /* ================= Visual ================= */
  background: none;
  border: none;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

// ==================== Sub-components ====================

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <>
      <SectionHeader $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </SectionHeader>
      {isOpen && <SectionContent>{children}</SectionContent>}
    </>
  );
};

const PromptField: React.FC<{
  label: string;
  content: string;
}> = ({ label, content }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 300;
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <CodeBlock $collapsed={!expanded && isLong}>{content}</CodeBlock>
      {isLong && (
        <ToggleTextButton onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </ToggleTextButton>
      )}
    </>
  );
};

const IOPanel: React.FC<{
  io: LLMContextLogVO;
  agentName: string;
}> = ({ io, agentName }) => {
  const statusType = io.status === 'SUCCESS' ? 'success' : io.status === 'ERROR' ? 'error' : 'info';
  return (
    <>
      <MetaRow>
        <MetaBadge $type="info">{agentName}</MetaBadge>
        <MetaBadge $type={statusType}>{io.status}</MetaBadge>
        <span>Tokens: {io.inputTokens} → {io.outputTokens} ({io.totalTokens})</span>
        <span>Time: {(io.executionTimeMs / 1000).toFixed(2)}s</span>
      </MetaRow>
      {io.modelConfig && (
        <MetaRow>
          <span>Config: {io.modelConfig}</span>
        </MetaRow>
      )}
      <PromptField label="System Prompt" content={io.systemPrompt} />
      <PromptField label="User Prompt" content={io.userPrompt} />
      <PromptField label="LLM Response" content={io.llmResponse} />
      {io.parsedResponse && io.parsedResponse !== io.llmResponse && (
        <PromptField label="Parsed Response" content={io.parsedResponse} />
      )}
      {io.errorMessage && (
        <>
          <FieldLabel>Error</FieldLabel>
          <CodeBlock>{io.errorMessage}</CodeBlock>
        </>
      )}
    </>
  );
};

const EnvStatePanel: React.FC<{
  envState: EnvStateVO;
}> = ({ envState }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = envState.rawJson.length > 300;
  return (
    <>
      <MetaRow>
        <MetaBadge>Snapshot #{envState.snapshotId}</MetaBadge>
        <span>Profile: {envState.profileId}</span>
        {envState.currentPhase && <MetaBadge $type="info">{envState.currentPhase}</MetaBadge>}
      </MetaRow>
      <CodeBlock $collapsed={!expanded && isLong}>{envState.rawJson}</CodeBlock>
      {isLong && (
        <ToggleTextButton onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </ToggleTextButton>
      )}
    </>
  );
};

// ==================== Main Component ====================

const AITraceDetailCard: React.FC<AITraceDetailCardProps> = ({ trace }) => {
  return (
    <Card>
      <CollapsibleSection title="State Analyzer IO" defaultOpen={false}>
        <IOPanel io={trace.stateAnalyzerIO} agentName="State Analyzer" />
      </CollapsibleSection>

      <CollapsibleSection title="Environment State" defaultOpen={false}>
        <EnvStatePanel envState={trace.envState} />
      </CollapsibleSection>

      <CollapsibleSection title="Manager IO" defaultOpen={false}>
        <IOPanel io={trace.managerIO} agentName="Manager" />
      </CollapsibleSection>

      {trace.assistantIOs && trace.assistantIOs.length > 0 && (
        <CollapsibleSection title={`Assistant IOs (${trace.assistantIOs.length})`} defaultOpen={false}>
          {trace.assistantIOs.map((io, index) => (
            <IOPanel key={io.logId} io={io} agentName={`Assistant #${index + 1}`} />
          ))}
        </CollapsibleSection>
      )}
    </Card>
  );
};

export default AITraceDetailCard;
