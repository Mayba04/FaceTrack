import React from "react";
import { useParams } from "react-router-dom";
import { Card, Typography } from "antd";

const { Title } = Typography;

const SessionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>
                    Session {sessionId} - Details
                </Title>
                <p>Session logic will be implemented here.</p>
            </Card>
        </div>
    );
};

export default SessionPage;
