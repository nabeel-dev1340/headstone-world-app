import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Logout from "../assets/icons/pngwing.com.png";
import Option from "../components/Option";
import IconWithText from "../components/IconWithTExt";
import { Link } from "react-router-dom";
import invoiceImage from "../assets/images/invoice.png";
import searchImage from "../assets/images/search.png";
import reportImage from "../assets/images/report.png";
import searchInvoice from "../assets/images/pngwing.com.png";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const headerStyle = {
    backgroundColor: "#f5f5f5",
    borderBottom: "2px solid black",
    padding: "10px 0",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  return (
    <>
      <NavBar className="nav-bar">
        <h1>Headstone World</h1>
        <h3>
          Logged in as:{" "}
          {localStorage.getItem("role") === "admin"
            ? "Admin"
            : localStorage.getItem("role") === "adminWO"
            ? "Admin Work Order"
            : localStorage.getItem("role") === "viewer"
            ? "Viewer"
            : localStorage.getItem("role")}
        </h3>
        <StyledLink to="/">
          <IconWithText
            onClick={() => {
              localStorage.removeItem("role");
              localStorage.removeItem("username");
            }}
            iconSrc={Logout}
            text="Logout"
          />
        </StyledLink>
      </NavBar>
      <LandingPageContainer>
        <Branding>
          {/* <HeadingImage src={headingImage} alt="Headstone World" /> */}
          <Heading>Welcome to Headstone World</Heading>
        </Branding>
        {localStorage.getItem("role") === "admin" ? (
          <OptionContainer>
            <StyledLink to="/invoice-form">
              <Option imageSrc={invoiceImage} text="Create New Invoice" />
            </StyledLink>
            <StyledLink to="/search-invoice">
              <Option imageSrc={searchInvoice} text="Search Invoice" />
            </StyledLink>
            <StyledLink to="/search-order">
              <Option imageSrc={searchImage} text="Search Order" />
            </StyledLink>
            <StyledLink to="/report">
              <Option imageSrc={reportImage} text="Report" />
            </StyledLink>
          </OptionContainer>
        ) : localStorage.getItem("role") === "viewer" ? (
          <OptionContainer>
            <StyledLink to="/search-invoice">
              <Option imageSrc={searchInvoice} text="Search Invoice" />
            </StyledLink>
            <StyledLink to="/search-order">
              <Option imageSrc={searchImage} text="Search Order" />
            </StyledLink>
          </OptionContainer>
        ) : (
          <OptionContainer>
            <StyledLink to="/search-order">
              <Option imageSrc={searchImage} text="Search Order" />
            </StyledLink>
          </OptionContainer>
        )}
      </LandingPageContainer>
    </>
  );
};

export default LandingPage;

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 95vh;
  gap: 30px;
  background-color: #f5f5f5; /* Appropriate background color */
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000;
`;

const Branding = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
const Heading = styled.h1`
  text-align: center;
`;

const OptionContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const HeadingImage = styled.img`
  width: 80px;
  height: 80px;
`;

const NavBar = styled.nav`
  background: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 2px solid black;
  border-top: none;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;
