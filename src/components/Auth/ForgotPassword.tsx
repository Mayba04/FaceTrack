import React, { useState } from "react";
import { Typography, Card, Input, Button, Form, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { sendResetPasswordEmail } from "../../services/api-user-service"; // реалізуй цей запит
import { useNavigate } from 'react-router-dom'; 
const { Title, Paragraph } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await sendResetPasswordEmail(values.email);
      const { success, message: serverMessage } = response as any;
      if (success) {
        message.success(serverMessage);
      } else {
        message.error(serverMessage || "Не вдалося надіслати лист.");
      }
      navigate("/login")
    } catch  {
      message.error("Сталася помилка при надсиланні листа.");
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
          Відновлення паролю
        </Title>
        <Paragraph style={{ fontSize: 16 }}>
          Введіть вашу електронну пошту, і ми надішлемо вам посилання для зміни паролю.
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введіть електронну пошту" },
              { type: "email", message: "Невірний формат пошти" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
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
              Надіслати посилання
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
