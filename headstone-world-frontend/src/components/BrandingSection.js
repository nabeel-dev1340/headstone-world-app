import React from "react";
import styled from "styled-components";
import HorizontalRule from "./HorizontalRule";

const BrandingSection = () => {
  return (
    <BrandingContainer>
      <Branding>HEADSTONE WORLD</Branding>
      <BrandingInfo>
        <p id="phone">713-597-8899</p>
        <p>headstoneworld@yahoo.com</p>
        <p id="address">15715 N.Frwy Service Rd Houston, TX 77090</p>
      </BrandingInfo>
      <HorizontalRule />
    </BrandingContainer>
  );
};

export default BrandingSection;

const BrandingContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding-top: 15px;
  background: #e7e9eb;

  #phone {
    width: 110px;
  }
  #address {
    width: 340px;
  }
`;

const Branding = styled.h3`
  width: 200px;
`;
const BrandingInfo = styled.div`
  display: flex;
  gap: 25px;
`;
