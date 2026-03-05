import React, { useEffect, useRef } from "react";
import styled from "styled-components";

interface InputProps {
    $hasError?: boolean;
}

// 与 SharedComponents.tsx 中的 StyledInput 样式保持一致
const SmallTextarea = styled.textarea<InputProps>`
  /* 水平 padding 保持，垂直 padding 减小 */
  padding: 0.5rem var(--space-4);
  font-size: var(--space-10);
  color: var(--slate-grey);
  min-height: 2.5rem;
  height: 2.5rem;
  max-height: 10rem;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: var(--font-sans);
  border: 1px solid ${(props) => (props.$hasError ? "var(--error-red)" : "var(--input-bg)")};
  border-radius: var(--radius-5);
  background-color: var(--input-bg);
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
  line-height: 1.5;
  vertical-align: top;
  
  /* 移除默认的 textarea 样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "var(--error-red)" : "var(--emerald-green)")};
  }


  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
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
      
      // 确保至少保持基础高度
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
