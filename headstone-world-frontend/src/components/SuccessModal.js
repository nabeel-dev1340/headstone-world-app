import React from "react";
import Modal from "react-modal"; // Make sure to import the appropriate modal library
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// Create a fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const StyledSuccessModal = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-in-out;
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

export const ModalText = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const CloseButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #999;
  }
`;

export const GenerateButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const SuccessModal = ({
  isOpen,
  onClose,
  headStoneName,
  invoiceNo,
  date,
  customerName,
  customerEmail,
  customerPhone,
  cemeteryName,
  cemeteryAddress,
  cemeteryContact,
  lotNumber,
  customCemetery,
  details,
  model1,
  selectModelImage1,
  modelColor1,
  model2,
  selectModelImage2,
  modelColor2,
  model3,
  selectModelImage3,
  modelColor3,
  model4,
  modelColor4,
  model5,
  modelColor5,
}) => {
  const navigate = useNavigate();

  const handleGenerateWorkOrder = () => {
    // Navigate to the WorkOrder page and pass data as state
    navigate("/work-order", {
      state: {
        headStoneName,
        invoiceNo,
        date,
        customerEmail,
        customerName,
        customerPhone,
        cemeteryName,
        cemeteryAddress,
        cemeteryContact,
        lotNumber,
        customCemetery,
        details,
        model1,
        selectModelImage1,
        modelColor1,
        model2,
        selectModelImage2,
        modelColor2,
        model3,
        selectModelImage3,
        modelColor3,
        model4,
        modelColor4,
        model5,
        modelColor5,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Success Modal"
    >
      <StyledSuccessModal>
        <ModalTitle>Invoice Submitted Successfully!</ModalTitle>
        <ModalText>Your invoice has been submitted successfully.</ModalText>
        <ButtonContainer>
          <CloseButton onClick={onClose}>Close</CloseButton>
          {/* <GenerateButton onClick={handleGenerateWorkOrder}>
            Generate WorkOrder
          </GenerateButton> */}
        </ButtonContainer>
      </StyledSuccessModal>
    </Modal>
  );
};

export default SuccessModal;
