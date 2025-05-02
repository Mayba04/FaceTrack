import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, message, Input, DatePicker } from "antd";
import { PlusOutlined} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchStudentByGroupIdAction, addStudentToGroupAction } from "../../store/action-creators/userActions";
import { createSessionAction, fetchSessionsAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";    
import { useNavigate } from "react-router-dom";
const { Title } = Typography;


const GroupDetails: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
  
    const groupDetails = useSelector((state: RootState) => state.GroupReducer.group,);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const sessions = useSelector((state: RootState) => state.SessionReducer.sessions,);
    const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading,);
    const students = useSelector((state: RootState) => state.UserReducer.users || [],);
    const user = useSelector((state: RootState) => state.UserReducer.user);
    
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
    const [name, setName] = useState("");

    useEffect(() => {
      if (!groupId) return;
      dispatch(fetchGroupByIdAction(groupId as any));
      dispatch(fetchSessionsAction(groupId)); 
      dispatch(fetchStudentByGroupIdAction(groupId as any));
    }, [groupId, dispatch]);
  
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
        message.warning("Please fill all fields.");
        return;}

      if (!groupId || !startTime || !endTime || !name) {
        message.warning("Заповніть усі поля");
        return;
      }
    
      const newSession = {
        id: 0,
        groupId: Number(groupId),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        createdBy: `${user?.fullName} ${groupDetails?.name}`,
        userId: user.id,
        name: name
      };
    
      await dispatch(createSessionAction(newSession) as any);
      message.success("Сесію створено!");
      dispatch(fetchSessionsAction(Number(groupId) as any));
    };
    

    const handleAddStudent = async () => {
      if (!groupId || !email) return;
      const res: any = await dispatch(
        addStudentToGroupAction(email, +groupId),
      );
      if (res?.success) {
        dispatch(fetchStudentByGroupIdAction(+groupId));
        message.success("Студента додано!");
        setEmail("");
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
      <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
        <Card>
          <Title level={2} style={{ textAlign: "center" }}>
            {groupDetails.name} — Details
          </Title>
  
          <Card title="Students" style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsEmailModalOpen(true)}
              style={{ marginBottom: 10 }}
            >
              Add Student
            </Button>
            {students.length ? (
              <List
                bordered
                dataSource={students}
                renderItem={(s) => (
                  <List.Item>
                    {s.fullName} ({s.email})
                  </List.Item>
                )}
              />
            ) : (
              <p>No students in this group.</p>
            )}
          </Card>
  
          <Card title="Sessions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{ marginBottom: 10 }}
          >
            Create Session
          </Button>
            {sessionsLoading ? (
              <Spin size="small" />
            ) : (
              <List
                bordered
                dataSource={sessions}
                rowKey={(s) => s.id}
                renderItem={(session) => (
                  <List.Item
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <b>ID:</b> {session.id} | <b>Created By:</b>{" "}
                      {session.createdBy} | <b>Start:</b>{" "}
                      {dayjs(session.startTime).format("YYYY-MM-DD HH:mm")} |{" "}
                      <b>End:</b>{" "}
                      {dayjs(session.endTime).format("YYYY-MM-DD HH:mm")}
                    </span>
  
                    <Button
                      type="primary"
                      onClick={() => navigate(`/teacher/session/${session.id}`)}
                    >
                      Перейти до сесії
                    </Button>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Card>
  
        <Modal
          title="Add Student"
          open={isEmailModalOpen}
          onCancel={() => setIsEmailModalOpen(false)}
          onOk={handleAddStudent}
          okText="Add"
          cancelText="Cancel"
          centered
        >
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter student email"
          />
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
          <p>Введіть назву сесії:</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введіть назву сесії"
            style={{ width: "100%", marginBottom: 10 }}
          />
          <p>Оберіть початок та кінець сесії:</p>
          <DatePicker
            showTime
            placeholder="Початок"
            value={startTime}
            onChange={setStartTime}
            style={{ width: "100%", marginBottom: 10 }}
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