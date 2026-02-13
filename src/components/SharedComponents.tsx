import React, { useState } from "react";
import styled from "styled-components";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

// Title
export const Title = styled.h1`
  text-align: left;
  font-size: var(--space-8);
  font-family: var(--font-sans);
  font-weight: var(--weight-bold);
  text-decoration: none;
  margin: 0 0 var(--space-9) 0;  /* 增加底部间距 */
  color: var(--primary-text);
`;
export const RoomList = styled.ul`
  list-style: none;
  padding: var(--space-3);
  overflow-y: auto;
  margin: 0 var(--space-3) ;
  background-color: white;
  border-radius: var(--radius-5);
  border: 1px solid white;
  width: 90%;
  flex: 1;
  box-sizing: border-box;
`;

export const RoomContainer = styled.div<{ $isActive?: boolean }>`
  cursor: pointer;
  display: flex;            /* 左右排列 */
  align-items: flex-start;  /* 与 RoomTitle 顶部对齐 */
  gap: 0rem;               
  padding: var(--space-3);     
  width: 85%;               /* self-stretch */
  min-height: var(--space-6);             
  background-color: var(--white);
  border-radius: var(--radius-5);      /* rounded-lg */
  transition: background-color 0.2s ease, border-color 0.2s ease;

  ${({ $isActive }) =>
    $isActive &&
    `
      background-color: var(--color-line);
    `}

  &:hover {
    background-color: var(--color-line);
  }

  /* 悬浮时：图标与文本高亮 */
  &:hover svg {
    color: var(--emerald-green);
  }

  /* 统一让 RoomTitle 与 RoomDesc 变色（p 标签） */
  &:hover p {
    color: var(--emerald-green);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RoomInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 98%;
  min-width: 0;
  gap: 0;
  flex: 1;
  padding: 0;
  &:hover {
    color: var(--emerald-green);
  }
`;

export const RoomTitle = styled.p`
  font-size: var(--space-10);
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);
  color: var(--text-1f2937);
  margin: 0 0 var(--space-2) 0;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
  line-height: 1.2; 
  &:hover {
    color: var(--emerald-green);
  }
`;

export const RoomDesc = styled.p`
  font-family: var(--font-roboto-serif);
  font-size: var(--space-4);
  color: var(--muted-6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin: 0; 
  line-height: 1.5; 
  &:hover {
    color: var(--emerald-green);
  }
`;
// 共享的ConfirmationText组件
export const ConfirmationText = styled.p`
  font-size: var(--space-5);
  margin: var(--space-4) 0 0 0;
  font-family: var(--font-sans);
  text-align: left;
  font-weight: var(--weight-medium);
  color: var(--primary-text);
`;

export const ErrorMessage = styled.p`
  font-size: var(--space-5);
  font-family: var(--font-sans);
  text-align: left;
  font-weight: var(--weight-medium);
  color: #fc5600;
  margin: 0;
`;

// 共享的EmailHighlight组件
export const EmailHighlight = styled.span`
  font-size: var(--space-5);
  font-family: var(--font-sans);
  color: var(--emerald-green);
  font-weight: var(--weight-semibold);
`;

// 共享的CodeInputContainer组件
export const CodeInputContainer = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin: var(--space-3) 0 0 0;
`;

// 共享的CodeInput组件
export const CodeInput = styled.input`
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: var(--space-6);
  font-weight: var(--weight-bold);
  background: var(--white);
  color: var(--primary-text);
  border: 1px solid var(--emerald-green);
  border-radius: var(--radius-5);

  &:focus {
    outline: none;
    border-color: var(--emerald-green);
  }
`;

// 共享的Label组件
// export const Label = styled.label`
//   font-size: 1rem;
//   font-family: "Roboto", serif;
//   font-weight: 400;
//   margin-bottom: 2px;

//   @media (max-width: 740px) {
//     font-size: 0.8rem;
//   }
// `;

// 新增：共享的 FieldGroup 容器
export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);   /* 控制输入与说明/错误的贴近程度 */
  width: 100%;    /* 跟随父容器宽度 */
`;

// 新增：统一控制字段区宽度的表单容器
export const AuthForm = styled.form`
  width: 100%;
  max-width: 25rem;          /* 统一限制宽度 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-3) 0;

`;

// 新增：将 SigninForm 改为纯布局容器（div）
export const SigninForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 90%;
  align-content: center;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-3) 0;
`;

// 共享的SubmitButton组件
export const SubmitButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;             /* 与输入框一致 */
  max-width: 25rem;        /* 与 Input 相同的最大宽度 */
  box-sizing: border-box;
  padding: var(--space-4);
  cursor: pointer;
  height: 2.5rem;
  margin: 20px 0 0 0;      /* 左对齐，不居中 */
  align-self: flex-start;  /* 在列布局中左对齐 */
  border-radius: var(--radius-5);
  background-color: var(--emerald-green);
  color: var(--white);
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: var(--space-5);

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
`;

// 共享的ForgotPassword组件
export const ForgotPassword = styled.a`
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--space-5);
  margin: 0;
  color: var(--slate-grey); 
  font-family: var(--font-sans);
  
  text-decoration: none;
  &:hover {
    color: var(--emerald-green);
    text-decoration: underline;
  }
`;

export const HelperText = styled.p`
  font-size: var(--space-4);
  color: var(--gray-666);
  margin-top: 0;
  margin-bottom: var(--space-1);
  font-family: var(--font-sans);
