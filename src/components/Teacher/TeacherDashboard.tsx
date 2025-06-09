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
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";  
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { fetchTodaySessionsByTeacherAction } from "../../store/action-creators/sessionAction";
import { fetchTeacherStatsAction } from "../../services/api-attendance-service";
import { fetchGroupsAction } from "../../store/action-creators/groupActions";
import { fetchUpcomingSessionsByTeacherAction } from "../../store/action-creators/plannedSessionAction";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";
const { Title, Paragraph } = Typography;

const locales = {
  uk: uk,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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
  const sessions = useSelector((state: RootState) => state.SessionReducer.sessions) ?? [];
  const upcomingSessions = useSelector((state: RootState) => state.PlannedSessionReducer.upcoming);


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

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUpcomingSessionsByTeacherAction(user.id) as any);
    }
  }, [user?.id, dispatch]);

    
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

  const upcomingEvents = upcomingSessions.map((ps: any) => {
    const start = new Date(ps.plannedDate);
    const end = new Date(ps.plannedDate);

    const [sh, sm, ss] = ps.startTime.split(":").map(Number);
    const [eh, em, es] = ps.endTime.split(":").map(Number);

    start.setHours(sh, sm, ss ?? 0);
    end.setHours(eh, em, es ?? 0);

    return {
      id: ps.id,
      title: <span className="notranslate">{ps.sessionName} 🕓 {ps.startTime} — {ps.endTime}</span>,
      start,
      end,
      sessionId: ps.sessionId
    };
  });



  return (
      <div
        style={{
          minHeight: "100dvh",
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
    
            {/* --- Найближчі сесії  --- */}
            <Divider orientation="left">
              <ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
              Найближчі сесії
            </Divider>
            <div
              style={{
                maxWidth: 1000,
                margin: "32px auto",
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 0 12px rgba(0,0,0,0.1)",
              }}
            >
              <Title level={4} style={{ marginBottom: 12 }}>
                Заплановані сесії
              </Title>

            
              <div style={{ width: "100%", overflowX: "auto" }}>
                <BigCalendar
                  localizer={localizer}
                  events={upcomingEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 /* або 100 %, якщо ти керуєш висотою контейнера */ }}
                  defaultView="month"
                  min={new Date(0, 0, 0, 6, 0)}
                  max={new Date(0, 0, 0, 22, 0)}
                  onSelectEvent={(event) =>
                    navigate(`/teacher/session/${(event as any).sessionId}`)
                  }
                  messages={{
                    today: "Сьогодні",
                    next: "→",
                    previous: "←",
                    month: "Місяць",
                    week: "Тиждень",
                    day: "День",
                    agenda: "Список",
                    date: "Дата",
                    time: "Час",
                    event: "Подія",
                    noEventsInRange: "Немає запланованих сесій",
                  }}
                  formats={{
                    timeGutterFormat: (date, culture, loc) =>
                      loc ? loc.format(date, "HH:mm", culture) : "",
                    agendaTimeFormat: (date, culture, loc) =>
                      loc ? loc.format(date, "HH:mm", culture) : "",
                    eventTimeRangeFormat: ({ start, end }, culture, loc) =>
                      loc
                        ? `${loc.format(start, "HH:mm", culture)} – ${loc.format(
                            end,
                            "HH:mm",
                            culture
                          )}`
                        : "",
                  }}
                />
              </div>
            </div>



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
                    <span className="notranslate">
                      <BookOutlined style={{ marginRight: 6, color: "#1976d2" }} />
                      {session.name}
                    </span>
                  }
                >
                  <p>
                    <TeamOutlined style={{ marginRight: 6 }} />
                    Група: <b className="notranslate">{session.groupName}</b>
                  </p>
                  <p>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    Час: 
                      {dayjs.utc(session.startTime).format('DD.MM.YYYY HH:mm')} – {' '}
                      {dayjs.utc(session.endTime).format('HH:mm')}
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
