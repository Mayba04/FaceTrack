import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, message, Input, DatePicker, Row, Col, Divider } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchStudentByGroupIdAction, addStudentToGroupAction } from "../../store/action-creators/userActions";
import { createSessionAction, fetchSessionsAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";
import { deleteStudentFromGroup } from "../../services/api-group-service";
import { fetchFilteredStudents } from "../../services/api-user-service";

const { Title } = Typography;

const GroupDetailsAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const groupDetails = useSelector((state: RootState) => state.GroupReducer.group);
  const loading = useSelector((state: RootState) => state.GroupReducer.loading);
  const sessions = useSelector((state: RootState) => state.SessionReducer.sessions);
  const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading);
  const studentsLoading = useSelector((state: RootState) => state.UserReducer.loading,);
  const students = useSelector((state: RootState) => state.UserReducer.users || []);
  const user = useSelector((state: RootState) => state.UserReducer.user);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupByIdAction(groupId));
    dispatch(fetchSessionsAction(String(groupId)));
    dispatch(fetchStudentByGroupIdAction(groupId));
  }, [groupId, dispatch]);

  useEffect(() => {
  if (isEmailModalOpen) {
    setPage(1);
    setSearchResults([]);
    setHasMore(true);
    loadStudents(1, "");
  }
}, [isEmailModalOpen]);


  const loadStudents = async (pageNumber = 1, query = searchQuery) => {
  const res: any = await fetchFilteredStudents({
    fullName: query,
    groupId: +groupId!,
    pageNumber,
    pageSize: 10,
  });

  if (res.success) {
    setSearchResults(prev => {
      const ids = new Set(prev.map(s => s.id));
      const fresh = res.payload.filter((s: any) => !ids.has(s.id));
      return [...prev, ...fresh];
    });

    setHasMore(res.payload.length === 10 && res.payload.some((s: any) => !searchResults.find(p => p.id === s.id)));
  } else {
    message.error(res.message || "Помилка завантаження студентів");
    setHasMore(false);
  }
};
  const handleCreateSession = async () => {
    if (!groupId || !user?.fullName || !startTime || !endTime || !name) {
      message.warning("Заповніть усі поля");
      return;
    }

    const newSession = {
      id: 0,
      groupId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      createdBy: `${user.fullName} ${groupDetails?.name}`,
      userId: user.id,
      name,
    };

    await dispatch(createSessionAction(newSession) as any);
    message.success("Сесію створено!");
    await dispatch(fetchSessionsAction(groupId as any));
    setIsModalOpen(false);
    setStartTime(null);
    setEndTime(null);
    setName("");
  };

  const handleAddStudent = async (emailToAdd: string) => {
    if (!groupId || !emailToAdd) return;
    const res: any = await dispatch(addStudentToGroupAction(emailToAdd, groupId));
    if (res?.success) {
      dispatch(fetchStudentByGroupIdAction(groupId));
      message.success("Студента додано!");
      setSearchQuery("");
      setSearchResults([]);
      setIsEmailModalOpen(false);
    } else {
      message.error(res?.message || "Помилка додавання студента");
    }
  };

   const handleRemoveStudent = async (studentId: string) => {
        if (!groupId) return;
        const response = await deleteStudentFromGroup(studentId, +groupId);
        const { success, message: msg } = response as any;
  
        if (success) {
          message.success("Студента видалено!");
          await dispatch(fetchStudentByGroupIdAction(groupId as any));
        } else {
          message.error(msg || "Помилка видалення студента");
        }
      };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStartTime(null);
    setEndTime(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!groupDetails)
    return (
      <Title level={3} style={{ textAlign: "center", marginTop: 32 }}>
        Групу не знайдено
      </Title>
    );

    return (
  <div
      style={{
        minHeight: "100vh",
        padding: "48px 16px",
        background: "linear-gradient(120deg,#e3f0ff 0%,#c6e6fb 100%)",
      }}
    >
      <Card
        style={{
          maxWidth: 880,
          width: "100%", // додаємо для мобільної адаптації
          margin: "0 auto",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 8px 24px rgba(30,64,175,0.12)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", fontWeight: 800, marginBottom: 0 }}>
          Деталі групи: <span className="notranslate">{groupDetails.name}</span>
        </Title>
        <p style={{ textAlign: "center", marginBottom: 32 }}>
          Кількість студентів:&nbsp;
          <b>{groupDetails.studentsCount}</b>
        </p>

        <Row gutter={[24, 32]}>
          {/* Студенти */}
          <Col xs={24} md={12}>
            <Typography.Title level={4} style={{ marginBottom: 16, fontWeight: 700 }}>
              🎓 Студенти
            </Typography.Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsEmailModalOpen(true)}
              block
              style={{ marginBottom: 16 }}
            >
              Додати
            </Button>

            {studentsLoading ? (
              <Spin />
            ) : students.length ? (
              <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
                <List
                  split={false}
                  dataSource={students}
                  renderItem={(s) => (
                    <List.Item
                      style={{
                        background: "#f6fafd",
                        borderRadius: 12,
                        marginBottom: 12,
                        padding: "14px 18px",
                      }}
                    >
                      <div>
                        <b className="notranslate">{s.fullName}</b>
                        <div style={{ fontSize: 13, color: "#64748b" }} className="notranslate">{s.email}</div>
                      </div>
                      <Button
                        danger
                        type="text"
                        shape="circle"
                        icon={<CloseOutlined />}
                        onClick={() => handleRemoveStudent(s.id)}
                        style={{ marginLeft: "auto" }}
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <p style={{ color: "#888" }}>У групі ще немає студентів</p>
            )}
          </Col>

          {/* Сесії */}
          <Col xs={24} md={12}>
            <Typography.Title level={4} style={{ marginBottom: 16, fontWeight: 700 }}>
              🗓️ Сесії
            </Typography.Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              block
              style={{ marginBottom: 16 }}
            >
              Створити
            </Button>

            {sessionsLoading ? (
              <Spin />
            ) : sessions.length ? (
              <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
                <List
                  split={false}
                  dataSource={sessions}
                  renderItem={(session) => (
                    <List.Item
                      style={{
                        background: "#f6fafd",
                        borderRadius: 12,
                        marginBottom: 12,
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <b className="notranslate" >{session.name}</b>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {dayjs.utc(session.startTime).format('DD.MM.YYYY HH:mm')} – {' '}
                          {dayjs.utc(session.endTime).format('HH:mm')}
                        </div>
                      </div>
                      <Button
                        type="default"
                        onClick={() => navigate(`/admin/session/${session.id}`)}
                      >
                        Відкрити
                      </Button>
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <p style={{ color: "#888" }}>Сесій ще не створено</p>
            )}
          </Col>
        </Row>
      </Card>
    
        {/* ── Модал «додати студента» ─────────────────────────── */}
        <Modal
          title="Додати студента"
          open={isEmailModalOpen}
          onCancel={() => {
            setIsEmailModalOpen(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
          footer={null}
          centered
        >
          <Input
            value={searchQuery}
            placeholder="Email або повне ім’я студента"
            allowClear
            onChange={e => {
              const value = e.target.value;
              setSearchQuery(value);
              setPage(1);
              setSearchResults([]);
              setHasMore(true);
              loadStudents(1, value.trim());
            }}
            style={{ marginBottom: 8 }}
          />

          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            <List
              dataSource={searchResults}
              renderItem={(student) => (
                <List.Item
                  key={student.id}
                  actions={[
                    <Button
                      key="add"
                      type="primary"
                      disabled={student.isInGroup}
                      onClick={() => handleAddStudent(student.email)}
                    >
                      {student.isInGroup ? "У групі" : "Додати"}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    className="notranslate"
                    title={student.fullName}
                    description={student.email}
                  />
                </List.Item>
              )}
            />

            {hasMore || page > 1 ? (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <Button
                  block
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    loadStudents(next, searchQuery.trim());
                  }}
                  disabled={!hasMore}
                >
                  {hasMore ? "Завантажити ще" : "Усі завантажено"}
                </Button>
              </>
            ) : null}
          </div>
        </Modal>
    
        {/* ── Модал «створити сесію» ──────────────────────────── */}
        <Modal
          title="Створити сесію"
          open={isModalOpen}
          onCancel={handleCancel}
          onOk={handleCreateSession}
          okText="Створити"
          cancelText="Скасувати"
          centered
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва сесії"
            style={{ marginBottom: 12 }}
          />
          <DatePicker
            showTime
            placeholder="Початок"
            value={startTime}
            onChange={setStartTime}
            style={{ width: "100%", marginBottom: 12 }}
          />
          <DatePicker
            showTime
            placeholder="Кінець"
            value={endTime}
            onChange={setEndTime}
            style={{ width: "100%" }}
          />
        </Modal>
      </div>
    );
};

export default GroupDetailsAdmin;
