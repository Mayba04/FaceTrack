import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Divider, Statistic, Row, Col, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodaysSessionsAction } from "../../store/action-creators/sessionAction";
import { RootState } from "../../store";

const { Title, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer.loggedInUser);

  const [loading, setLoading] = useState(false);
  const [todaySessionsCount, setTodaySessionsCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0); // Якщо є API — сюди кількість пропущених за тиждень
  const [totalSessions, setTotalSessions] = useState(0); // Якщо є API — сюди всі сесії
  const missedPercent = totalSessions ? Math.round((missedCount / totalSessions) * 100) : 0;

  useEffect(() => {
    if (user?.id) {
      fetchStudentStats();
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);

      // Отримати кількість сьогоднішніх сесій
      const sessionsResponse: any = await dispatch(fetchTodaysSessionsAction(user?.id as any) as any);
      if (sessionsResponse.success) {
        setTodaySessionsCount(sessionsResponse.payload.length);
      } else {
        message.error("Не вдалося завантажити заняття на сьогодні");
      }

      // TODO: Запити кількість пропущених за тиждень і всі сесії, коли буде готовий бекенд
      setMissedCount(2)
      setTotalSessions(2)

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 16px", maxWidth: 700, margin: "auto" }}>
      <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <Title level={2}>👋 Вітаємо у FaceTrack</Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* 1. Сьогоднішні заняття */}
            <Divider orientation="left">🎯 Сьогоднішні заняття</Divider>
            <Paragraph>
              У вас <b>{todaySessionsCount}</b> сесій сьогодні
            </Paragraph>
            <Button type="primary" onClick={() => navigate("/student/sessions/today")}>
              Переглянути сьогоднішні заняття
            </Button>

            {/* 2. Історія відвідування */}
            <Divider orientation="left">✅ Історія відвідування</Divider>
            <Button onClick={() => navigate("/student/attendance/history")}>
              Переглянути всі відмітки
            </Button>

            {/* 3. Майбутні сесії */}
            <Divider orientation="left">📅 Майбутні сесії</Divider>
            <Paragraph style={{ color: "#888" }}>В розробці...</Paragraph>

            {/* 4. Статистика */}
            <Divider orientation="left">📊 Ваша статистика</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Пропущено (за тиждень)" value={missedCount} suffix="н" />
              </Col>
              <Col span={8}>
                <Statistic title="Усього сесій" value={totalSessions} />
              </Col>
              <Col span={8}>
                <Statistic title="% Відвідуваність" value={missedPercent} suffix="%" />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
