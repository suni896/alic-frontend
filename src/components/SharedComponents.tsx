import React, { useState } from "react";
import styled from "styled-components";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

// Title
export const Title = styled.h1`
  /* ================= Layout ================= */
  text-align: left;

  /* ================= Box Model ================= */
  margin: 0 0 var(--space-9) 0;

  /* ================= Typography ================= */
  font-size: var(--space-6);
  font-family: var(--font-sans);
  font-weight: var(--weight-bold);
  text-decoration: none;

  /* ================= Visual ================= */
  color: var(--primary-text);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-7);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-8);
  }
`;

export const RoomList = styled.ul`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-2);
  margin: 0;

  /* ================= Visual ================= */
  background-color: var(--color-card);
  border: 1px solid var(--color-card);
  border-radius: var(--radius-5);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 90%;
    padding: var(--space-3);
    margin: 0 var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 90%;
    padding: var(--space-3);
    margin: 0 var(--space-3);
  }
`;

export const RoomContainer = styled.div<{ $isActive?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  width: 100%;
  min-height: var(--space-6);
  padding: var(--space-2);

  /* ================= Visual ================= */
  background-color: var(--color-card);
  border-radius: var(--radius-5);

  /* ================= Animation ================= */
  transition: background-color 0.2s ease;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 85%;
    padding: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 85%;
    padding: var(--space-3);
  }

  ${({ $isActive }) =>
    $isActive &&
    `
      background-color: var(--color-line);
    `}

  &:hover {
    background-color: var(--color-line);
  }

  &:hover svg {
    color: var(--emerald-green);
  }

  &:hover p {
    color: var(--emerald-green);
  }

  /* ================= Interaction ================= */
  cursor: pointer;
`;

export const RoomInfoContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  width: 100%;
  min-width: 0;
  padding: 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 98%;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 98%;
  }
`;

export const RoomTitle = styled.p`
  /* ================= Layout ================= */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* ================= Box Model ================= */
  width: 100%;
  max-width: 100%;
  margin: 0 0 var(--space-2) 0;
  
  /* ================= Typography ================= */
  font-size: var(--space-10);
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);
  line-height: var(--space-5);
  
  /* ================= Visual ================= */
  color: var(--color-text);
  
  /* ================= Animation ================= */
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--emerald-green);
  }
`;

export const RoomDesc = styled.p`
  /* ================= Layout ================= */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* ================= Box Model ================= */
  width: 100%;
  margin: 0;
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto-serif);
  font-size: var(--space-4);
  line-height: var(--space-6);
  
  /* ================= Visual ================= */
 color: var(--color-text);
  
  &:hover {
    color: var(--emerald-green);
  }
`;

// 共享的ConfirmationText组件
export const ConfirmationText = styled.p`
  /* ================= Layout ================= */
  text-align: left;

  /* ================= Box Model ================= */
  margin: var(--space-3) 0 0 0;

  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
    margin: var(--space-4) 0 0 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
    margin: var(--space-4) 0 0 0;
  }
`;

export const ErrorMessage = styled.p`
  /* ================= Layout ================= */
  text-align: left;

  /* ================= Box Model ================= */
  margin: 0;

  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);

  /* ================= Visual ================= */
  color: var(--error-red);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

// 共享的EmailHighlight组件
export const EmailHighlight = styled.span`
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);

  /* ================= Visual ================= */
  color: var(--emerald-green);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

// 共享的CodeInputContainer组件
export const CodeInputContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  margin: var(--space-2) 0 0 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
    margin: var(--space-3) 0 0 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-3);
    margin: var(--space-3) 0 0 0;
  }
`;

// 共享的CodeInput组件
export const CodeInput = styled.input`
  /* ================= Layout ================= */
  text-align: center;

  /* ================= Box Model ================= */
  width: 2rem;
  height: 2rem;

  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-bold);

  /* ================= Visual ================= */
  background: var(--white);
  color: var(--color-text);
  border: 1px solid var(--emerald-green);
  border-radius: var(--radius-5);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 3rem;
    height: 3rem;
    font-size: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 3rem;
    height: 3rem;
    font-size: var(--space-6);
  }

  &:focus {
    outline: none;
    border-color: var(--emerald-green);
  }
`;

// 新增：共享的 FieldGroup 容器
export const FieldGroup = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  width: 100%;
`;

// 新增：统一控制字段区宽度的表单容器
export const AuthForm = styled.form`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);

  /* ================= Box Model ================= */
  width: 100%;
  max-width: 100%;
  padding: var(--space-2) 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-5);
    max-width: 25rem;
    padding: var(--space-3) 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
    max-width: 25rem;
    padding: var(--space-3) 0;
  }
`;

