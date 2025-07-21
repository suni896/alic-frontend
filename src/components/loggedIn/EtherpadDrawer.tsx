import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LuX, LuFileText } from 'react-icons/lu';
import EtherpadComponent from './EtherpadComponent';

interface EtherpadDrawerProps {
  roomId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const DrawerContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  height: 100vh;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const DrawerTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;

  &:hover {
    background: #f5f5f5;
    border-radius: 50%;
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow: hidden;
  padding: 16px;
`;

const DrawerButton = styled.button`
  position: fixed;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #016532;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: background-color 0.2s;

  &:hover {
    background-color: #015428;
  }
`;

const EtherpadDrawer: React.FC<EtherpadDrawerProps> = ({
  roomId,
  isOpen,
  onClose
}) => {
  // 防止滚动穿透
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>共享文档</DrawerTitle>
          <CloseButton onClick={onClose}>
            <LuX />
          </CloseButton>
        </DrawerHeader>
        <DrawerContent>
          <EtherpadComponent 
            roomId={roomId} 
            height="calc(100vh - 100px)" 
          />
        </DrawerContent>
      </DrawerContainer>
    </>
  );
};

// 导出带按钮的组件
export const EtherpadDrawerWithButton: React.FC<{ roomId?: number }> = ({ roomId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      {!isOpen && (
        <DrawerButton onClick={handleOpen} title="打开共享文档">
          <LuFileText size={24} />
        </DrawerButton>
      )}
      <EtherpadDrawer 
        roomId={roomId} 
        isOpen={isOpen} 
        onClose={handleClose} 
      />
    </>
  );
};

export default EtherpadDrawer; 