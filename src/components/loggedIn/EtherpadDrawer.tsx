import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { LuX, LuFileText, LuMaximize2, LuMinimize2 } from 'react-icons/lu';
import EtherpadComponent from './EtherpadComponent';

// Etherpad 功能开关 - 通过环境变量控制
const ENABLE_ETHERPAD = import.meta.env.VITE_ENABLE_ETHERPAD !== 'false';

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
  $isOpen: boolean;
  width: string;
  height: string;
  $isFloating?: boolean;
  $top?: number;
  $left?: number;
  $isResizing?: boolean;
}

const DrawerContainer = styled.div<StyledProps>`
  /* ================= Layout ================= */
  position: fixed !important;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  top: ${props => props.$isFloating ? `${props.$top}px` : '0'};
  right: ${props => props.$isFloating ? 'auto' : '0'};
  left: ${props => props.$isFloating ? `${props.$left}px` : 'auto'};
  z-index: 9999;
  transform: ${props => props.$isFloating ? 'none' : `translateX(${props.$isOpen ? '0' : '100%'})`};
  
  /* ================= Box Model ================= */
  width: 100%;
  height: ${props => props.$isFloating ? props.height : '100vh'};
  min-width: auto;
  min-height: 12.5rem;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  
  /* ================= Visual ================= */
  background: var(--color-background);
  border: ${props => props.$isFloating ? '1px solid var(--color-line)' : 'none'};
  border-left: 1px solid var(--color-line);
  border-radius: ${props => props.$isFloating ? 'var(--radius-8)' : '0'};
  box-shadow: ${props => props.$isFloating ? 'var(--shadow-soft)' : 'var(--shadow-soft)'};
  
  /* ================= Animation ================= */
  transition: ${props => {
    if (props.$isResizing) return 'none';
    return props.$isFloating ? 'box-shadow 0.2s ease' : 'transform 0.3s ease-in-out';
  }};
  will-change: ${props => props.$isResizing ? 'width, height, top, left' : 'auto'};
  
  /* ================= Interaction ================= */
  ${props => props.$isFloating && !props.$isResizing && `
    &:hover {
      box-shadow: var(--shadow-hard);
    }
  `}
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 50%;
    min-width: 18.75rem;
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: ${props => props.width};
  }
`;

const DrawerHeader = styled.div`
  /* ================= Layout ================= */
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-2) var(--space-3);
  
  /* ================= Visual ================= */
  background: var(--color-card);
  border-bottom: 1px solid var(--color-line);
  
  /* ================= Interaction ================= */
  cursor: move;
  user-select: none;
  
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0.375rem;
    transform: translateX(-50%);
    width: 2.5rem;
    height: 0.25rem;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.2) 0px,
      rgba(0, 0, 0, 0.2) 3px,
      transparent 3px,
      transparent 6px
    );
    border-radius: var(--radius-4);
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }
 
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-3) var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-4) var(--space-5);
  }
`;

const DrawerTitle = styled.h3`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  margin: 0;
  gap: var(--space-2);
  
  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const HeaderButtons = styled.div`
  /* ================= Layout ================= */
  display: flex;
  
  /* ================= Box Model ================= */
  gap: var(--space-1);
`;

const IconButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* ================= Box Model ================= */
  padding: var(--space-1);
  
  /* ================= Typography ================= */
  font-size: var(--space-4);
  color: var(--color-text-secondary);
  
  /* ================= Visual ================= */
  background: transparent;
  border: none;
  border-radius: var(--radius-6);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    background: rgba(var(--color-primary-rgb), 0.08);
    color: var(--color-text);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-2);
    font-size: var(--space-5);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-2);
    font-size: var(--space-6);
  }
`;

const DrawerContent = styled.div`
  /* ================= Layout ================= */
  flex: 1;
  
  /* ================= Box Model ================= */
  overflow: hidden;
`;

const DrawerButton = styled.button`
  /* ================= Layout ================= */
  position: fixed;
  top: 50%;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  
  /* ================= Box Model ================= */
  width: 2rem;
  height: 4rem;
  padding: var(--space-1);
  
  /* ================= Typography ================= */
  color: var(--white);
  
  /* ================= Visual ================= */
  background: var(--emerald-green);
  border: none;
  border-top-left-radius: var(--radius-8);
  border-bottom-left-radius: var(--radius-8);
  opacity: 1;

  /* ================= Interaction ================= */
  cursor: pointer;
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
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 3rem;
    height: 6rem;
    padding: var(--space-2) var(--space-1);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 3.5rem;
    height: 7rem;
    padding: var(--space-2);
  }

`;

