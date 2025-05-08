import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  SmileOutlined,
  FrownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserStatisticsAction } from "../../store/action-creators/userActions";
import {
  fetchSystemStatistics,
  fetchTopBottomSessions,
} from "../../services/api-attendance-service";

const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------------- state ---------------- */
  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    moderators: 0,
    blockedUsers: 0,
    groups: 0,
    sessions: 0,
    avgAttendance: 0,
  });

  const [attendanceAnalytics, setAttendanceAnalytics] = useState({
    bestSession: { subject: "—", group: "—", rate: 0 },
    worstSession: { subject: "—", group: "—", rate: 0 },
  });

  /* -------------- effects -------------- */
  useEffect(() => {
    (dispatch as any)(fetchUserStatisticsAction()).then((r: any) => {
      if (r?.success) {
        setStats((p) => ({
          ...p,
          students: r.payload.students,
          lecturers: r.payload.lecturers,
          moderators: r.payload.moderators,
          blockedUsers: r.payload.blockedUsers,
        }));
      }
    });

    fetchSystemStatistics().then((r: any) => {
      if (r?.success) {
        setStats((p) => ({
          ...p,
          groups: r.payload.groups,
          sessions: r.payload.sessions,
          avgAttendance: r.payload.avgAttendance,
        }));
      }
    });

    fetchTopBottomSessions().then((r: any) => {
      if (r?.success) {
        setAttendanceAnalytics({
          bestSession: r.payload.best,
          worstSession: r.payload.worst,
        });
      }
    });
  }, [dispatch]);

  /* ---------------- UI ---------------- */
  return (
    /** ░░ Контейнер, який і малює фон, і дає прокрутку ░░ */
    <div
      style={{
        height: "100vh",                     // рівно висота екрану
        overflowY: "auto",                   // ← зʼявляється scroll-bar
        padding: "48px 16px 64px",
        background: "linear-gradient(120deg,#e3f0ff 0%,#c6e6fb 100%)",
        boxSizing: "border-box",
      }}
    >
      <Card
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 8px 24px rgba(30,64,175,0.1)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", fontWeight: 800 }}>
          📊 Панель адміністратора
        </Title>

        {/* ---------- статистика ---------- */}
        <Divider orientation="left">🔢 Статистика</Divider>
        <Row gutter={[24, 24]}>
          <Col span={6}><Statistic title="Студенти"   value={stats.students}   prefix={<UserOutlined />} /></Col>
          <Col span={6}><Statistic title="Викладачі"  value={stats.lecturers}  prefix={<UserOutlined />} /></Col>
          <Col span={6}><Statistic title="Модератори" value={stats.moderators} prefix={<UserOutlined />} /></Col>
          <Col span={6}>
            <Statistic
              title="Заблоковані"
              value={stats.blockedUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={8}><Statistic title="Групи"  value={stats.groups}   prefix={<TeamOutlined />} /></Col>
          <Col span={8}><Statistic title="Сесії"  value={stats.sessions} prefix={<ScheduleOutlined />} /></Col>
          <Col span={8}>
            <Statistic
              title="Середня відвідуваність"
              value={stats.avgAttendance}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Col>
        </Row>

        {/* ---------- аналітика ---------- */}
        <Divider orientation="left" style={{ marginTop: 40 }}>
          📉 Відвідуваність (ост. 7 днів)
        </Divider>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card bordered>
              <Paragraph strong>
                <SmileOutlined style={{ color: "green" }} /> Найкраща сесія
              </Paragraph>
              <Paragraph>📚 <b>{attendanceAnalytics.bestSession.subject}</b></Paragraph>
              <Paragraph>👥 Група: {attendanceAnalytics.bestSession.group}</Paragraph>
              <Paragraph>📊 Відвідуваність: {attendanceAnalytics.bestSession.rate}%</Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered>
              <Paragraph strong>
                <FrownOutlined style={{ color: "red" }} /> Найгірша сесія
              </Paragraph>
              <Paragraph>📚 <b>{attendanceAnalytics.worstSession.subject}</b></Paragraph>
              <Paragraph>👥 Група: {attendanceAnalytics.worstSession.group}</Paragraph>
              <Paragraph>📉 Відвідуваність: {attendanceAnalytics.worstSession.rate}%</Paragraph>
            </Card>
          </Col>
        </Row>

        {/* ---------- швидкі дії ---------- */}
        <Divider orientation="left" style={{ marginTop: 40 }}>
          🚨 Швидкі дії
        </Divider>
        <Space wrap size="middle">
          <Button type="primary" onClick={() => navigate("/manage-users")}>
            🔍 Керування користувачами
          </Button>
          <Button onClick={() => navigate("/admin/group/create")}>👥 Створити групу</Button>
          <Button onClick={() => navigate("/admin/session/create")}>🗓️ Створити сесію</Button>
          <Button type="dashed" onClick={() => navigate("/admin/add-user")}>
            📩 Додати користувача
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AdminDashboard;
