import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Modal,
  Spin,
  List,
  message,
  DatePicker,
  Input,
  Tooltip,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  updateSessionAction,
  deleteSessionAction,
  fetchPendingFaceRequestsAction,
  approveFaceRequestAction,
  rejectFaceRequestAction,
  GetSessionByIdAction,
} from "../../store/action-creators/sessionAction";
import { getAttendanceBySession } from "../../services/api-attendance-service";
import { startSession } from "../../services/api-session-service";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { APP_ENV } from "../../env";

const { Title } = Typography;
const keyOf = (item: any): React.Key =>
  item?.id ?? item?.studentId ?? item?.requestId ?? JSON.stringify(item);

const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.SessionReducer.session);
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const groupName = groups.find((g) => g.id === Number(session?.groupId))?.name ?? "—";

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [faceRequests, setFaceRequests] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (sessionId) dispatch(GetSessionByIdAction(Number(sessionId)) as any);
  }, [sessionId, dispatch]);

  const handleStart = async () => {
    if (!user?.id || !session?.id) return;
    await startSession(Number(session.id), user.id);
    navigate(`/session/${session.id}`);
  };

  const handleEdit = () => {
    if (!session) return;
    setName(session.name || "");
    setStartTime(dayjs(session.startTime));
    setEndTime(dayjs(session.endTime));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!startTime || !endTime || !session) return;
    const payload = {
      id: String(session.id),
      groupId: Number(session.groupId),
      startTime: startTime.toDate().toISOString(),
      endTime: endTime.toDate().toISOString(),
      createdBy: session.createdBy,
      userId: session.userId,
      name,
    };
    await dispatch(updateSessionAction(payload) as any);
    await dispatch(GetSessionByIdAction(Number(sessionId)) as any);
    message.success("Сесію оновлено");
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (!session) return;
    Modal.confirm({
      title: "Видалити сесію?",
      onOk: async () => {
        await dispatch(deleteSessionAction(session.id) as any);
        message.success("Сесію видалено");
        navigate("/teacher/groups");
      },
    });
  };

  const openAttendance = async () => {
    const res = await getAttendanceBySession(Number(sessionId));
    const { success, payload } = res as any;
  
    if (success && Array.isArray(payload)) {
      console.log("Attendance loaded:", payload);
      setAttendance(payload);
      setAttendanceOpen(true);
    } else {
      message.error("Не вдалося завантажити відвідуваність.");
    }
  };
  


  const openFaceReq = async () => {
    setCheckModalOpen(true);
    const res = await dispatch(fetchPendingFaceRequestsAction(Number(sessionId)) as any);
    setFaceRequests(res?.payload || []);
  };

  const handleApprove = async (id: number) => {
    const res = await dispatch(approveFaceRequestAction(id) as any);
    if (res.success) setFaceRequests((p) => p.filter((f) => f.id !== id));
  };

  const handleReject = async (id: number) => {
    const res = await dispatch(rejectFaceRequestAction(id) as any);
    if (res.success) setFaceRequests((p) => p.filter((f) => f.id !== id));
  };

  const handleImageClick = (url: string) => setPreviewImage(url);

  if (!session) return <Spin style={{ marginTop: 64 }} size="large" />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
        paddingTop: 48,
        paddingBottom: 64,
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 6px 32px 0 rgba(30,64,175,0.12)",
        }}
      >
        <Title level={3} style={{ color: "#1976d2", fontWeight: 800 }}>
          Сесія: {session.name}
        </Title>
        <p><UserOutlined style={{ marginRight: 8, color: "#1976d2" }} />Група: <b>{groupName}</b></p>
        <p><ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
          {dayjs(session.startTime).format("DD.MM.YYYY HH:mm")} – {dayjs(session.endTime).format("HH:mm")}</p>
        <p>Створив: <b>{session.createdBy}</b></p>

        
        <div
        style={{
            display: "flex",
            gap: 16,
            marginTop: 20,
            justifyContent: "center",
            flexWrap: "wrap",
        }}
        >
        <Tooltip title="Запустити сесію">
            <Button
            shape="circle"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            />
        </Tooltip>

        <Tooltip title="Редагувати сесію">
            <Button
            shape="circle"
            icon={<EditOutlined />}
            onClick={handleEdit}
            />
        </Tooltip>

        <Tooltip title="Видалити сесію">
            <Button
            shape="circle"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            />
        </Tooltip>

        <Tooltip title="Переглянути відвідуваність">
            <Button
            shape="circle"
            icon={<TeamOutlined />}
            onClick={openAttendance}
            />
        </Tooltip>

        <Tooltip title="Перевірити Face ID-запити">
            <Button
            shape="circle"
            icon={<EyeOutlined />}
            onClick={openFaceReq}
            />
        </Tooltip>
        </div>



      </div>

      <Modal title="Редагування сесії" open={editOpen} onCancel={() => setEditOpen(false)} onOk={handleSave}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Назва сесії"
          style={{ marginBottom: 12 }}
        />
        <DatePicker
          showTime
          style={{ width: "100%", marginBottom: 12 }}
          value={startTime}
          onChange={setStartTime}
        />
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={endTime}
          onChange={setEndTime}
        />
      </Modal>

      <Modal title="Відвідуваність" open={attendanceOpen} onCancel={() => setAttendanceOpen(false)} footer={null}>
        <List
          dataSource={attendance}
          rowKey={keyOf}
          renderItem={(a: any) => <List.Item>{a?.user?.fullName ?? a?.studentId ?? "—"}</List.Item>}
        />
      </Modal>

      <Modal title="Запити Face ID" open={checkModalOpen} onCancel={() => setCheckModalOpen(false)} footer={null} centered>
        {faceRequests.length ? (
          <List
            dataSource={faceRequests}
            rowKey={keyOf}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button key="ok" type="primary" onClick={() => handleApprove(item.id)}>Підтвердити</Button>,
                  <Button key="no" danger onClick={() => handleReject(item.id)}>Відхилити</Button>,
                ]}
              >
                <img
                  src={`${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`}
                  alt="Face"
                  style={{ width: 60, borderRadius: 6, marginRight: 14, cursor: "pointer" }}
                  onClick={() => handleImageClick(`${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`)}
                />
                <span>{item.name || item.studentId}</span>
              </List.Item>
            )}
          />
        ) : (
          <p style={{ textAlign: "center", margin: 0 }}>Немає запитів.</p>
        )}
      </Modal>

      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        width={600}
        centered
        styles={{ body: { textAlign: "center" } }}
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Face"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: 10,
              boxShadow: "0 6px 32px rgba(30,64,175,0.18)",
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default SessionDetails;
