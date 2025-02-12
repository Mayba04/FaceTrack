import React from "react";
import { Layout, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #001529, #1890ff)" }}>
            <Content
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "40px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        textAlign: "center",
                        maxWidth: "500px",
                        width: "100%",
                    }}
                >
                    <Title level={2} style={{ color: "#001529" }}>
                        Welcome to FaceTrack
                    </Title>
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                        Secure Face Recognition System
                    </Text>

                    <div style={{ marginTop: "30px" }}>
                        <Button
                            type="primary"
                            size="large"
                            block
                            style={{ background: "#1890ff", borderColor: "#1890ff", marginBottom: "10px" }}
                            onClick={() => navigate("/FaceUpload")}
                        >
                            Upload Face Data
                        </Button>
                        <Button
                            type="default"
                            size="large"
                            block
                            style={{ borderColor: "#1890ff", color: "#1890ff" }}
                            onClick={() => navigate("/real-time")}
                        >
                            Start Real-Time Recognition
                        </Button>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;
