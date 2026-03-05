import React from "react";
import styled from "styled-components";

interface LeftSectionProps {
  currentImage: string;
  currentIndex: number; // Include currentIndex
  images: string[]; // Include images array
}

// Styled Component: LeftSectionContainer
const LeftSectionContainer = styled.div<{ $currentImage: string }>`
  display: none;
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

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    display: block;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    display: block;
  }
`;

const CornerLogo = styled.img`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 3;
  width: 3.5rem;
  height: auto;
  pointer-events: none;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    top: 1rem;
    left: 1rem;
    width: 4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    top: 1rem;
    left: 1rem;
    width: 5rem;
  }
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
  font-size: 2rem;
  text-align: center;
  white-space: nowrap;
  width: max-content;
  text-align: left;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 3.5rem;
  }
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
