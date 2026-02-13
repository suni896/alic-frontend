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
  flex: 0 0 auto;
  padding: var(--space-3) var(--space-5);             /* px-4 py-2 */
  font-family: var(--font-sans);
  font-size: var(--space-10);
  font-weight: var(--weight-medium);                 /* font-bold */
  border-radius: var(--radius-5);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  position: relative;
  height: 2rem;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:focus {
    outline: none;
    box-shadow: none;
  }
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
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
`;

// 取消按钮（白底、绿色字、圆角更大 rounded-xl）
const CancelButton = styled(BaseButton)`
  background-color: var(--white);
  color: var(--emerald-green);                   /* emerald-400 */
  border-color: var(--emerald-green);
  border-radius: var(--radius-5);           /* rounded-xl */

  &:hover:not(:disabled) {
    background-color: var(--emerald-green-50);      /* emerald-50 */
    border-color: var(--emerald-green-600);          /* emerald-500 */
  }
  &:active:not(:disabled) {
    background-color: var(--emerald-green-100);      /* emerald-100 */
  }
`;

// 创建按钮（主按钮：绿色底、白字、rounded-md）
const CreateButton = styled(BaseButton)`
  background-color: var(--emerald-green);        /* emerald-400 */
  color: white;
  border-color: var(--emerald-green);            /* 与底色一致 */
  border-radius: var(--radius-5);          /* rounded-md */

  &:hover:not(:disabled) {
    background-color: var(--emerald-green-600);      /* emerald-500 */
    border-color: var(--emerald-green-600);
  }
  &:active:not(:disabled) {
    background-color: var(--emerald-green-600);      /* emerald-600 */
    border-color: var(--emerald-green-600);
  }
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