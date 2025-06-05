import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, message, Input, DatePicker, Divider } from "antd";
import { CloseOutlined, PlusOutlined} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchStudentByGroupIdAction, addStudentToGroupAction } from "../../store/action-creators/userActions";
import { createSessionAction, fetchSessionsAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";    
import { useNavigate } from "react-router-dom";
const { Title } = Typography;
import "./GroupDetails.css";
import { deleteStudentFromGroup } from "../../services/api-group-service";
import { fetchFilteredStudents } from "../../services/api-user-service";

const GroupDetails: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
  
    const groupDetails = useSelector((state: RootState) => state.GroupReducer.group,);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const sessions = useSelector((state: RootState) => state.SessionReducer.sessions) || [];
    const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading,);
    const studentsLoading = useSelector((state: RootState) => state.UserReducer.loading,);
    const students = useSelector((state: RootState) => state.UserReducer.users || [],);
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
      dispatch(fetchGroupByIdAction(groupId as any));
      dispatch(fetchSessionsAction(groupId)); 
      dispatch(fetchStudentByGroupIdAction(groupId as any));
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



    const showModal = (session?: any) => {
      setIsModalOpen(true);
      if (session) {
          setStartTime(dayjs(session.startTime));
          setEndTime(dayjs(session.endTime));
      }
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      setStartTime(null);
      setEndTime(null);
    };

    const handleCreateSession = async () => {
      if (!groupId || !user?.fullName || !startTime || !endTime) {
        message.warning("Будь ласка, заповніть усі поля");
        return;}

      if (!groupId || !startTime || !endTime || !name) {
        message.warning("Заповніть усі поля");
        return;
      }
    
      const newSession = {
        id: 0,
        groupId: Number(groupId),
        startTime: startTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z', 
        endTime: endTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        createdBy: `${user?.fullName} ${groupDetails?.name}`,
        userId: user.id,
        name: name
      };
    
      await dispatch(createSessionAction(newSession) as any);
      message.success("Сесію створено!");
      await dispatch(fetchSessionsAction(Number(groupId) as any));
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

    const handleAddStudent = async (emailToAdd: string) => {
    if (!groupId || !emailToAdd) return;
    const res: any = await dispatch(addStudentToGroupAction(emailToAdd, +groupId));

    if (res?.success) {
      dispatch(fetchStudentByGroupIdAction(+groupId));
      message.success("Студента додано!");
      setSearchQuery("");
      setSearchResults([]);
      setIsEmailModalOpen(false);
    } else {
      message.error(res?.message || "Помилка додавання студента");
    }
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
          Group not found
        </Title>
      );
  
      return (
        <div className="group-page">
          <Card className="group-card">
            <Title level={2} style={{ textAlign: "center", fontWeight: 800 }}>
              Деталі групи: <span className="notranslate">{groupDetails.name}</span>
            </Title>
            <p style={{ textAlign: "center", marginBottom: 32 }}>
              Кількість студентів:&nbsp;
              <b>{groupDetails.studentsCount}</b>
            </p>
    
            {/* ───────── GRID ───────── */}
            <div className="group-grid">
              {/* Студенти */}
              <section className="grid-col">
                <Divider orientation="left" style={{ fontWeight: 700 }}>
                  🎓 Студенти
                </Divider>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsEmailModalOpen(true)}
                  style={{ marginBottom: 16 }}
                  block
                >
                  Додати
                </Button>

                {studentsLoading ? (
                  <Spin />
                  ) : students.length ? (
                     <div className="scrollable-list">
                      <List
                        dataSource={students}
                        split={false}
                        renderItem={(s) => (
                          <List.Item className="group-list-item">
                            <div style={{ marginInline: 12 }}>
                              <b className="notranslate">{s.fullName}</b>
                              <div className="item-sub notranslate">{s.email}</div>
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

              </section>
    
              {/* Сесії */}
              <section className="grid-col" >
                <Divider orientation="left" style={{ fontWeight: 700 }}>
                  🗓️ Сесії
                </Divider>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showModal}
                  style={{ marginBottom: 16 }}
                  block
                >
                  Створити
                </Button>

                {sessionsLoading ? (
                  <Spin size="small" />
                ) : sessions.length ? (
                   <div className="scrollable-sessions">
                    <List
                      dataSource={sessions}
                      split={false}
                      renderItem={(session) => (
                        <List.Item className="group-list-item space-between">
                          <div style={{ marginInline: 12 }}>
                            <b className="notranslate">{session.name}</b>
                            <div className="item-sub">
                              {dayjs.utc(session.startTime).format('DD.MM.YYYY HH:mm')} – {' '}
                              {dayjs.utc(session.endTime).format('HH:mm')}
                            </div>
                          </div>
                          <Button
                            style={{ marginInline: 12 }}
                            onClick={() => navigate(`/teacher/session/${session.id}`)}
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
              </section>
            </div>
          </Card>
    
          {/* ───── Модальні вікна ───── */}
        {/* ───── Модалка «Додати студента» ───── */}
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
        {/* ─── Пошук ─── */}
        <Input
          value={searchQuery}
          placeholder="Email або повне ім’я студента"
          allowClear
          onChange={e => {
            const value = e.target.value;
            setSearchQuery(value);
            setPage(1);
            setSearchResults([]);
            setHasMore(true);          // ← скинули прапорець
            loadStudents(1, value.trim());
          }}

          style={{ marginBottom: 8 }}
        />

        {/* ─── Список + скрол ─── */}
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
                  title={student.fullName}
                  description={student.email}
                />
              </List.Item>
            )}
          />

          {/* ─── Пагінація ─── */}
          {hasMore || page > 1 ? (               /* показуємо тільки якщо є що гортати */
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
    
    export default GroupDetails;