import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Modal,
  Button,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  List,
  Alert,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { fetchTodaySessionsByTeacherAction } from "../../store/action-creators/sessionAction";
import { fetchTeacherStatsAction } from "../../services/api-attendance-service";
import { fetchGroupsAction } from "../../store/action-creators/groupActions";

const { Title, Paragraph } = Typography;

// вибираємо поле-ідентифікатор, яке реально приходить із бекенда
const getSessionId = (s: any) =>
  s?.sessionHistoryId ?? s?.sessionId ?? s?.id ?? "";

const TeacherDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) => state.UserReducer.loggedInUser
  );

  const { groups } = useSelector((state: RootState) => state.GroupReducer);
  const sessions = useSelector(
    (state: RootState) => state.SessionReducer.sessions
  ) ?? [];

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    avgAttendance: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await dispatch(
        fetchTodaySessionsByTeacherAction(user!.id) as unknown as any
      );
      await dispatch(fetchGroupsAction(user!.id) as unknown as any);

      const { success, payload } = (await fetchTeacherStatsAction(
        user!.id
      )) as any;

      if (success) setStats(payload);
      else message.warning("Не вдалося завантажити статистику");
    } catch {
      message.error("Помилка при завантаженні дашборду");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
          padding: "32px 16px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "auto" }}>
          <Card
            loading={loading}
            style={{
              borderRadius: 20,
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              padding: 24,
            }}
          >
            <Title level={2} style={{ marginBottom: 24, color: "#002766", fontWeight: 800 }}>
              Панель викладача
            </Title>
    
            {/* --- Сесії на сьогодні --- */}
            <Divider orientation="left">
              <ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
              Сесії на сьогодні
            </Divider>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              Переглянути сьогоднішні сесії
            </Button>
    
            {/* --- Групи --- */}
            <Divider orientation="left">
              <TeamOutlined style={{ marginRight: 8, color: "#1976d2" }} />
              Ваші групи
            </Divider>
            <Paragraph style={{ marginBottom: 4 }}>
              Кількість груп: <b>{groups.length}</b>
            </Paragraph>
            <Button onClick={() => navigate("/teacher/groups")}>
              Переглянути всі групи
            </Button>
    
            {/* --- Статистика --- */}
            <Divider orientation="left">
              <BarChartOutlined style={{ marginRight: 8, color: "#1976d2" }} />
              Загальна статистика
            </Divider>
            <Row gutter={24}>
              <Col span={8}>
                <Statistic
                  title="Студентів"
                  value={stats.totalStudents}
                  prefix={<UsergroupAddOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Проведено сесій"
                  value={stats.totalSessions}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="% Відвідуваність"
                  value={stats.avgAttendance}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                />
              </Col>
            </Row>
    
            {/* --- Найближчі сесії (заглушка) --- */}
            <Divider orientation="left">
              <ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
              Найближчі сесії
            </Divider>
            <Alert message="В розробці..." type="info" showIcon />
          </Card>
        </div>
    
        {/* --- Модалка з сесіями --- */}
        <Modal
          title="Сесії на сьогодні"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          {sessions.length ? (
            <List
              dataSource={sessions}
              renderItem={(session: any) => (
                <Card
                  key={getSessionId(session)}
                  size="small"
                  style={{ marginBottom: 16, borderRadius: 12 }}
                  title={
                    <span>
                      <BookOutlined style={{ marginRight: 6, color: "#1976d2" }} />
                      {session.name}
                    </span>
                  }
                >
                  <p>
                    <TeamOutlined style={{ marginRight: 6 }} />
                    Група: <b>{session.groupName}</b>
                  </p>
                  <p>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    Час: {moment(session.startTime).format("HH:mm")} –{" "}
                    {moment(session.endTime).format("HH:mm")}
                  </p>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(`/teacher/session/${getSessionId(session)}`)
                    }
                  >
                    Перейти до сесії
                  </Button>
                </Card>
              )}
            />
          ) : (
            <Paragraph style={{ textAlign: "center", padding: "16px 0" }}>
              Сьогодні у вас немає занять.
            </Paragraph>
          )}
        </Modal>
      </div>
    );
};

export default TeacherDashboard;
