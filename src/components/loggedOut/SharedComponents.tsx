import styled from "styled-components";

// Title
export const Title = styled.h1`
  text-align: left;
  font-size: 34px;
  font-family: "Roboto", serif;
  font-weight: 700;
  text-decoration: none;
  margin: 0 0 1.25rem 0;  /* 增加底部间距 */
  color: #333;

  @media (max-width: 740px) {
    font-size: 40px;
    margin: 0 0 1rem 0;   /* 移动端保留稍小的底部间距 */
  }

  @media (max-height: 720px) {
    margin: 0;            /* 短屏维持现有紧凑样式 */
  }
`;

// 共享的ConfirmationText组件
export const ConfirmationText = styled.p<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "1.3rem" : "1.8rem")};
  margin: ${({ $small }) => ($small ? "0.3rem 0 0 0" : "1rem 0 0.5rem 0")};
  font-family: "Roboto", serif;
  text-align: left;
  font-weight: 400;
  color: #333
  @media (max-width: 740px) {
    font-size: ${({ $small }) => ($small ? "0.9rem" : "1.2rem")};
    line-height: 180%;
  }

  @media (max-height: 720px) {
    line-height: 110%;
    font-weight: 600;
    font-size: ${({ $small }) => ($small ? "0.9rem" : "1.2rem")};
  }
`;

// 共享的EmailHighlight组件
export const EmailHighlight = styled.span`
  color: #016532;
  font-weight: bold;
`;

// 共享的CodeInputContainer组件
export const CodeInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.5rem 0 0rem 0;
`;

// 共享的CodeInput组件
export const CodeInput = styled.input`
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.5rem;
  border-radius: 5px;
  background: #84a98c;
  color: white;
  border: 1px solid var(--color-border);

  &:focus {
    outline: none;
    border-color: #016532;
  }

  @media (max-width: 740px) {
    width: 2.5rem;
    height: 2.5rem;
  }

  @media (max-height: 720px) {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

// 共享的Label组件
export const Label = styled.label`
  font-size: 1rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 2px;

  @media (max-width: 740px) {
    font-size: 0.8rem;
  }
`;

// 共享的Input组件
export const Input = styled.input`
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #374151;
  height: 40px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  background-color: #f3f4f6;
  width: 100%;              /* 跟随父容器宽度 */
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }

  @media (max-width: 740px) {
    height: 5vh;
  }
`;

// 新增：共享的 FieldGroup 容器
export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;   /* 控制输入与说明/错误的贴近程度 */
  width: 100%;    /* 跟随父容器宽度 */
`;

// 新增：统一控制字段区宽度的表单容器
export const AuthForm = styled.form`
  width: 100%;
  max-width: 420px;          /* 统一限制宽度 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;

  @media (max-width: 740px) {
    max-width: 100%;
  }
`;

// 新增：将 SigninForm 改为纯布局容器（div）
export const SigninForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 90%;
  align-content: center;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
`;

// 共享的ErrorText组件
export const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: 0;
  margin-bottom: 3px;
  min-height: 1.5em; /* 预留固定高度 */

  @media (max-width: 740px) {
    font-size: 0.7rem;
    min-height: 1.1em;
  }

  @media (max-height: 720px) {
    margin: 0;
    min-height: 1em;
  }
`;

// 共享的SubmitButton组件（黑色背景）
export const SubmitButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;             /* 与输入框一致 */
  max-width: 420px;        /* 与 Input 相同的最大宽度 */
  box-sizing: border-box;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  height: 40px;
  margin: 20px 0 0 0;      /* 左对齐，不居中 */
  align-self: flex-start;  /* 在列布局中左对齐 */
  border-radius: 5px;
  background-color: #386641;
  color: white;
  border: none;
  outline: none;

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

  @media (max-width: 740px) {
    max-width: 100%;       /* 小屏铺满容器宽度 */
    margin-top: 10%;
    margin-bottom: 6%;
  }

  @media (max-height: 720px) {
    margin-bottom: 0;
    margin-top: 0;
  }

  @media (max-width: 740px) and (min-height: 820px) {
    height: 5vh;
    margin-bottom: 8%;
  }
`;

// 共享的BackButton组件（绿色背景）
export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 40px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: #386641;
  color: white;
  border: none;
  outline: none;

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

  @media (max-width: 740px) {
    width: 80%;
    font-size: 0.9rem;
    margin-top: 15%;
  }

  @media (max-height: 720px) {
    margin-top: 8%;
  }
  
  @media (max-width: 740px) and (min-height: 820px) {
    height: 6vh;
    margin-top: 18%;
  }
`;

// 共享的RegisterButton组件（绿色背景，支持错误状态）
export const RegisterButton = styled.button<{ $hasError?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  height: 40px;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: black;
  color: white;
  border: none;
  outline: none;

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

  @media (max-width: 740px) {
    width: ${props => props.$hasError ? '80%' : '60%'};
    margin-top: 10%;
    margin-bottom: 6%;
  }

  @media (max-height: 720px) {
    margin-bottom: 0;
    margin-top: 0;
  }

  @media (max-width: 740px) and (min-height: 820px) {
    height: 5vh;
    margin-bottom: 8%;
  }
`;

// 专门用于Signin页面的RegisterButton（绿色背景，固定样式）
export const SigninRegisterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 40px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: #386641;
  color: white;
  border: none;
  outline: none;

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

  @media (max-width: 740px) {
    width: 80%;
    font-size: 0.9rem;
    margin-top: 15%;
  }

  @media (max-height: 720px) {
    margin-top: 8%;
  }
  
  @media (max-width: 740px) and (min-height: 820px) {
    height: 6vh;
    margin-top: 18%;
  }
`;

// 共享的ForgotPassword组件
export const ForgotPassword = styled.a`
  color: #fc5600;
  text-decoration: underline;
  cursor: pointer;
  font-size: 1rem;
  margin: 1%;

  @media (max-width: 740px) {
    font-size: 0.9rem;
  }
  color: var(--color-accent);
  text-decoration: none;
  &:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }
`;

export const HelperText = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0;
  margin-bottom: 3px;

  @media (max-width: 740px) {
    font-size: 0.7rem;
  }
`;