import React from "react";
import styled, { keyframes } from "styled-components";

const Option = ({ imageSrc, text }) => {
  return (
    <OptionContainer>
      <OptionImage src={imageSrc} alt={text} />
      <h3>{text}</h3>
    </OptionContainer>
  );
};

export default Option;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  animation: ${fadeInUp} 1s ease;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const OptionImage = styled.img`
  width: 150px;
  height: 150px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px,
    rgba(0, 0, 0, 0.22) 0px 10px 10px;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;
