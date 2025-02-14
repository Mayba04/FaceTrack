import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const TeacherDashboard: React.FC = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Card style={{ maxWidth: 600, margin: "auto" }}>
        <Title level={2}>Teacher Dashboard</Title>
        <Paragraph>Welcome, Teacher! Manage your students and assignments here.</Paragraph>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
