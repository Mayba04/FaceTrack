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
  Modal,
  Form,
  Input,
  Select,
  message,
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
import { useSelector } from "react-redux";
import { createGroupAction } from "../../store/action-creators/groupActions";
import { fetchLecturersAction } from "../../store/action-creators/userActions";
import { RootState } from "../../store";
import { User } from "../../store/reducers/UserReducer/types";
import { DatePicker } from "antd";
import { createSessionAction } from "../../store/action-creators/sessionAction";// змінити на твій шлях
import { fetchFilteredGroupsAction } from "../../store/action-creators/groupActions";
import { addNewUserAction } from "../../store/action-creators/userActions";

const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();


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
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [addForm] = Form.useForm();
  const { loading: userLoading } = useSelector((state: RootState) => state.UserReducer);
  const [teacherOptions, setTeacherOptions] = useState<User[]>([]);
  const [isSessionVisible, setIsSessionVisible] = useState(false);
  const [sessionForm] = Form.useForm();
  const { groups } = useSelector((state: RootState) => state.GroupReducer);
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);
  const [addStudentForm] = Form.useForm();

  /* -------------- effects -------------- */

  useEffect(() => {
  const fetchAllStats = async () => {
    try {
      const [userRes, systemRes, topBottomRes] = await Promise.all([
        dispatch(fetchUserStatisticsAction()),
        fetchSystemStatistics(),
        fetchTopBottomSessions(),
      ]);

      // 1. Статистика користувачів
      if ("success" in userRes && userRes.success) {
        setStats((p) => ({
          ...p,
          students: userRes.payload.students,
          lecturers: userRes.payload.lecturers,
          moderators: userRes.payload.moderators,
          blockedUsers: userRes.payload.blockedUsers,
        }));
      }

      // 2. Статистика системи
      const { success: sysSuccess, payload: sysPayload } = systemRes as any;
      if (sysSuccess) {
        setStats((p) => ({
          ...p,
          groups: sysPayload.groups,
          sessions: sysPayload.sessions,
          avgAttendance: sysPayload.avgAttendance,
        }));
      }

      // 3. Краща/гірша сесія
       const { success: topSuccess, payload: topPayload } = topBottomRes as any;
      if (topSuccess) {
        setAttendanceAnalytics({
          bestSession: topPayload.best,
          worstSession: topPayload.worst,
        });
      }
    } catch (err) {
      console.error(err);
      message.error("Не вдалося завантажити статистику");
    }
  };

  fetchAllStats();
}, [dispatch]);


  // useEffect(() => {
  //   (dispatch as any)(fetchUserStatisticsAction()).then((r: any) => {
  //     if (r?.success) {
  //       setStats((p) => ({
  //         ...p,
  //         students: r.payload.students,
  //         lecturers: r.payload.lecturers,
  //         moderators: r.payload.moderators,
  //         blockedUsers: r.payload.blockedUsers,
  //       }));
  //     }
  //   });

  //   fetchSystemStatistics().then((r: any) => {
  //     if (r?.success) {
  //       setStats((p) => ({
  //         ...p,
  //         groups: r.payload.groups,
  //         sessions: r.payload.sessions,
  //         avgAttendance: r.payload.avgAttendance,
  //       }));
  //     }
  //   });

  //   fetchTopBottomSessions().then((r: any) => {
  //     if (r?.success) {
  //       setAttendanceAnalytics({
  //         bestSession: r.payload.best,
  //         worstSession: r.payload.worst,
  //       });
  //     }
  //   });
  // }, [dispatch]);

  useEffect(() => {
    if (isAddVisible) searchTeachers("");
  }, [isAddVisible]);

useEffect(() => {
  if (isSessionVisible) {
    dispatch(fetchFilteredGroupsAction({ name: "", pageNumber: 1, pageSize: 10 }));
  }
}, [isSessionVisible]);


  const searchTeachers = async (name: string) => {
    const res: any = await dispatch(fetchLecturersAction(name));
    if (res?.success) setTeacherOptions(res.payload);
  };