// 新增：将 SigninForm 改为纯布局容器（div）
export const SigninForm = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: flex-start;
  gap: var(--space-4);

  /* ================= Box Model ================= */
  width: 100%;
  height: auto;
  padding: var(--space-2) 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-5);
    height: 90%;
    padding: var(--space-3) 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
    height: 90%;
    padding: var(--space-3) 0;
  }
`;

// 共享的SubmitButton组件
export const SubmitButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-start;

  /* ================= Box Model ================= */
  width: 100%;
  max-width: 100%;
  height: 2.25rem;
  padding: var(--space-3);
  margin: var(--space-4) 0 0 0;
  box-sizing: border-box;

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);

  /* ================= Visual ================= */
  background-color: var(--emerald-green);
  color: var(--white);
  border: none;
  border-radius: var(--radius-5);
  outline: none;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    max-width: 25rem;
    height: 2.5rem;
    padding: var(--space-4);
    margin: var(--space-5) 0 0 0;
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    max-width: 25rem;
    height: 2.5rem;
    padding: var(--space-4);
    margin: var(--space-5) 0 0 0;
    font-size: var(--space-5);
  }

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

  /* ================= Interaction ================= */
  cursor: pointer;
`;

// 共享的ForgotPassword组件
export const ForgotPassword = styled.a`
  /* ================= Typography ================= */
  font-size: var(--space-5);
  font-family: var(--font-sans);
  text-decoration: none;
  
  /* ================= Box Model ================= */
  margin: 0;
  
  /* ================= Visual ================= */
  color: var(--slate-grey);
  
  &:hover {
    color: var(--emerald-green);
    text-decoration: underline;
  }
  
  /* ================= Interaction ================= */
  cursor: pointer;
`;

export const HelperText = styled.p`
  /* ================= Box Model ================= */
  margin-top: 0;
  margin-bottom: var(--space-1);

  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-family: var(--font-sans);
  line-height: var(--space-5);

  /* ================= Visual ================= */
  color: var(--gray-666);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

// 复用 PasswordInput 的容器与输入样式来实现普通 Input
interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  $hasError?: boolean;
  className?: string;
  autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onKeyPress,
  disabled = false,
  $hasError = false,
  className,
  autoComplete,
}) => {
  return (
    <InputContainer className={className}>
      <StyledInput
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        disabled={disabled}
        $hasError={$hasError}
        autoComplete={autoComplete}
      />
    </InputContainer>
  );
};

// 新增：PasswordInput 所需类型与样式
interface PasswordInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  $hasError?: boolean;
  className?: string;
}

const InputContainer = styled.div`
  /* ================= Layout ================= */
  position: relative;
  align-self: flex-start;
  
  /* ================= Box Model ================= */
  width: 100%;
  margin: 0;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  /* ================= Box Model ================= */
  width: 100%;
  height: 2.5rem;
  padding: var(--space-4);
  padding-right: 3rem;
  box-sizing: border-box;
  
  /* ================= Typography ================= */
  font-size: var(--space-10);
  font-family: var(--font-sans);
  
  /* ================= Visual ================= */
  color: var(--slate-grey);
  border: 1px solid ${(props) => (props.$hasError ? "var(--error-red)" : "var(--input-bg)")};
  border-radius: var(--radius-5);
  background-color: var(--input-bg);

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "var(--error-red)" : "var(--emerald-green)")};
  }

  /* ================= Number Input Spinner ================= */
  /* 数字输入框的上下箭头按钮样式 - 移到最右侧 */
  &[type="number"] {
    /* 为 spinner 按钮预留空间 */
    padding-right: 1.5rem;
    text-align: left;
    -moz-appearance: number-input;
  }

  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: inner-spin-button;
    opacity: 1;
    /* 将按钮推到最右边 */
    margin-left: 0.5rem;
    margin-right: -0.75rem;
  }
`;

const ToggleButton = styled.button`
  /* ================= Layout ================= */
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: var(--space-6);
  height: var(--space-6);
  padding: 0;
  
  /* ================= Visual ================= */
  background: none;
  border: none;
  color: var(--muted-6b7280);

  &:hover {
    color: var(--slate-grey);
  }

  &:focus {
    outline: none;
  }
  
  /* ================= Interaction ================= */
  cursor: pointer;
