import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserAction } from '../store/action-creators/userActions';
import { RootState } from '../store/reducers';
import { useNavigate } from 'react-router-dom'; // ✅ Додаємо useNavigate

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.UserReducer.loading);
  const navigate = useNavigate(); // ✅ Використовуємо хук ТУТ

  const onFinish = async (values: any) => {
    console.log('Logging in with:', values);

    try {
      await dispatch<any>(loginUserAction(values, navigate)); // ✅ Передаємо navigate у екшен
    } catch (error) {
      message.error('Login failed. Please check your credentials.' + error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #001529, #1890ff)',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} style={{ textAlign: 'center', color: '#001529', marginTop: '16px' }}>
            FaceTrack
          </Title>
        </div>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          Sign in to continue
        </Text>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ background: '#1890ff', borderColor: '#1890ff' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Don’t have an account?{' '}
            <a href="/InDevelopment" style={{ color: '#1890ff' }}>
              Sign Up
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
