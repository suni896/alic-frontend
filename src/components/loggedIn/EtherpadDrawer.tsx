import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LuX, LuFileText, LuMaximize2, LuMinimize2 } from 'react-icons/lu';
import EtherpadComponent from './EtherpadComponent';

interface EtherpadDrawerProps {
  roomId?: number;
  roomName?: string;
  isOpen: boolean;
  onClose: () => void;
  width: string;
  height: string;
  onSizeChange: (size: { width: string; height: string }) => void;
  position: { x: number, y: number };
  onPositionChange: (position: { x: number, y: number }) => void;
  isFloating: boolean;
  onFloatingChange: (isFloating: boolean) => void;
}

interface StyledProps {
  isOpen: boolean;
  width: string;
  height: string;
  isFloating?: boolean;
  top?: number;
  left?: number;
}

const DrawerContainer = styled.div<StyledProps>`
  position: ${props => props.isFloating ? 'fixed' : 'fixed'};
  top: ${props => props.isFloating ? `${props.top}px` : '7vh'};
  right: ${props => props.isFloating ? 'auto' : '0'};
  left: ${props => props.isFloating ? `${props.left}px` : 'auto'};
  width: ${props => props.width};
  height: ${props => props.isFloating ? props.height : 'calc(100vh - 7vh)'};
  background-color: white;
  box-shadow: ${props => props.isFloating ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '-2px 0 8px rgba(0, 0, 0, 0.15)'};
  z-index: 1000;
  transform: ${props => props.isFloating ? 'none' : `translateX(${props.isOpen ? '0' : '100%'})`};
  transition: ${props => props.isFloating ? 'box-shadow 0.2s ease' : 'transform 0.3s ease-in-out'};
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  border: ${props => props.isFloating ? '1px solid #ddd' : 'none'};
  border-left: ${props => props.isFloating ? '1px solid #ddd' : '1px solid #ddd'};
  margin-top: 0;
  margin-bottom: 0;
  border-radius: ${props => props.isFloating ? '8px' : '0'};
  overflow: hidden;
  min-width: 300px;
  min-height: 200px;
  
  ${props => props.isFloating && `
    &:hover {
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
    }
  `}
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  cursor: move;
  user-select: none;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 6px;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.2) 0px,
      rgba(0, 0, 0, 0.2) 3px,
      transparent 3px,
      transparent 6px
    );
    border-radius: 2px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }
  
  &:hover::before {
    opacity: 0.8;
  }
`;

const DrawerTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #666;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: #333;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const DrawerButton = styled.button`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #016532 0%, #014a28 100%);
  color: white;
  border: none;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 60px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -3px 0 15px rgba(0, 0, 0, 0.25);
  z-index: 999;
  transition: all 0.3s ease;
  padding: 10px 5px;

  &:hover {
    background: linear-gradient(135deg, #015428 0%, #013520 100%);
    width: 70px;
    transform: translateY(-50%) translateX(-5px);
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.35);
  }
`;

const ButtonText = styled.span`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  margin-top: 8px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
`;

const MainContent = styled.div<{ drawerWidth: string; isDrawerOpen: boolean; isFloating: boolean }>`
  transition: ${props => props.isFloating ? 'none' : 'padding-right 0.3s ease-in-out'};
  padding-right: ${props => (props.isDrawerOpen && !props.isFloating) ? props.drawerWidth : '0'};
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

