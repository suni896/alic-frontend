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
  border-radius: var(--radius-12) 0 0 var(--radius-12);
  overflow: hidden;

  /* 用半透明白遮罩叠加图片，让图片更白 */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    url(${(props) => props.$currentImage});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left center;
`;

const CornerLogo = styled.img`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
  width: 5rem;
  height: auto;
  pointer-events: none;
`;

const OverlayTitle = styled.div`
  position: absolute;
  top: 40%;
  left: 45%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: var(--white);
  font-family: var(--font-urbanist);
  font-weight: var(--weight-bold);
  font-size: 3.5rem;
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
