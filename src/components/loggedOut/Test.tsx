import axios from "axios";
import styled from "styled-components";
import { useState } from "react";
import { API_BASE_URL } from "../../config/apiConfig";

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
`;

// Debug section styling
const DebugSection = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f8ff;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  color: black;
`;

const DebugMessage = styled.div`
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
`;

interface UserInformation {
  userId: number;
  userEmail: string;
  userName: string;
  userPortrait: string;
}

// Create API client with enhanced debugging
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Origin: "http://localhost:5173",
  },
});

// Add a request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("===== REQUEST =====");
    console.log("Request URL:", config.url);
    console.log("Request Method:", config.method);
    console.log("Request Headers:", config.headers);
    console.log("withCredentials:", config.withCredentials);
    console.log("===================");
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor with enhanced debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("===== RESPONSE =====");
    console.log("Response Status:", response.status);
    console.log("Response StatusText:", response.statusText);

    // Log all available header names
    console.log("Available header names:", Object.keys(response.headers));

    // Try to access headers with different methods
    console.log("Headers as object:", response.headers);

    // Try to access set-cookie with different case variations
    const setCookieValues = [
      response.headers["set-cookie"],
      response.headers["Set-Cookie"],
    ];
    console.log("set-cookie attempts:", setCookieValues);

    // Log specific CORS headers
    console.log(
      "Access-Control-Allow-Origin:",
      response.headers["access-control-allow-origin"]
    );
    console.log(
      "Access-Control-Allow-Credentials:",
      response.headers["access-control-allow-credentials"]
    );
    console.log(
      "Access-Control-Expose-Headers:",
      response.headers["access-control-expose-headers"]
    );

    console.log("=====================");
    return response;
  },
  (error) => {
    console.error("===== RESPONSE ERROR =====");
    if (axios.isAxiosError(error)) {
      console.error("Error message:", error.message);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      if (error.response) {
        console.error("Error response headers:", error.response.headers);
      }
    } else {
      console.error("Non-Axios error:", error);
    }
    console.error("==========================");
    return Promise.reject(error);
  }
);