// Resize handle styles
const ResizeHandle = styled.div<{ direction: string }>`
  position: absolute;
  background-color: transparent;
  transition: background-color 0.2s ease;
  z-index: 10;
  
  ${props => {
    switch (props.direction) {
      case 'left':
        return `
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: col-resize;
        `;
      case 'right':
        return `
          right: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: col-resize;
        `;
      case 'top':
        return `
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          cursor: row-resize;
        `;
      case 'bottom':
        return `
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          cursor: row-resize;
        `;
      case 'top-left':
        return `
          top: 0;
          left: 0;
          width: 12px;
          height: 12px;
          cursor: nw-resize;
        `;
      case 'top-right':
        return `
          top: 0;
          right: 0;
          width: 12px;
          height: 12px;
          cursor: ne-resize;
        `;
      case 'bottom-left':
        return `
          bottom: 0;
          left: 0;
          width: 12px;
          height: 12px;
          cursor: sw-resize;
        `;
      case 'bottom-right':
        return `
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          cursor: se-resize;
        `;
      default:
        return '';
    }
  }}
  
  &:hover {
    background-color: rgba(1, 101, 50, 0.3);
  }
  
  &:active {
    background-color: rgba(1, 101, 50, 0.5);
  }
  
  /* Add visual indicators for corner resize handles */
  ${props => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(props.direction) && `
    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border: 2px solid rgba(1, 101, 50, 0.6);
      border-radius: 1px;
      opacity: 0;
      transition: opacity 0.2s ease;
      
      ${props.direction === 'top-left' ? 'top: 2px; left: 2px; border-right: none; border-bottom: none;' : ''}
      ${props.direction === 'top-right' ? 'top: 2px; right: 2px; border-left: none; border-bottom: none;' : ''}
      ${props.direction === 'bottom-left' ? 'bottom: 2px; left: 2px; border-right: none; border-top: none;' : ''}
      ${props.direction === 'bottom-right' ? 'bottom: 2px; right: 2px; border-left: none; border-top: none;' : ''}
    }
    
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const EtherpadDrawer: React.FC<EtherpadDrawerProps> = ({
  roomId,
  roomName,
  isOpen,
  onClose,
  width,
  height,
  onSizeChange,
  position,
  onPositionChange,
  isFloating,
  onFloatingChange
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Prevent scrolling when drawer is open in floating mode
  useEffect(() => {
    if (isOpen && isFloating) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isFloating]);

  // Handle resize functionality
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!drawerRef.current) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartMousePos({ x: e.clientX, y: e.clientY });
    setStartPosition({ x: position.x, y: position.y });
    setStartSize({
      width: drawerRef.current.offsetWidth,
      height: drawerRef.current.offsetHeight
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!headerRef.current?.contains(e.target as Node)) return;
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setStartPosition({ x: position.x, y: position.y });
  };

  // Handle mouse move events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - startMousePos.x;
        const deltaY = e.clientY - startMousePos.y;
        
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startPosition.x;
        let newY = startPosition.y;
        
        // Calculate new size and position based on resize direction
        if (resizeDirection.includes('right')) {
          const maxWidth = window.innerWidth - position.x - 20; // Keep 20px margin
          newWidth = Math.max(300, Math.min(maxWidth, startSize.width + deltaX));
        }
        if (resizeDirection.includes('left')) {
          const maxDelta = startSize.width - 300;
          const maxLeftMove = position.x - 20; // Minimum 20px from left edge
          const constrainedDelta = Math.max(-maxDelta, Math.min(maxLeftMove, deltaX));
          newWidth = startSize.width - constrainedDelta;
          newX = startPosition.x + constrainedDelta;
        }
        if (resizeDirection.includes('bottom')) {
          const maxHeight = window.innerHeight - position.y - 20; // Keep 20px margin
          newHeight = Math.max(200, Math.min(maxHeight, startSize.height + deltaY));
        }
        if (resizeDirection.includes('top')) {
          const maxDelta = startSize.height - 200;
          const navbarHeight = window.innerHeight * 0.07; // 7vh
          const maxTopMove = position.y - navbarHeight; // Minimum navbar height from top
          const constrainedDelta = Math.max(-maxDelta, Math.min(maxTopMove, deltaY));
          newHeight = startSize.height - constrainedDelta;
          newY = startPosition.y + constrainedDelta;
        }
        
        onSizeChange({ width: `${newWidth}px`, height: `${newHeight}px` });
        onPositionChange({ x: newX, y: newY });
      } else if (isDragging && isFloating) {
        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;
        
        // Stricter boundary checks
        const drawerWidth = parseInt(width.replace('px', '')) || 300;
        const drawerHeight = parseInt(height.replace('px', '')) || 200;
        const navbarHeight = window.innerHeight * 0.07; // 7vh
        
        const newX = Math.max(20, Math.min(window.innerWidth - drawerWidth - 20, startPosition.x + deltaX));
        const newY = Math.max(navbarHeight, Math.min(window.innerHeight - drawerHeight - 20, startPosition.y + deltaY));
        
        onPositionChange({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      setResizeDirection('');
      // Release mouse styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing || isDragging) {
      // Set global mouse styles
      if (isResizing) {
        const cursorMap: { [key: string]: string } = {
          'left': 'col-resize',
          'right': 'col-resize',
          'top': 'row-resize',
          'bottom': 'row-resize',
          'top-left': 'nw-resize',
          'top-right': 'ne-resize',
          'bottom-left': 'sw-resize',
          'bottom-right': 'se-resize'
        };
        document.body.style.cursor = cursorMap[resizeDirection] || 'default';
      } else if (isDragging) {
        document.body.style.cursor = 'move';
      }
      
      // Prevent text selection
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, isDragging, resizeDirection, startMousePos, startPosition, startSize, dragStartPos, position, width, height, onSizeChange, onPositionChange, isFloating]);

  const toggleFloatingMode = () => {
    onFloatingChange(!isFloating);
  };

  const handleClose = () => {
    if (isFloating) {
      onFloatingChange(false);
    }
    onClose();
  };

  return (
    <>
      <DrawerContainer 
        ref={drawerRef} 
        isOpen={isOpen} 
        width={width}
        height={height}
        isFloating={isFloating}
        top={position.y}
        left={position.x}
      >
        {/* Resize handles - only show in floating mode */}
        {isFloating && (
          <>
            <ResizeHandle direction="top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
            <ResizeHandle direction="bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
            <ResizeHandle direction="left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
            <ResizeHandle direction="right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
            <ResizeHandle direction="top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')} />
            <ResizeHandle direction="top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')} />
            <ResizeHandle direction="bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} />
            <ResizeHandle direction="bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} />
          </>
        )}
        {/* Original left resize handle - only show in docked mode */}
        {!isFloating && <ResizeHandle direction="left" onMouseDown={(e) => handleResizeStart(e, 'left')} />}
        
        <DrawerHeader ref={headerRef} onMouseDown={handleDragStart}>
          <DrawerTitle>
            <LuFileText />
            Shared Document
          </DrawerTitle>
          <HeaderButtons>
            <IconButton onClick={toggleFloatingMode} title={isFloating ? "Dock Window" : "Float Window"}>
              {isFloating ? <LuMinimize2 /> : <LuMaximize2 />}
            </IconButton>
            <IconButton onClick={handleClose} title="Close">
              <LuX />
            </IconButton>
          </HeaderButtons>
        </DrawerHeader>
        <DrawerContent>
          <EtherpadComponent 
            roomId={roomId}
            roomName={roomName}
            height="100%" 
          />
        </DrawerContent>
      </DrawerContainer>
    </>
  );
};