`;

// 新增：导出 PasswordInput 组件
export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  placeholder = "Enter password",
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  $hasError = false,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputContainer className={className}>
      <StyledInput
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        $hasError={$hasError}
      />
      <ToggleButton
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
      </ToggleButton>
    </InputContainer>
  );
};

// 列表页：SearchRooms 卡片与容器组件（从 SearchRooms.tsx 同步最新）
export const SearchRoomsContainer = styled.div`
  /* ================= Layout ================= */
  display: grid;
  flex: 1;
  overflow-y: auto;
  align-content: start;

  /* ================= Box Model ================= */
  width: 98%;
  gap: var(--space-4);
  padding: var(--space-4);
  margin: 0 auto;
  box-sizing: border-box;

  /* ================= Typography ================= */
  font-family: var(--font-sans);

  /* mobile base - 1 column */
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--space-4);

  /* tablet >= 768px - 2 columns */
  @media (min-width: 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
    padding: var(--space-5) var(--space-6);
  }

  /* desktop >= 1024px - 3 columns */
  @media (min-width: 64rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: var(--space-5) var(--space-7);
  }
`;

export const LoadingContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-5);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-weight: var(--weight-regular);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-7);
  }
`;

// ==================== EmptyState 组件 ====================

export const EmptyStateContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;

  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-5);
  gap: var(--space-2);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-weight: var(--weight-regular);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 90%;
    padding: var(--space-6);
    gap: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 90%;
    padding: var(--space-7);
    gap: var(--space-3);
  }
`;

export const EmptyStateIcon = styled.div`
  /* ================= Visual ================= */
  color: var(--color-muted-text);
  opacity: 0.6;
  
  /* ================= Typography ================= */
  font-size: 3rem;
`;

export const EmptyStateTitle = styled.h3`
  /* ================= Layout ================= */
  margin: 0;

  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  font-family: var(--font-sans);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

export const EmptyStateDescription = styled.p`
  /* ================= Layout ================= */
  margin: 0;

  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-regular);
  font-family: var(--font-sans);
  text-align: center;

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
}> = ({ icon, title, description }) => (
  <EmptyStateContainer>
    {icon && <EmptyStateIcon>{icon}</EmptyStateIcon>}
    <EmptyStateTitle>{title}</EmptyStateTitle>
    {description && <EmptyStateDescription>{description}</EmptyStateDescription>}
  </EmptyStateContainer>
);

export const IntegrationCard = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  
  /* ================= Box Model ================= */
  width: 85%;
  max-height: 100%;  /* 不超过 grid 行高度 */
  gap: var(--space-6);
  padding: var(--space-6);
  
  /* ================= Typography ================= */
  font-family: var(--font-sans);
  
  /* ================= Visual ================= */
  background: var(--white);
  // border: 1px solid var(--gray-200-slate);
  border-radius: var(--radius-5);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  
  /* ================= Animation ================= */
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
    transform: translateY(-1px);
  }
`;

export const CardTop = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-sans);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
  }
`;

export const CardHeader = styled.div`
  /* ================= Layout ================= */
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;

  /* ================= Box Model ================= */
  width: 100%;
`;

export const HeaderLeft = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  gap: var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-sans);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
  }
`;

export const Avatar = styled.div`
  /* ================= Layout ================= */
  position: relative;
  overflow: hidden;

  /* ================= Box Model ================= */
  width: 2.25rem;
  height: 2.25rem;

  /* ================= Visual ================= */
  background: var(--indigo-500);
  border-radius: var(--radius-12);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 2.5rem;
    height: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 3rem;
    height: 3rem;
  }
`;

export const AvatarImg = styled.img`
  /* ================= Layout ================= */
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;

  /* ================= Box Model ================= */
  width: 1.75rem;
  height: 1.75rem;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    left: 0.5rem;
    top: 0.5rem;
    width: 2rem;
    height: 2rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    left: 0.5rem;
    top: 0.5rem;
    width: 2rem;
    height: 2rem;
  }
`;

export const NameBlock = styled.div`
  /* ================= Layout ================= */
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  
  /* ================= Typography ================= */
  font-family: var(--font-sans);
`;

export const NameText = styled.div`
  /* ================= Layout ================= */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;

  /* ================= Visual ================= */
  color: var(--primary-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

export const StatusRow = styled.div`
  /* ================= Layout ================= */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);

  /* ================= Typography ================= */
  font-family: var(--font-sans);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-3);
  }
`;

export const StatusDot = styled.div<{ $joined: boolean }>`
  /* ================= Box Model ================= */
  width: 0.4rem;
  height: 0.4rem;

  /* ================= Visual ================= */
  background: ${(props) => (props.$joined ? "var(--emerald-green)" : "var(--gray-400-slate)")};
  border-radius: 999px;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 0.5rem;
    height: 0.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 0.5rem;
    height: 0.5rem;
  }
