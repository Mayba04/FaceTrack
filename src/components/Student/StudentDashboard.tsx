import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Divider, Statistic, Row, Col, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodaysSessionsAction } from "../../store/action-creators/sessionAction";
import { RootState } from "../../store";
import { getTotalAttendanceStats } from "../../services/api-attendance-service";
import { AimOutlined, BarChartOutlined, CalendarOutlined, CheckSquareOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer.loggedInUser);

  const [loading, setLoading] = useState(false);
  const [todaySessionsCount, setTodaySessionsCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  const attendancePercent = totalSessions
    ? Math.round(((totalSessions - missedCount) / totalSessions) * 100)
    : 0;

  useEffect(() => {
    if (user?.id) {
      fetchStudentStats();
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const sessionsResponse: any = await dispatch(
        fetchTodaysSessionsAction(user?.id as any) as any
      );
      if (sessionsResponse.success) {
        setTodaySessionsCount(sessionsResponse.payload.length);
      } else {
        message.error("Не вдалося завантажити заняття на сьогодні");
      }

      const statsResponse = await getTotalAttendanceStats(user?.id as any);
      const { success, payload } = statsResponse as any;
      if (success) {
        setMissedCount(payload.missed);
        setTotalSessions(payload.totalSessions);
      } else {
        message.warning("Не вдалося завантажити статистику відвідуваності");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 16px",
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
      }}
    >
      <Card
        style={{
          maxWidth: 680,
          margin: "0 auto",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 8px 24px rgba(30,64,175,0.1)",
        }}
      >
        <Title level={2} style={{ fontWeight: 800 }}>
          👋 Вітаємо у <span style={{ color: "#3b2fc0" }}>FaceTrack</span>
        </Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Сьогоднішні заняття */}
            <Divider orientation="left">
              <AimOutlined style={{ marginRight: 8 }} />
              Сьогоднішні заняття
            </Divider>
            <Paragraph>
              У вас <b>{todaySessionsCount}</b> сесій сьогодні
            </Paragraph>
            <Button
              type="primary"
              block
              style={{ marginBottom: 20 }}
              onClick={() => navigate("/student/sessions/today")}
            >
              Переглянути сьогоднішні заняття
            </Button>

            {/* Історія відвідування */}
            <Divider orientation="left">
              <CheckSquareOutlined style={{ marginRight: 8 }} />
              Історія відвідувань
            </Divider>
            <Button
              type="default"
              block
              onClick={() => navigate("/student/attendance/history")}
              style={{
                marginBottom: 20,
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              Переглянути всі відмітки
            </Button>

            {/* Майбутні сесії */}
            <Divider orientation="left">
              <CalendarOutlined style={{ marginRight: 8 }} />
              Майбутні сесії
            </Divider>
            <Paragraph style={{ color: "#888", marginBottom: 20 }}>
              В розробці…
            </Paragraph>

            {/* Статистика */}
            <Divider orientation="left">
              <BarChartOutlined style={{ marginRight: 8 }} />
              Ваша статистика
            </Divider>
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Statistic
                  title="Пропущено (всього)"
                  value={missedCount}
                  suffix="н"
                  valueStyle={{ fontWeight: 700 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Усього сесій"
                  value={totalSessions}
                  valueStyle={{ fontWeight: 700 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="% Відвідуваність"
                  value={attendancePercent}
                  suffix="%"
                  valueStyle={{ fontWeight: 700 }}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;