const handleCreateSession = async () => {
  try {
    const values = await sessionForm.validateFields();

    const selectedGroup = groups.find(g => g.id === values.groupId);

    if (!selectedGroup) {
      message.error("Не вдалося знайти вибрану групу");
      return;
    }

    const payload = {
      groupId: values.groupId,
      name: values.name,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
      userId: selectedGroup.teacherId,
      createdBy: `${selectedGroup.teacherName} ${selectedGroup.name}`
    };

    const res = await dispatch(createSessionAction(payload as any));
    if (res?.success !== false) {
      message.success("Сесію створено");
      setIsSessionVisible(false);
      sessionForm.resetFields();
      navigate(`/admin/groups/${values.groupId}`);
    } else {
      message.error("Помилка при створенні сесії");
    }
  } catch {
    message.error("Не вдалося створити сесію");
  }
};




  const handleCreateGroup = async () => {
    try {
      const values = await addForm.validateFields();
      const res = await dispatch(createGroupAction(values.name, values.teacherId));
      if (res?.success !== false) {
        message.success("Групу створено");
        setIsAddVisible(false);
        addForm.resetFields();
        navigate("/admin/groups"); // редірект після створення
      }
    } catch {
      message.error("Не вдалося створити групу");
    }
  };
  /* ---------------- UI ---------------- */
  return (
   
    <div
      style={{
        height: "100vh",                  
        overflowY: "auto",                   
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
              <Paragraph>📚 <b className="notranslate" >{attendanceAnalytics.bestSession.subject}</b></Paragraph>
              <Paragraph>👥 Група: <span className="notranslate">{attendanceAnalytics.bestSession.group}</span></Paragraph>
              <Paragraph>📊 Відвідуваність: {attendanceAnalytics.bestSession.rate}%</Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered>
              <Paragraph strong>
                <FrownOutlined style={{ color: "red" }} /> Найгірша сесія
              </Paragraph>
              <Paragraph>📚 <b className="notranslate" >{attendanceAnalytics.worstSession.subject}</b></Paragraph>
              <Paragraph>👥 Група: <span className="notranslate">{attendanceAnalytics.worstSession.group}</span></Paragraph>
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
          <Button onClick={() => setIsAddVisible(true)}>👥 Створити групу</Button>
          <Button onClick={() => setIsSessionVisible(true)}>🗓️ Створити сесію</Button>
          <Button onClick={() => setIsAddStudentVisible(true)}>➕ Додати користувача</Button>
        </Space>
      </Card>
      <Modal title="Створити групу" open={isAddVisible} onCancel={() => setIsAddVisible(false)} onOk={handleCreateGroup} okText="Створити">
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Назва групи" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacherId" label="Викладач" rules={[{ required: true }]}>
            <Select           
              showSearch
              placeholder="Пошук за ПІБ"
              filterOption={false}
              onSearch={searchTeachers}
              loading={userLoading}
              notFoundContent={userLoading ? "Завантаження..." : "Немає результатів"}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {teacherOptions.map((t) => (
                <Select.Option  key={t.id} value={t.id} label={t.fullName}>
                  <span className="notranslate">{t.fullName}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Створити сесію"
        open={isSessionVisible}
        onCancel={() => setIsSessionVisible(false)}
        onOk={handleCreateSession}
        okText="Створити"
      >
        <Form form={sessionForm} layout="vertical">
          <Form.Item name="groupId" label="Група" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Пошук групи"
              filterOption={(input, option) =>
                (option?.label as any).toLowerCase().includes(input.toLowerCase())
              }
              options={groups.map((g) => ({
                label: <span className="notranslate">{g.name}</span>,
                value: g.id,
              }))}
            />
          </Form.Item>


          <Form.Item name="name" label="Назва сесії" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="startTime" label="Час початку" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item name="endTime" label="Час завершення" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
      title="Додати нового користувача"
      open={isAddStudentVisible}
      onCancel={() => setIsAddStudentVisible(false)}
      onOk={async () => {
        try {
          const values = await addStudentForm.validateFields();
          const res = await dispatch(addNewUserAction(values.email, values.role));
          if (res.success) {
            message.success(res.message);
            setIsAddStudentVisible(false);
            addStudentForm.resetFields();
          } else {
            message.error(res.message || "Помилка при додаванні");
          }
        } catch {
          message.error("Не вдалося додати користувача");
        }
      }}
      okText="Додати"
      cancelText="Скасувати"
      centered
    >
      <Form form={addStudentForm} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Введіть email" },
            { type: "email", message: "Невірний формат email" },
          ]}
        >
          <Input placeholder="example@email.com" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Роль"
          rules={[{ required: true, message: "Оберіть роль" }]}
        >
          <Select placeholder="Оберіть роль">
            <Select.Option className="notranslate" value="Student">Student</Select.Option>
            <Select.Option className="notranslate" value="Lecturer">Lecturer</Select.Option>
            <Select.Option className="notranslate" value="Moderator">Moderator</Select.Option>
            {useSelector((state: RootState) => state.UserReducer.loggedInUser?.role) === "Admin" && (
              <Select.Option className="notranslate" value="Admin">Admin</Select.Option>
            )}
          </Select>
        </Form.Item>
      </Form>
    </Modal>

      
    </div>
    
  );
};

export default AdminDashboard;
