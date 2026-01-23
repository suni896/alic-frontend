import React, { useState } from "react";
import styled from "styled-components";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

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
  max-width: 420px;        /* 与普通输入保持一致 */
  margin: 0;               
  align-self: flex-start;  /* 在列布局中左对齐 */
  
  @media (max-width: 740px) {
    max-width: 100%;       /* 小屏自适应 */
  }
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  padding-right: 3rem; /* 为眼睛图标留出空间 */
  font-size: 0.9rem;
  color: #374151;            /* 深灰文本 */
  height: 40px;
  border: 1px solid ${(props) => (props.$hasError ? "#ef4444" : "#f3f4f6")};
  border-radius: 6px;
  background-color: #f3f4f6; /* 浅灰底色 */
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#ef4444" : "#016532")};
  }

  @media (max-width: 740px) {
    height: 5vh;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  
  &:hover {
    color: #374151;
  }
  
  &:focus {
    outline: none;
  }
`;

const PasswordInput: React.FC<PasswordInputProps> = ({
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

export default PasswordInput;