// Export component with button
export const EtherpadDrawerWithButton: React.FC<{ 
  roomId?: number;
  roomName?: string;
  children?: React.ReactNode;
  currentRoomId?: number;
}> = ({ 
  roomId,
  roomName,
  children,
  currentRoomId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState('40%');
  const [drawerHeight, setDrawerHeight] = useState('60vh');
  const [position, setPosition] = useState({ 
    x: window.innerWidth / 2 - 300, 
    y: Math.max(window.innerHeight * 0.07 + 20, 100) // Ensure it's below navbar (7vh + 20px margin)
  });
  const [isFloating, setIsFloating] = useState(false);
  const prevRoomIdRef = useRef<number | undefined>(currentRoomId);

  // Close drawer when room changes
  useEffect(() => {
    if (prevRoomIdRef.current !== currentRoomId && isOpen) {
      setIsOpen(false);
      setIsFloating(false);
    }
    prevRoomIdRef.current = currentRoomId;
  }, [currentRoomId, isOpen]);

  // Close drawer when component unmounts
  useEffect(() => {
    return () => {
      setIsOpen(false);
      setIsFloating(false);
    };
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  
  const handleSizeChange = (size: { width: string; height: string }) => {
    setDrawerWidth(size.width);
    setDrawerHeight(size.height);
  };
  
  const handlePositionChange = (newPosition: { x: number, y: number }) => {
    setPosition(newPosition);
  };
  
  const handleFloatingChange = (floating: boolean) => {
    setIsFloating(floating);
    // Set appropriate initial size when switching to floating mode
    if (floating) {
      setDrawerWidth('600px');
      setDrawerHeight('500px');
    } else {
      setDrawerWidth('40%');
      setDrawerHeight('60vh');
    }
  };

  return (
    <>
      <MainContent 
        drawerWidth={drawerWidth} 
        isDrawerOpen={isOpen} 
        isFloating={isFloating}
      >
        {children}
      </MainContent>
      
      {!isOpen && (
        <DrawerButton onClick={handleOpen} title="Open Shared Document">
          <LuFileText size={32} />
          <ButtonText>Document</ButtonText>
        </DrawerButton>
      )}
      
      <EtherpadDrawer 
        roomId={roomId}
        roomName={roomName}
        isOpen={isOpen} 
        onClose={handleClose} 
        width={drawerWidth}
        height={drawerHeight}
        onSizeChange={handleSizeChange}
        position={position}
        onPositionChange={handlePositionChange}
        isFloating={isFloating}
        onFloatingChange={handleFloatingChange}
      />
    </>
  );
};

export default EtherpadDrawer; 