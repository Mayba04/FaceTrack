import React from "react";
import { Card, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const goToTodaySessions = () => {
    navigate("/student/sessions/today");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Card style={{ maxWidth: 600, margin: "auto" }}>
        <Title level={2}>Student Dashboard</Title>
        <Paragraph>Welcome, Student! Here you can track your progress.</Paragraph>

        <Button type="primary" onClick={goToTodaySessions} style={{ marginTop: 20 }}>
          View Today's Sessions
        </Button>
      </Card>
    </div>
  );
};

export default StudentDashboard;
