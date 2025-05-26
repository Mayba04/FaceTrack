import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Input, Button, message, Form, Typography, Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import { auditStudentAction, logout, registerUserAction } from "../../store/action-creators/userActions";
import { useDispatch } from "react-redux";
import { registerUserWithRole } from "../../services/api-user-service";
import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

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
    const [fullName, setFullName] = useState<string>("");
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
            await registerUserAction(email, password, confirmPassword, groupId, fullName);
          } else if (role) {
            await registerUserWithRole(email, password, confirmPassword, role, fullName); 
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

      const validatePassword = (_: any, value: string) => {
    const allowedSpecials = "!@#$%^&*()_-+=.,:;?";
    if (!value) return Promise.reject("Пароль обов’язковий");
    if (value.length < 6) return Promise.reject("Мінімум 6 символів");
    if (!/[A-Z]/.test(value)) return Promise.reject("Має бути велика літера");
    if (!/[a-z]/.test(value)) return Promise.reject("Має бути мала літера");
    if (!/[0-9]/.test(value)) return Promise.reject("Має бути цифра");
    if (!new RegExp(`[${allowedSpecials.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(value))
      return Promise.reject(`Має бути спецсимвол із дозволених: ${allowedSpecials}`);
    return Promise.resolve();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #001529, #1890ff)",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <SafetyCertificateOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          <Title level={2} style={{ textAlign: "center", color: "#001529", marginTop: "16px" }}>
            Register
          </Title>
        </div>

        {error && <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</div>}

        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item label="Email">
            <Input value={email || ""} disabled />
          </Form.Item>

          <Form.Item
            label="ПІБ"
            name="fullName"
            rules={[
              { required: true, message: "Вкажіть ваше прізвище, ім’я та по батькові" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const parts: string[] = value.trim().split(/\s+/);
                  if (value.length > 60) {
                    return Promise.reject("Занадто довге ПІБ (максимум 60 символів)");
                  }
                  if (parts.length < 2) {
                    return Promise.reject("Вкажіть щонайменше прізвище та ім’я");
                  }
                  if (parts.some((part: string) => part.length < 2)) {
                    return Promise.reject("Кожна частина має містити щонайменше 2 символи");
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              maxLength={60}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Іваненко Іван Іванович"
            />
          </Form.Item>




          <Form.Item
            label="Password"
            name="password"
            rules={[{ validator: validatePassword }]}
            hasFeedback
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Підтвердження паролю обов’язкове" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject("Паролі не збігаються");
                },
              }),
            ]}
          >
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              disabled={!isTokenValid}
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              {loading ? <Spin size="small" /> : "Register"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;