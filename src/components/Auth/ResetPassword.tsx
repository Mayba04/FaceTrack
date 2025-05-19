import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Card, Input, Button, Form, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPassword, validateResetToken } from "../../services/api-user-service"; // реалізуй цей сервіс

const { Title, Paragraph } = Typography;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const checkTokenValidity = async () => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");
    const tokenParam = queryParams.get("token");

    if (!emailParam || !tokenParam) {
      message.error("Посилання недійсне або прострочене.");
      navigate("/login");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);

    try {
      const response = await validateResetToken(emailParam, tokenParam); 
      const { success, message: serverMessage } = response as any;
      if (!success) {
        message.error(serverMessage || "Недійсне або протерміноване посилання.");
        navigate("/login");
      }
    } catch {
      message.error("Не вдалося перевірити посилання.");
      navigate("/login");
    }
  };

  checkTokenValidity();
}, [location, navigate]);


  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await resetPassword({
        email: email!,
        token: token!,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });
      const { success, message: serverMessage } = response as any;
      if (success) {
        message.success(serverMessage);
        navigate("/login");
      } else {
        message.error(serverMessage || "Не вдалося змінити пароль.");
      }
    } catch {
      message.error("Помилка при зміні пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #001529, #1890ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 12px",
      }}
    >
      <Card
        style={{
          maxWidth: 450,
          width: "100%",
          borderRadius: 12,
          textAlign: "center",
          padding: "32px 24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Title level={3} style={{ color: "#001529" }}>
          Встановіть новий пароль
        </Title>
        <Paragraph style={{ fontSize: 16 }}>
          Введіть новий пароль для облікового запису.
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="password"
            label="Новий пароль"
            rules={[
              { required: true, message: "Введіть пароль" },
              { min: 6, message: "Мінімум 6 символів" },
              {
                validator: (_, value) =>
                  /[A-Z]/.test(value)
                    ? Promise.resolve()
                    : Promise.reject("Має бути хоча б одна велика літера"),
              },
              {
                validator: (_, value) =>
                  /[a-z]/.test(value)
                    ? Promise.resolve()
                    : Promise.reject("Має бути хоча б одна мала літера"),
              },
              {
                validator: (_, value) =>
                  /\d/.test(value)
                    ? Promise.resolve()
                    : Promise.reject("Має бути хоча б одна цифра"),
              },
              {
                validator: (_, value) =>
                  /[!@#$%^&*()_\-+=.,:;?]/.test(value)
                    ? Promise.resolve()
                    : Promise.reject("Має бути спецсимвол"),
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Новий пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Підтвердження паролю"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Підтвердіть пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject("Паролі не збігаються");
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Підтвердьте пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Змінити пароль
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