`;

export const StatusText = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  line-height: var(--space-5);

  /* ================= Visual ================= */
  color: var(--slate-500);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
    line-height: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
    line-height: var(--space-6);
  }
`;

export const RoomInfo = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-3);
  font-weight: var(--weight-regular);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
    font-size: var(--space-10);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
    font-size: var(--space-10);
  }
  
  /* ================= Visual ================= */
  color: var(--color-text);
`;

export const InfoItem = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  gap: var(--space-1);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-2);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-2);
  }
`;

export const InfoItemText = styled.span`
  /* ================= Layout ================= */
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-3);
  font-weight: var(--weight-medium);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

export const CardDescription = styled.div`
  /* ================= Layout ================= */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  /* ================= Box Model ================= */
  min-height: 2.5em;

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-3);
  line-height: var(--space-5);

  /* ================= Visual ================= */
  color: var(--slate-500);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    min-height: 3em;
    font-size: var(--space-10);
    line-height: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    min-height: 3em;
    font-size: var(--space-10);
    line-height: var(--space-6);
  }
`;

export const ActionButton = styled.button`
  /* ================= Layout ================= */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);

  /* ================= Box Model ================= */
  width: 100%;
  height: 2.25rem;
  padding: var(--space-2) var(--space-3);

  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  line-height: var(--space-4);

  /* ================= Visual ================= */
  background: var(--emerald-green);
  border: none;
  border-radius: var(--radius-5);
  color: var(--white);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: 2.5rem;
    padding: var(--space-3);
    gap: var(--space-4);
    font-size: var(--space-10);
    line-height: var(--space-9);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: 2.5rem;
    padding: var(--space-3);
    gap: var(--space-4);
    font-size: var(--space-10);
    line-height: var(--space-9);
  }

  &:hover {
    filter: brightness(0.95);
    border: none;
    outline: none;
  }
  &:focus {
    border: none;
    outline: none;
  }

  /* ================= Interaction ================= */
  cursor: pointer;
`;

// 分页器：统一抽取（来自 Sidebar.tsx 的最新实现）
export const PaginationContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  width: 100%;
  height: auto;
  padding: var(--space-2);
  margin: var(--space-2);
  margin-top: auto;

  /* ================= Visual ================= */
  background-color: transparent;
  border-top: 1px solid var(--border-d9d9d970);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 90%;
    gap: var(--space-4);
    padding: 0;
    margin: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 90%;
    gap: var(--space-4);
    padding: 0;
    margin: var(--space-3);
  }
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  /* ================= Layout ================= */
  
  /* ================= Box Model ================= */
  padding: var(--space-2) var(--space-3);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  background: var(--white);
  color: ${(props) => (props.$active ? "var(--emerald-green)" : "var(--slate-grey)")};
  border: 1px solid ${(props) => (props.$active ? "var(--emerald-green)" : "var(--gray-400-slate)")};
  border-radius: var(--radius-3);
  box-shadow: ${(props) =>
    props.$active
      ? "0 1px 3px rgba(1, 101, 50, 0.2)"
      : "0 1px 2px rgba(0, 0, 0, 0.05)"};
  outline: none;
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    background: var(--input-bg);
    border-color: ${(props) => (props.$active ? "var(--emerald-green)" : "var(--slate-grey)")};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    border-color: ${(p) => (p.$active ? "var(--emerald-green)" : "var(--emerald-green)")};
  }
  
  &:focus-visible {
    outline: none;
  }
`;

export const PaginationCenter = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: var(--space-2);
`;

export const PageNumber = styled.button<{ $active?: boolean }>`
  /* ================= Layout ================= */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  
  /* ================= Box Model ================= */
  height: calc(var(--space-6));
  padding: 0 var(--space-3);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  
  /* ================= Visual ================= */
  background-color: var(--white);
  color: ${(p) => (p.$active ? "var(--emerald-green)" : "var(--color-text)")};
  border: 1px solid ${(p) => (p.$active ? "var(--emerald-green)" : "var(--gray-200-slate)")};;
  border-radius: var(--radius-5);
  outline: none;
  box-shadow: ${(p) => (p.$active ? "0 1px 3px var(--shadow-10)" : "none")};
  opacity: ${(p) => (p.$active ? 1 : 0.7)};
  
  /* ================= Animation ================= */
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
    outline: none;
    border: 1px solid ${(p) => (p.$active ? "var(--emerald-green)" : "var(--gray-200-slate)")};;
  }
  
  &:focus {
    outline: none;
    border: 1px solid ${(p) => (p.$active ? "var(--emerald-green)" : "var(--gray-200-slate)")};;
  }
