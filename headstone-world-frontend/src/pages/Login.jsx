import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  // State for managing username, password, and error message
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // React Router hook for navigation
  const navigate = useNavigate();
  // Access the authentication context
  const { setIsAuthenticated } = useAuth(); // Access the authentication context

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password cannot be empty");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        const { message, role, user } = responseData;
        localStorage.removeItem("role");
        localStorage.setItem("role", role);
        localStorage.removeItem("username");
        localStorage.setItem("username", user);
        console.log(message);
        setIsAuthenticated(true);
        navigate("/landing-page");
      } else if (response.status === 401) {
        setError("Incorrect username or password");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      setError("An error occurred. Please try again later.");
    }
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleLogin]);

  return (
    <Container>
      <LoginForm>
        <Title>Please log in to continue</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}{" "}
        {/* Display error message */}
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoginButton onClick={handleLogin}>Login</LoginButton>
      </LoginForm>
    </Container>
  );
};

export default LoginPage;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoginForm = styled.div`
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const LoginButton = styled.button`
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

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 10px;
`;
