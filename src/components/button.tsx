import styled, { keyframes, css } from "styled-components";
import React from "react";

// 加载动画
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Spinner 小圆圈
const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: ${spin} 0.6s linear infinite;
  margin-right: 0.5rem;
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "cancel";
  children: React.ReactNode;
  $isEditMode?: boolean;
  $isLoading?: boolean;
}

// 抽象样式的 props
interface StyledButtonProps {
  $isEditMode?: boolean;
  $isLoading?: boolean;
}

// 基础按钮样式
const BaseButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  flex-shrink: 1;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  outline: none;
  position: relative;
  height: 100%;

  width: 8rem;
  min-width: 8rem;
  max-width: 8rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 移除所有focus相关的默认样式 */
  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  /* 移除点击时的默认样式 */
  &:active {
    outline: none;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      background-color: #999 !important;
      color: white;
      pointer-events: none;
    `}

  @media (max-width: 500px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;

// 取消按钮
const CancelButton = styled(BaseButton)`
  background-color: #f8fafc;
  color: #374151;
  border-color: #e5e7eb;

  &:hover:not(:disabled) {
    background-color: #f1f5f9;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// 创建按钮（主按钮）
const CreateButton = styled(BaseButton)`
  background-color: #386641;
  color: white;
  border-color: #386641;

  &:hover:not(:disabled) {
    background-color: #2e573e;
    border-color: #2e573e;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(56, 102, 65, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  ${({ $isEditMode, $isLoading }) =>
    $isEditMode &&
    !$isLoading &&
    css`
      box-shadow: 0 0 0 3px rgba(56, 102, 65, 0.4);
    `}
`;

// 通用按钮组件
const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  $isEditMode,
  $isLoading,
  ...props
}) => {
  const StyledButton = variant === "cancel" ? CancelButton : CreateButton;

  return (
    <StyledButton
      {...props}
      $isEditMode={$isEditMode}
      $isLoading={$isLoading}
      disabled={$isLoading || props.disabled}
    >
      {$isLoading && <Spinner />}
      {children}
    </StyledButton>
  );
};

export default Button;