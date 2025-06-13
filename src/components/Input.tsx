import React from "react";
import styled from "styled-components";

// 重用你定义的样式

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
  variant?: 'default' | 'withIcon';
};

const StyledTextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  border: 2px solid ${(props) => (props.hasError ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: vertical;
  min-height: 6rem;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#ef4444" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px ${(props) =>
      props.hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }
`;
interface ModalInputProps {
    hasError?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'withIcon';
  }
  
const ModalInput = styled.input<ModalInputProps>`
  width: 100%;
  height: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  border: 2px solid ${(props) => (props.hasError ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  box-sizing: border-box;
  padding-left: ${(props) => (props.variant === 'withIcon' ? '2.5rem' : '1rem')};

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#ef4444" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px ${(props) => 
      props.hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
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
  color: #6b7280;
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
    hasError: !!error,
    variant,
  };

  return (
    <div>
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