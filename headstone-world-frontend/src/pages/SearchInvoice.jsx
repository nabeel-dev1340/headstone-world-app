import React, { useState, useEffect } from "react";
import IconHome from "../assets/icons/home.png";
import { Link } from "react-router-dom";
import Logout from "../assets/icons/pngwing.com.png";
import styled from "styled-components";
import IconWithText from "../components/IconWithTExt";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SearchInvoice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingOrders, setLoadingOrders] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSearch = async () => {
    if (!searchTerm) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/work-orders?headstoneName=${searchTerm}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewInvoice = async (invoiceNo) => {
    // Make a GET API call using invoiceNo
    try {
      setLoadingOrders((prevLoadingOrders) => ({
        ...prevLoadingOrders,
        [invoiceNo]: true,
      }));

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/invoice?invoiceNo=${invoiceNo}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (response.ok) {
        // Handle the response data as needed
        const invoiceData = await response.json();
        // Pass the data to the new route using route state
        navigate("/invoice-form", { state: invoiceData });
      } else {
        // Handle the case when the GET request fails
        console.error("Failed to fetch invoice data");
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  const viewWorkOrder = async (invoiceNo) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/work-order?invoiceNo=${invoiceNo}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (response.ok) {
        // Handle the response data
        const workOrderData = await response.json();
        // Pass the data to the new route using route state
        navigate("/work-order", { state: workOrderData });
      } else if (response.status === 404) {
        // if work order does not exists
        const stateData = await response.json();
        navigate("/work-order", { state: stateData.data });
      } else {
        console.error("Failed to fetch work order data");
      }
    } catch (error) {
      console.error("Error fetching work order data:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Container>
      <NavBar className="nav-bar">
        <StyledLink to="/landing-page">
          <IconWithText iconSrc={IconHome} text="Home" />
        </StyledLink>
        <StyledLink to="/">
          <IconWithText
            onClick={() => {
              localStorage.removeItem("role");
            }}
            iconSrc={Logout}
            text="Logout"
          />
        </StyledLink>
      </NavBar>
      <Heading>Search Invoice</Heading>
      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Enter headstone name or invoice number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </SearchButton>
      </SearchBar>
      {searchResults.length > 0 ? (
        <ResultsContainer>
          <ResultsHeading>Search Results:</ResultsHeading>
          <ResultsGrid>
            {searchResults.map((result, index) => (
              <ResultTile key={result.invoiceNo} even={index % 2 === 0}>
                <TileHeading>{result.headstoneName}</TileHeading>
                <TileInfo>Invoice No: {result.invoiceNo}</TileInfo>
                <ButtonsContainer>
                  <ViewInvoiceButton
                    onClick={() => viewInvoice(result.invoiceNo)}
                    disabled={loadingOrders[result.invoiceNo]}
                  >
                    {loadingOrders[result.invoiceNo]
                      ? "Loading..."
                      : localStorage.getItem("role") === "viewer"
                      ? "View Invoice"
                      : "View/Edit Invoice"}
                  </ViewInvoiceButton>
                </ButtonsContainer>
              </ResultTile>
            ))}
          </ResultsGrid>
        </ResultsContainer>
      ) : (
        <NoResultsMessage>No results found</NoResultsMessage>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewInvoiceButton = styled.button`
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

const NavBar = styled.nav`
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 2px solid grey;
  border-radius: 5px;
  border-top: none;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000;
`;

const Heading = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  margin-top: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 10px;

  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 24px; /* Rounded corners */
    width: 50%; /* 50% width */
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 24px; /* Rounded corners */
  width: 50%; /* 50% width */
  padding-left: 16px; /* Add some left padding */
`;

const SearchButton = styled.button`
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

const ResultsContainer = styled.div`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultsHeading = styled.h3`
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ResultTile = styled.div`
  background: ${(props) => (props.even ? "#eec843" : "#57facb")};
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const TileHeading = styled.h4`
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
`;

const TileInfo = styled.p`
  font-size: 16px;
  color: #777;
  margin-bottom: 10px;
`;

const ViewOrderButton = styled.button`
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

const NoResultsMessage = styled.p`
  font-size: 16px;
  color: #777;
  text-align: center;
  margin-top: 20px;
`;

const ImagePopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ImagePopupContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  max-width: 100%; /* Limit the width of the popup */
`;

const ScrollableImageContainer = styled.div`
  max-height: 90vh; /* Set a maximum height for scrollability */
  overflow-y: auto; /* Enable vertical scrolling when needed */
  margin-top: 10px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ccc;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
`;

export default SearchInvoice;