const Test = () => {
  const [user, setUser] = useState<UserInformation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Function to add debug messages
  const addDebugMessage = (message: string) => {
    console.log(message);
    setDebugInfo((prev) => [...prev, message]);
  };

  // Try multiple authentication approaches
  const tryMultipleAuthApproaches = async (bearerToken: string) => {
    // Try approach 1: Authorization header
    try {
      addDebugMessage("APPROACH 1: Using Authorization header");
      const authResponse = await apiClient.get("/v1/user/get_user_info", {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      if (authResponse.data.code === 200) {
        setUser(authResponse.data.data);
        setLoginStatus("User information retrieved with Authorization header");
        addDebugMessage("Authorization header approach succeeded");
        return true;
      }
    } catch (error) {
      addDebugMessage("Authorization header approach failed");
      if (axios.isAxiosError(error)) {
        addDebugMessage(`Error: ${error.message}`);
      }
    }

    // Try approach 2: Using manual cookie setting
    try {
      addDebugMessage(
        "APPROACH 2: Setting cookie manually via document.cookie"
      );
      // Try to set the cookie manually
      document.cookie = `JWT_TOKEN=${bearerToken}; path=/; domain=112.74.92.135`;
      addDebugMessage(`Current cookies: ${document.cookie}`);

      const cookieResponse = await apiClient.get("/v1/user/get_user_info");

      if (cookieResponse.data.code === 200) {
        setUser(cookieResponse.data.data);
        setLoginStatus("User information retrieved with manual cookie");
        addDebugMessage("Manual cookie approach succeeded");
        return true;
      }
    } catch (error) {
      addDebugMessage("Manual cookie approach failed");
      if (axios.isAxiosError(error)) {
        addDebugMessage(`Error: ${error.message}`);
      }
    }

    // Try approach 3: JWT_TOKEN in query parameter (if the API supports it)
    try {
      addDebugMessage("APPROACH 3: Using token as query parameter");
      const queryResponse = await apiClient.get(
        `/v1/user/get_user_info?token=${bearerToken}`
      );

      if (queryResponse.data.code === 200) {
        setUser(queryResponse.data.data);
        setLoginStatus("User information retrieved with query parameter");
        addDebugMessage("Query parameter approach succeeded");
        return true;
      }
    } catch (error) {
      addDebugMessage("Query parameter approach failed");
      if (axios.isAxiosError(error)) {
        addDebugMessage(`Error: ${error.message}`);
      }
    }

    return false;
  };

  const signin = async () => {
    setIsLoading(true);
    setLoginStatus("Attempting to log in...");
    setDebugInfo([]); // Clear previous debug info

    try {
      // Login request
      addDebugMessage("Sending login request...");
      addDebugMessage(`Current cookies: ${document.cookie || "none"}`);

      const loginResponse = await apiClient.post("/auth/login", {
        password: "passwordpassword",
        userEmail: "laviniathosatriavi.rouge@gmail.com",
      });

      addDebugMessage(`Login response status: ${loginResponse.status}`);

      if (loginResponse.data.code === 200) {
        setLoginStatus("Login successful! Checking response...");
        addDebugMessage(`Login successful: code ${loginResponse.data.code}`);

        // Check if cookies were set by the server
        addDebugMessage(`Cookies after login: ${document.cookie || "none"}`);

        // Extract the JWT token from "Bearer Token" in response body
        const bearerToken = loginResponse.data.data["Bearer Token"];

        // Check if the token exists
        if (bearerToken) {
          addDebugMessage("Token found in response body");
          addDebugMessage(`Token preview: ${bearerToken.substring(0, 15)}...`);

          // Try multiple authentication approaches
          const authSuccess = await tryMultipleAuthApproaches(bearerToken);

          if (!authSuccess) {
            setLoginStatus("All authentication approaches failed");
            addDebugMessage("Could not retrieve user info with any approach");
          }
        } else {
          setLoginStatus("No token found in response");
          addDebugMessage("Could not find Bearer Token in response data");
          addDebugMessage(
            `Response data: ${JSON.stringify(loginResponse.data)}`
          );
        }
      } else {
        addDebugMessage(
          `Login returned non-200 code: ${loginResponse.data.code}`
        );
        addDebugMessage(
          `Login message: ${loginResponse.data.message || "No message"}`
        );
      }
    } catch (error) {
      setLoginStatus("Login failed");
      addDebugMessage("Login request failed");

      if (axios.isAxiosError(error) && error.response) {
        addDebugMessage(`Error status: ${error.response.status}`);
        addDebugMessage(`Error data: ${JSON.stringify(error.response.data)}`);
      } else {
        addDebugMessage(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      handleError(error, "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message || `${fallbackMessage}. Please try again.`
      );
    } else {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Authentication Test</h2>
      <Button onClick={signin} disabled={isLoading}>
        {isLoading ? "Processing..." : "Sign In"}
      </Button>

      <div
        style={{
          marginTop: "10px",
          color: loginStatus.includes("failed") ? "red" : "green",
        }}
      >
        {loginStatus}
      </div>

      {user && (
        <div style={{ marginTop: "20px" }}>
          <h3>User Information</h3>
          <p>
            <strong>ID:</strong> {user.userId}
          </p>
          <p>
            <strong>Name:</strong> {user.userName}
          </p>
          <p>
            <strong>Email:</strong> {user.userEmail}
          </p>
        </div>
      )}

      {/* Debug Information Section */}
      {debugInfo.length > 0 && (
        <DebugSection>
          <h3>Debug Information</h3>
          {debugInfo.map((message, index) => (
            <DebugMessage key={index}>{message}</DebugMessage>
          ))}
        </DebugSection>
      )}
    </div>
  );
};

export default Test;
