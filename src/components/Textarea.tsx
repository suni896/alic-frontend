import React, { useEffect, useRef } from "react";
import styled from "styled-components";

interface InputProps {
    $hasError?: boolean;
}

const SmallTextarea = styled.textarea<InputProps>`
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  margin: 0;
  height: 2.5rem;
  min-height: 2.5rem;
  max-height: 10rem;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
  border: 2px solid ${(props) => (props.$hasError ? "var(--error-red)" : "#e5e7eb")};
  border-radius: 12px;
  color: #1f2937;
  background-color: #f9fafb;
  outline: none;
  transition: all 0.2s ease;
  line-height: 1.4;
  
  /* 确保垂直对齐 */
  vertical-align: top;
  
  /* 移除默认的 textarea 样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:focus {
    border-color: ${(props) => (props.$hasError ? "var(--error-red)" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: var(--input);
    line-height: 1.4;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 800px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
    height: 2.25rem;
    min-height: 2.25rem;
    max-height: 8rem;
  }

  @media (max-width: 600px) {
    font-size: 0.7rem;
    height: 2rem;
    min-height: 2rem;
    max-height: 6rem;
  }
`;

// 自动调整高度的 Textarea 组件
const AutoResizeTextarea: React.FC<{
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  hasError: boolean;
  disabled?: boolean;
}> = ({ name, placeholder, value, onChange, onBlur, hasError, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度为 auto 以获取实际内容高度
      textarea.style.height = 'auto';
      
      // 基础高度 (2.5rem = 40px)
      const baseHeight = 40;
      // 内容高度
      const contentHeight = textarea.scrollHeight;
      // 最大高度 (10rem = 160px)
      const maxHeight = 160;
      
      // 确保至少保持与 SmallInput 相同的基础高度
      const newHeight = Math.max(baseHeight, Math.min(contentHeight, maxHeight));
      
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  // 组件挂载时也调整高度
  useEffect(() => {
    adjustHeight();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    // 使用 setTimeout 确保 DOM 更新后再调整高度
    setTimeout(() => adjustHeight(), 0);
  };

  return (
    <SmallTextarea
      ref={textareaRef}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      $hasError={hasError}
      disabled={disabled}
    />
  );
};
export default AutoResizeTextarea;