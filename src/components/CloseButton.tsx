// components/CloseButton.tsx
import React from "react";
import styled from "styled-components";
import { RxCross2 } from "react-icons/rx";

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CloseButton: React.FC<CloseButtonProps> = (props) => (
  <StyledButton {...props}>
    <StyledCross />
  </StyledButton>
);
export default CloseButton;
// const StyledButton = styled.button`
//   position: absolute;
//   top: 1rem;
//   right: 1rem;
//   background: none;
//   border: none;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 0.5rem;
//   border-radius: 50%;
//   transition: all 0.2s ease;
//   outline: none;

//   &:hover {
//     background-color: rgba(255, 255, 255, 0.1);
//     transform: scale(1.1);
//   }

//   &:focus {
//     outline: none;
//   }
// `;

// const StyledCross = styled(RxCross2)`
//   color: white;
//   font-size: 1.2rem;
// `;

const StyledButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  outline: none;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
  &:focus {
    outline: none;
  }
`;

const StyledCross = styled(RxCross2)`
  font-size: 1.25rem;
  color: white;
`;