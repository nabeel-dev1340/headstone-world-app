import React from "react";
import styled from "styled-components";

const Button = styled.button`
  /* Change 'div' to 'button' and update styles */
  display: flex;
  align-items: center;
  gap: 10px;
  border: none; /* Remove the border */
  background-color: transparent; /* Remove the background color */
  padding: 3px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const IconWithText = ({ iconSrc, text, onClick }) => {
  return (
    <Button onClick={onClick}>
      <Icon src={iconSrc} alt="Icon" />
      {text}
    </Button>
  );
};

export default IconWithText;
