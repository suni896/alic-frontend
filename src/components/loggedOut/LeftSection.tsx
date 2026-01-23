import React from "react";
import styled from "styled-components";

interface LeftSectionProps {
  currentImage: string;
  currentIndex: number; // Include currentIndex
  images: string[]; // Include images array
}

// Styled Component: LeftSectionContainer
const LeftSectionContainer = styled.div<{ $currentImage: string }>`
  flex: 1.2;
  height: 100%;
  position: relative;
  border-radius: var(--radius) 0 0 var(--radius);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${(props) => props.$currentImage});
    background-size: cover;           /* 填满容器 */
    background-repeat: no-repeat;
    background-position: left center; /* 左侧相切，垂直居中 */
    opacity: 0.75;
    z-index: 1;
    border-radius: inherit;
  }

  @media (max-width: 740px) {
    display: none;
    flex: 0;
  }
`;

const CornerLogo = styled.img`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
  width: clamp(62px, 6vw, 68px);
  height: auto;
  pointer-events: none;
`;

const OverlayTitle = styled.div`
  position: absolute;
  top: 40%;
  left: 45%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #fff;
  font-weight: 800;
  font-size: clamp(2.5rem, 4.8vw, 3.5rem);
  letter-spacing: 0.3px;
  text-align: center;
  white-space: nowrap;        /* 不换行 */
  width: max-content;         /* 根据内容长度拉伸宽度 */
  text-align: left;
`;

const LeftSection: React.FC<LeftSectionProps> = ({
  currentImage,
}) => {
  return (
    <LeftSectionContainer $currentImage={currentImage}>
      <CornerLogo src="/alic.png" alt="ALIC Logo" />
      <OverlayTitle>Welcome to ALIC</OverlayTitle>
    </LeftSectionContainer>
  );
};

export default LeftSection;
