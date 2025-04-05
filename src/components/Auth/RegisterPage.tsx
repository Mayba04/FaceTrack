import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Input, Button, message, Form, Card, Typography, Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import { auditStudentAction, logout, registerUserAction } from "../../store/action-creators/userActions";
import { useDispatch } from "react-redux";
import { registerUserWithRole } from "../../services/api-user-service";

const { Title } = Typography;

const RegisterPage: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [email, setEmail] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const [groupId, setGroupId] = useState<number>(0);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailFromUrl = params.get("email");
        const tokenFromUrl = params.get("token");

        if (emailFromUrl && tokenFromUrl) {
            setEmail(emailFromUrl);
            setToken(tokenFromUrl);

            checkTokenValidity(tokenFromUrl);
        } else {
            setError("Invalid link");
        }
    }, [location]);

    
    const checkTokenValidity = async (token: string) => {
        try {
          const decodedToken: any = jwtDecode(token);
          console.log("Decoded token:", decodedToken);
      
          const currentTime = Math.floor(Date.now() / 1000);
      
          // 1. Перевірка, чи не зареєстрований вже
          const auditResult = await auditStudentAction(decodedToken.email);
          const { success } = auditResult as any; 
          if (success) {
            setIsTokenValid(false);
            return;
          }
      
          if (decodedToken.exp < currentTime) {
            setError("This link has either expired or has already been used.");
            setIsTokenValid(false);
            return;
          }
      
          if (decodedToken.groupId) {
            setGroupId(decodedToken.groupId);
          }
          if (decodedToken.role) {
            setRole(decodedToken.role);
          }
      
          setIsTokenValid(true);
        } catch {
          setError("Invalid token format.");
          setIsTokenValid(false);
        }
      };
      
    
    
    
      const handleRegister = async () => {
        if (!email || !token || !isTokenValid) {
          setError("Invalid or expired token.");
          return;
        }
      
        if (!password || !confirmPassword) {
          setError("Please enter both password fields.");
          return;
        }
      
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
      
        setLoading(true);
        try {
          if (groupId) {
            await registerUserAction(email, password, confirmPassword, groupId);
          } else if (role) {
            await registerUserWithRole(email, password, confirmPassword, role); 
          } else {
            setError("Token is missing both group and role info.");
            return;
          }
      
          message.success("Registration successful");
          await dispatch(logout() as any);
          navigate("/login");
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(`Registration failed: ${error.message}`);
          } else {
            setError("Registration failed. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      };
    
    if (isTokenValid === false) {
        navigate("/invalidlink");
    }

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <Card style={{ padding: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                <Title level={2} style={{ textAlign: "center" }}>Register</Title>
                {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
                <Form onFinish={handleRegister}>
                    <Form.Item label="Email" required>
                        <Input value={email || ""} disabled />
                    </Form.Item>
                    <Form.Item label="Password" required>
                        <Input.Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </Form.Item>
                    <Form.Item label="Confirm Password" required>
                        <Input.Password
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            disabled={loading || !isTokenValid}
                        >
                            {loading ? <Spin size="small" /> : "Register"}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;

