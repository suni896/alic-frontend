import React from "react";
import styled from "styled-components";

// 重用你定义的样式

// type LabeledInputWithCountProps
type LabeledInputWithCountProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "password" | "number" | "textarea";
  showCount?: boolean;
  variant?: 'default' | 'withIcon' | 'unstyled'; // 新增 'unstyled'
};

const StyledTextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  background-color: var(--input-bg);
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: vertical;
  min-height: 6rem;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "var(--error-red)" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px ${(props) =>
      props.$hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: var(--input);
    font-size: 0.8rem;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }
`;
interface ModalInputProps {
    $hasError?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'withIcon' | 'unstyled';
}

const ModalInput = styled.input<ModalInputProps>`
  width: 100%;
  height: 100%;
  ${props => props.variant === 'unstyled' ? 'flex: 1; min-width: 0;' : ''}
  padding: ${props => props.variant === 'unstyled' ? '0' : '0.875rem 1rem'};
  font-size: var(--space-4);
  font-family: var(--font--roboto);
  border: ${props => props.variant === 'unstyled' ? 'none' : `0px solid ${props.$hasError ? "var(--error-red)" : "#e5e7eb"}`};
  background-color: ${props => props.variant === 'unstyled' ? 'transparent' : '#f9fafb'};
  transition: all 0.2s ease;
  box-sizing: border-box;
  padding-left: ${props => props.variant === 'withIcon' ? '2.5rem' : (props.variant === 'unstyled' ? '0' : '1rem')};
  ${props => props.variant === 'unstyled' ? `
    line-height: 3rem;   /* 与 Navbar 搜索容器高度一致，文本垂直居中 */
  ` : ''}

  &:focus {
    outline: none;
    ${props => props.variant === 'unstyled'
      ? `
        background-color: transparent;
        box-shadow: none;
      `
      : `
        border-color: ${props.$hasError ? "var(--error-red)" : "#016532"};
        background-color: white;
        box-shadow: 0 0 0 3px ${props.$hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
      `
    }
  }

  &::placeholder {
    color: var(--input);
    font-size: 0.8rem;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    ${props => props.variant === 'unstyled' ? 'padding: 0;' : 'padding: 0.75rem 0.875rem;'}
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-red);
  font-size: 0.875rem;
  font-family: 'Roboto', sans-serif;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: "⚠";
    font-size: 0.75rem;
  }
`;

const CharacterCount = styled.div`
  font-size: 0.75rem;
  color: var(--muted-6b7280);
  text-align: right;
  margin-top: 0.25rem;
  font-family: 'Roboto', sans-serif;
`;





const LabeledInputWithCount: React.FC<LabeledInputWithCountProps> = ({
  value,
  onChange,
  onKeyPress,
  error,
  maxLength = 100,
  placeholder = "",
  disabled = false,
  type = "text",
  showCount = true,
  variant = "default",
}) => {
  const commonProps = {
    value,
    onChange,
    onKeyPress,
    placeholder,
    maxLength,
    disabled,
    $hasError: !!error,
    variant,
  };

  return (
    <div style={variant === 'unstyled' ? {
      width: '100%',
      height: '100%',
      display: 'flex',        /* 容器使用 flex */
      alignItems: 'center',   /* 子元素垂直居中 */
    } : undefined}>
      {type === "textarea" ? (
        <StyledTextArea {...commonProps} />
      ) : (
        <ModalInput type={type} {...commonProps} />
      )}

      {showCount && maxLength && (
        <CharacterCount>
          {value.length}/{maxLength}
        </CharacterCount>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default LabeledInputWithCount;