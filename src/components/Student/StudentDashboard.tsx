import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Card style={{ maxWidth: 600, margin: "auto" }}>
        <Title level={2}>Student Dashboard</Title>
        <Paragraph>Welcome, Student! Here you can track your progress.</Paragraph>
      </Card>
    </div>
  );
};

export default StudentDashboard;