const ButtonText = styled.span`
  /* ================= Layout ================= */
  writing-mode: vertical-rl;
  text-orientation: mixed;
  
  /* ================= Box Model ================= */
  margin-top: var(--space-1);
  
  /* ================= Typography ================= */
  font-size: 0.625rem;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.5px;
  color: var(--white);
  
  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-top: var(--space-2);
    font-size: 0.75rem;
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 0.875rem;
  }
`;


// Resize handle styles
const ResizeHandle = styled.div<{ $direction: string }>`
  /* ================= Layout ================= */
  position: absolute;
  z-index: 10;
  
  /* ================= Visual ================= */
  background-color: transparent;
  
  /* ================= Animation ================= */
  transition: background-color 0.2s ease;
  
  /* ================= Interaction ================= */
  &:hover {
    background-color: rgba(var(--color-primary-rgb), 0.3);
  }
  
  &:active {
    background-color: rgba(var(--color-primary-rgb), 0.5);
  }
  
  ${props => {
    switch (props.$direction) {
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
  
  /* Add visual indicators for corner resize handles */
  ${props => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(props.$direction) && `
    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border: 2px solid rgba(var(--color-primary-rgb), 0.6);
      border-radius: 1px;
      opacity: 0;
      transition: opacity 0.2s ease;
      
      ${props.$direction === 'top-left' ? 'top: 2px; left: 2px; border-right: none; border-bottom: none;' : ''}
      ${props.$direction === 'top-right' ? 'top: 2px; right: 2px; border-left: none; border-bottom: none;' : ''}
      ${props.$direction === 'bottom-left' ? 'bottom: 2px; left: 2px; border-right: none; border-top: none;' : ''}
      ${props.$direction === 'bottom-right' ? 'bottom: 2px; right: 2px; border-left: none; border-top: none;' : ''}
    }
    
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const EtherpadDrawer: React.FC<EtherpadDrawerProps & { 'data-testid'?: string }> = ({
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
  onFloatingChange,
  'data-testid': dataTestId = 'etherpad-drawer'
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

  // Use refs to avoid recreating event handlers
  const onSizeChangeRef = useRef(onSizeChange);
  const onPositionChangeRef = useRef(onPositionChange);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const rafIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    onSizeChangeRef.current = onSizeChange;
    onPositionChangeRef.current = onPositionChange;
    widthRef.current = width;
    heightRef.current = height;
  });

  // Handle mouse move events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafIdRef.current = requestAnimationFrame(() => {
        if (isResizing) {
          e.preventDefault();
          
          const deltaX = e.clientX - startMousePos.x;
          const deltaY = e.clientY - startMousePos.y;
          
          let newWidth = startSize.width;
          let newHeight = startSize.height;
          let newX = startPosition.x;
          let newY = startPosition.y;
          
          // Calculate new size and position based on resize direction
          if (resizeDirection.includes('right')) {
            const maxWidth = window.innerWidth - startPosition.x - 20;
            newWidth = Math.max(300, Math.min(maxWidth, startSize.width + deltaX));
          }
          if (resizeDirection.includes('left')) {
            const maxDelta = startSize.width - 300;
            const maxLeftMove = startPosition.x - 20;
            const constrainedDelta = Math.max(-maxDelta, Math.min(maxLeftMove, deltaX));
            newWidth = startSize.width - constrainedDelta;
            newX = startPosition.x + constrainedDelta;
          }
          if (resizeDirection.includes('bottom')) {
            const maxHeight = window.innerHeight - startPosition.y - 20;
            newHeight = Math.max(200, Math.min(maxHeight, startSize.height + deltaY));
          }
          if (resizeDirection.includes('top')) {
            const maxDelta = startSize.height - 200;
            const navbarHeight = window.innerHeight * 0.07;
            const maxTopMove = startPosition.y - navbarHeight;
            const constrainedDelta = Math.max(-maxDelta, Math.min(maxTopMove, deltaY));
            newHeight = startSize.height - constrainedDelta;
            newY = startPosition.y + constrainedDelta;
          }
          
          // Use refs to avoid dependency issues
          onSizeChangeRef.current({ width: `${newWidth}px`, height: `${newHeight}px` });
          if (newX !== startPosition.x || newY !== startPosition.y) {
            onPositionChangeRef.current({ x: newX, y: newY });
          }
        } else if (isDragging && isFloating) {
          e.preventDefault();
          
          const deltaX = e.clientX - dragStartPos.x;
          const deltaY = e.clientY - dragStartPos.y;
          
          const drawerWidth = parseInt(widthRef.current.replace('px', '')) || 300;
          const drawerHeight = parseInt(heightRef.current.replace('px', '')) || 200;
          const navbarHeight = window.innerHeight * 0.07;
          
          // Allow dragging over sidebar with minimal left margin
          const newX = Math.max(20, Math.min(window.innerWidth - drawerWidth - 20, startPosition.x + deltaX));
          const newY = Math.max(navbarHeight, Math.min(window.innerHeight - drawerHeight - 20, startPosition.y + deltaY));
          
          onPositionChangeRef.current({ x: newX, y: newY });
        }
      });
    };

    const handleMouseUp = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsResizing(false);
      setIsDragging(false);
      setResizeDirection('');
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
      
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, isDragging, resizeDirection, startMousePos, startPosition, startSize, dragStartPos, isFloating]);

  const toggleFloatingMode = () => {
    onFloatingChange(!isFloating);
  };

  const handleClose = () => {
    if (isFloating) {
      onFloatingChange(false);
    }
    onClose();
  };

  // Always use Portal to render drawer at body level to avoid z-index stacking context issues
  // This prevents iframe reload when switching between floating and docked modes
  return ReactDOM.createPortal(
    <DrawerContainer 
      ref={drawerRef} 
      $isOpen={isOpen} 
      width={width}
      height={height}
      $isFloating={isFloating}
      $top={position.y}
      $left={position.x}
      $isResizing={isResizing}
      data-testid={dataTestId}
    >
      {/* Resize handles - only show in floating mode */}
      {isFloating && (
        <>
          <ResizeHandle $direction="top" onMouseDown={(e) => handleResizeStart(e, 'top')} data-testid="etherpad-resize-top" />
          <ResizeHandle $direction="bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} data-testid="etherpad-resize-bottom" />
          <ResizeHandle $direction="left" onMouseDown={(e) => handleResizeStart(e, 'left')} data-testid="etherpad-resize-left" />
          <ResizeHandle $direction="right" onMouseDown={(e) => handleResizeStart(e, 'right')} data-testid="etherpad-resize-right" />
          <ResizeHandle $direction="top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')} data-testid="etherpad-resize-top-left" />
          <ResizeHandle $direction="top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')} data-testid="etherpad-resize-top-right" />
          <ResizeHandle $direction="bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} data-testid="etherpad-resize-bottom-left" />
          <ResizeHandle $direction="bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} data-testid="etherpad-resize-bottom-right" />
        </>
      )}
      {/* Original left resize handle - only show in docked mode */}
      {!isFloating && <ResizeHandle $direction="left" onMouseDown={(e) => handleResizeStart(e, 'left')} data-testid="etherpad-resize-left-docked" />}
      
      <DrawerHeader ref={headerRef} onMouseDown={handleDragStart} data-testid="etherpad-header">
        <DrawerTitle data-testid="etherpad-title">
          <LuFileText />
          Shared Document
        </DrawerTitle>
        <HeaderButtons>
          <IconButton 
            onClick={toggleFloatingMode} 
            title={isFloating ? "Dock Window" : "Float Window"}
            data-testid="etherpad-float-toggle"
          >
            {isFloating ? <LuMinimize2 /> : <LuMaximize2 />}
          </IconButton>
          <IconButton 
            onClick={handleClose} 
            title="Close"
            data-testid="etherpad-close"
          >
            <LuX />
          </IconButton>
        </HeaderButtons>
      </DrawerHeader>
      <DrawerContent>
        <EtherpadComponent 
          roomId={roomId}
          roomName={roomName}
          height="100%"
          isResizing={isResizing}
        />
      </DrawerContent>
    </DrawerContainer>,
    document.body
  );
};