`;
// 共享的ErrorText组件
export const ErrorText = styled.p`
  font-size: var(--space-4);
  color: var(--error-red);
  margin-top: 0;
  margin-bottom: var(--space-1);
  font-family: var(--font-sans);
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
  position: relative;
  width: 100%;
  max-width: 25rem;
  margin: 0;
  align-self: flex-start;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: var(--space-4);
  padding-right: 3rem; /* 为眼睛图标留出空间 */
  font-size: var(--space-10);
  color: var(--slate-grey);
  height: 2.5rem;
  border: 1px solid ${(props) => (props.$hasError ? "var(--error-red)" : "var(--input-bg)")};
  border-radius: var(--radius-5);
  background-color: var(--input-bg);
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "var(--error-red)" : "var(--emerald-green)")};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: var(--space-6);
  height: var(--space-6);

  &:hover {
    color: var(--slate-grey);
  }

  &:focus {
    outline: none;
  }
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  padding: var(--space-5) var(--space-7);
  box-sizing: border-box;
  margin: 0 auto;
  overflow-y: auto;
  width: 98%;
  flex: 1;
  font-family: var(--font-sans);
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-7);
  color: var(--muted-6b7280);
  font-family: var(--font-roboto);
  font-weight: var(--weight-regular);
  width: 100%;
  grid-column: 1 / -1;
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-7);
  color: var(--muted-6b7280);
  font-family: var(--font-roboto);
  font-weight: var(--weight-regular);
  width: 100%;
  grid-column: 1 / -1;
`;

export const IntegrationCard = styled.div`
  width: 85%;
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-5);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--space-6);
  border-color: 1px solid var(--slate-200);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  font-family: var(--font-sans);

  &:hover {
    box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
    transform: translateY(-1px);
    // border: 1px solid var(--emerald-green);
  }
`;

export const CardTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  font-family: var(--font-sans);
`;

export const CardHeader = styled.div`
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-5);
  font-family: var(--font-sans);
`;

export const Avatar = styled.div`
  width: 48px;
  height: 48px;
  position: relative;
  background: #6366f1;
  border-radius: var(--radius-12);
  overflow: hidden;
`;

export const AvatarImg = styled.img`
  width: 32px;
  height: 32px;
  position: absolute;
  left: 8px;
  top: 8px;
`;

export const NameBlock = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  font-family: var(--font-sans);
`;

export const NameText = styled.div`
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--space-5);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const StatusRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-sans);
`;

export const StatusDot = styled.div<{ $joined: boolean }>`
  width: 8px;
  height: 8px;
  background: ${(props) => (props.$joined ? "var(--emerald-green)" : "var(--gray-400-slate)")};
  border-radius: 999px;
`;

export const StatusText = styled.div`
  color: var(--slate-500);
  font-family: var(--font-sans);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  line-height: var(--space-6);
`;

export const RoomInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-5);
  color: var(--muted-6b7280);
  font-family: var(--font-sans);
  font-size: var(--space-10);
  font-weight: var(--weight-regular);
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

export const InfoItemText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
`;

export const CardDescription = styled.div`
  font-family: var(--font-sans);
  font-size: var(--space-10);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3em;
  color: var(--slate-500);
`;

export const ActionButton = styled.button`
  width: 100%;
  height: 2.5rem;
  padding: var(--space-3);
  background: var(--emerald-green);
  border: none;
  border-radius: var(--radius-5);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: var(--space-10);
  font-weight: var(--weight-semibold);
  line-height: var(--space-9);
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
  }
`;

// 分页器：统一抽取（来自 Sidebar.tsx 的最新实现）
// ... existing code ...

// 分页器：统一抽取（来自 Sidebar.tsx 的最新实现）
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: 0;
  background-color: transparent;
  width: 90%;
  height: 3rem;
  margin: var(--space-3);
  margin-top: auto; 
  border-top: 1px solid var(--border-d9d9d970);
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "#386641" : "white")};
  color: ${(props) => (props.$active ? "white" : "var(--slate-grey)")};
  border: 1px solid ${(props) => (props.$active ? "#386641" : "#d1d5db")};
  border-radius: var(--radius-3);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "0 1px 3px rgba(1, 101, 50, 0.2)"
      : "0 1px 2px rgba(0, 0, 0, 0.05)"};

  &:hover {
    background: ${(props) => (props.$active ? "#014d28" : "var(--input-bg)")};
    border-color: ${(props) => (props.$active ? "#014d28" : "#9ca3af")};
    transform: translateY(-1px);
  }

  &:disabled {
    color: #9ca3af;
    background: #f9fafb;
    border-color: #e5e7eb;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &:hover {
      background: #f9fafb;
      border-color: #e5e7eb;
      transform: none;
    }
  }
`;

export const PaginationCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
`;

export const PageNumber = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--space-3);
  height: calc(var(--space-6));
  background-color: var(--white);
  color: var(--text-1f2937);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-5);
  outline: 1px solid var(--gray-200-slate);
  outline-offset: -1px;
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;

  opacity: ${(p) => (p.$active ? 1 : 0.7)};
  outline-color: ${(p) => (p.$active ? "var(--emerald-green)" : "var(--white)")};
  color: ${(p) => (p.$active ? "var(--emerald-green)" : "var(--text-1f2937)")};
  background-color: ${(p) => (p.$active ? "var(--white)" : "var(--white)")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px var(--shadow-10)" : "none")};

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
`;

export const EllipsisBlock = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--space-3);
  height: calc(var(--space-6));
  background-color: var(--white);
  color: var(--text-1f2937);
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-5);
  outline: 1px solid var(--gray-200-slate);
  outline-offset: -1px;
  opacity: 0.7;
`;

