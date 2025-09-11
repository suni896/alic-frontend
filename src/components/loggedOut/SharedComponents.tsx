import styled from "styled-components";

// 共享的Title组件
export const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-family: "Roboto", serif;
  font-weight: 700;
  text-decoration: underline;
  margin: 1.5% auto;

  @media (max-width: 740px) {
    font-size: 1.8rem;
    margin: 5% auto;
  }

  @media (max-height: 720px) {
    margin: 0 auto;
  }
`;

// 共享的ConfirmationText组件
export const ConfirmationText = styled.p<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "1.3rem" : "1.8rem")};
  margin: ${({ $small }) => ($small ? "0.3rem 0 0 0" : "1rem 0 0.5rem 0")};
  font-family: "Roboto", serif;
  text-align: center;
  font-weight: 700;

  @media (max-width: 740px) {
    font-size: ${({ $small }) => ($small ? "1rem" : "1.5rem")};
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
  margin: 2rem 0 1rem 0;
`;

// 共享的CodeInput组件
export const CodeInput = styled.input`
  width: 3.5rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #d9d9d9;
  color: #000;

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
  font-size: 1rem;
  color: black;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }

  @media (max-width: 740px) {
    height: 5vh;
  }
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
    width: 60%;
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
  background-color: #016532;
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
  background-color: #016532;
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