// Export component with button (独立渲染，不包裹内容)
export const EtherpadDrawerWithButton: React.FC<{ 
  roomId?: number;
  roomName?: string;
  currentRoomId?: number;
}> = ({ 
  roomId,
  roomName,
  currentRoomId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState('40%');
  const [drawerHeight, setDrawerHeight] = useState('60vh');
  const [position, setPosition] = useState(() => {
    const navbarHeight = window.innerHeight * 0.07;
    const defaultDrawerWidth = 600;
    // Center horizontally on screen
    const centerX = (window.innerWidth - defaultDrawerWidth) / 2;
    
    return {
      x: Math.max(20, centerX),
      y: Math.max(navbarHeight + 20, 100)
    };
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
      // Reset position to center of screen when switching to floating mode
      const navbarHeight = window.innerHeight * 0.07;
      const drawerWidthNum = 600;
      const centerX = (window.innerWidth - drawerWidthNum) / 2;
      
      setPosition({
        x: Math.max(20, centerX),
        y: Math.max(navbarHeight + 50, 100)
      });
    } else {
      setDrawerWidth('40%');
      setDrawerHeight('60vh');
    }
  };

  // 如果 Etherpad 功能被禁用，返回 null
  if (!ENABLE_ETHERPAD) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <DrawerButton onClick={handleOpen} title="Open Shared Document" data-testid="etherpad-toggle-btn">
          <LuFileText size={20} color="white" />
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