`;

export const EllipsisBlock = styled.div`
  /* ================= Layout ================= */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  
  /* ================= Box Model ================= */
  height: calc(var(--space-6));
  padding: 0 var(--space-3);
  
  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  
  /* ================= Visual ================= */
  background-color: var(--white);
  color: var(--color-text);
  border-radius: var(--radius-5);
  outline: 1px solid var(--gray-200-slate);
  outline-offset: -1px;
  opacity: 0.7;
`;

// ==================== Modal 弹窗规范组件 ====================

// 弹窗背景遮罩
export const ModalBackdrop = styled.div`
  /* ================= Layout ================= */
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* ================= Box Model ================= */
  inset: 0;
  
  /* ================= Visual ================= */
  background: rgba(17, 24, 39, 0.35);
  z-index: 10000;
`;

// 弹窗容器
export const ModalContainer = styled.div`
  /* ================= Layout ================= */
  position: relative;
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 90%;
  max-width: 25rem;
  height: auto;
  min-height: 16rem;
  max-height: 90vh;
  padding: var(--space-5);

  /* ================= Visual ================= */
  background: var(--white);
  border: none;
  border-radius: var(--radius-12);
  box-shadow: 0 25px 50px -12px var(--shadow-25);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 25rem;
    min-height: 18rem;
    padding: var(--space-7);
  }

  /* ================= Interaction ================= */
  cursor: default;
`;

// Modal 右上角关闭按钮
export const ModalCloseButton = styled.button`
  /* ================= Layout ================= */
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;

  /* ================= Box Model ================= */
  padding: var(--space-1);

  /* ================= Visual ================= */
  background: none;
  border: none;
  border-radius: var(--radius-5);
  color: var(--slate-grey);

  /* ================= Animation ================= */
  transition: background-color 0.2s ease, color 0.2s ease;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    top: var(--space-4);
    right: var(--space-4);
    padding: var(--space-2);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    top: var(--space-4);
    right: var(--space-4);
    padding: var(--space-2);
  }

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    background-color: var(--input-bg);
    color: var(--emerald-green);
  }

  &:focus {
    outline: none;
  }
`;

// 标题区域容器
export const HeaderSection = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  margin-bottom: var(--space-4);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-bottom: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    margin-bottom: var(--space-6);
  }
`;

// 主标题
export const HeaderTitle = styled.div`
  /* ================= Typography ================= */
  font-size: var(--space-5);
  font-weight: var(--weight-bold);
  font-family: var(--font-urbanist);
  line-height: var(--space-6);

  /* ================= Visual ================= */
  color: var(--primary-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-6);
    line-height: var(--space-7);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-6);
    line-height: var(--space-7);
  }
`;

// 副标题
export const HeaderSubTitle = styled.div`
  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  font-family: var(--font-urbanist);
  line-height: var(--space-5);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-10);
    line-height: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-10);
    line-height: var(--space-6);
  }
`;

// 字段标签
export const InputLabel = styled.label`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  margin-bottom: var(--space-2);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-weight: var(--weight-medium);
  font-size: var(--space-3);

  /* ================= Visual ================= */
  color: var(--slate-grey);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-bottom: var(--space-3);
    font-size: var(--space-10);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    margin-bottom: var(--space-3);
    font-size: var(--space-10);
  }
`;

// Input 外层 Container
export const InputWrapper = styled.div`
  /* ================= Layout ================= */
  position: relative;
  
  /* ================= Box Model ================= */
  width: 100%;
  margin: 0;
`;

// 底部按钮容器（居中，贴底）
export const ButtonContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  /* ================= Box Model ================= */
  height: auto;
  overflow: hidden;
  padding: 0 var(--space-2);
  margin-top: auto;
  margin-bottom: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
    height: 2.5rem;
    padding: 0 var(--space-3);
    margin-bottom: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-3);
    height: 2.5rem;
    padding: 0 var(--space-3);
    margin-bottom: var(--space-4);
  }
`;

// 固定宽度按钮包装器
export const FixedButtonContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  overflow: visible;

  /* ================= Box Model ================= */
  width: 5rem;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 6rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 6rem;
  }
`;


// 错误文本 - 始终渲染，无错误时透明占位
export const ErrorText = styled.div<{ $visible?: boolean }>`

  /* ================= Box Model ================= */
  margin-top: 0;
  margin-bottom: var(--space-1);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  font-family: var(--font-sans);
  line-height: var(--space-5);
  
  /* ================= Visual ================= */
  color: var(--error-red);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  
  /* ================= Animation ================= */
  transition: opacity 0.2s ease;
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;
export const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid var(--border-d9d9d970);
  width: 80%;
  margin: 0 auto;
`;
