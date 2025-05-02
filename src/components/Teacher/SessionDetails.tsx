import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Modal,
  Spin,
  List,
  message,
  DatePicker,
  Input,
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
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { APP_ENV } from "../../env"; // ← база URL для зображень

const { Title } = Typography;

const toArray = <T,>(x: unknown): T[] => (Array.isArray(x) ? x : []);
const keyOf = (item: any): React.Key =>
  item?.id ?? item?.studentId ?? item?.requestId ?? JSON.stringify(item);

const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const session = useSelector(
    (state: RootState) => state.SessionReducer.session
  );
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const groupName =
    groups.find((g) => g.id === Number(session?.groupId))?.name ?? "—";

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
    if (sessionId) {
      dispatch(GetSessionByIdAction(Number(sessionId)) as any);
    }
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
        name: name,             
      };
    
      await dispatch(updateSessionAction(payload) as any);
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
    setAttendance(toArray(res && (res as any).payload));
    setAttendanceOpen(true);
  };

  const openFaceReq = async () => {
    setCheckModalOpen(true);
    const res = await dispatch(
      fetchPendingFaceRequestsAction(Number(sessionId)) as any
    );
    setFaceRequests(toArray(res && res.payload));
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
    <div style={{ padding: 24, maxWidth: 800, margin: "auto" }}>
      
      <Card>
        <Title level={3}>Сесія: {session.name}</Title>
        <p>
          <b>Група:</b> {groupName}
        </p>
        <p>
          <b>Час:</b>{" "}
          {dayjs(session.startTime).format("DD.MM.YYYY HH:mm")} –{" "}
          {dayjs(session.endTime).format("HH:mm")}
        </p>
        <p>
          <b>Створив:</b> {session.createdBy}
        </p>

        <Button type="primary" onClick={handleStart}>
          Запустити
        </Button>{" "}
        <Button icon={<EditOutlined />} onClick={handleEdit}>
          Редагувати
        </Button>{" "}
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Видалити
        </Button>{" "}
        <Button onClick={openAttendance}>Відвідуваність</Button>{" "}
        <Button onClick={openFaceReq}>Перевірити Face ID</Button>
      </Card>

      <Modal
        title="Редагування сесії"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
      >
        <p>Введіть назву сесії:</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введіть назву сесії"
            style={{ width: "100%", marginBottom: 10 }}
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

      <Modal
        title="Відвідуваність"
        open={attendanceOpen}
        onCancel={() => setAttendanceOpen(false)}
        footer={null}
      >
        <List
          dataSource={attendance}
          rowKey={keyOf}
          renderItem={(a: any) => (
            <List.Item>{a?.user?.fullName ?? a?.studentId ?? "—"}</List.Item>
          )}
        />
      </Modal>

      <Modal
        title="Запити Face ID"
        open={checkModalOpen}
        onCancel={() => setCheckModalOpen(false)}
        footer={null}
        centered
      >
        {faceRequests.length ? (
          <List
            dataSource={faceRequests}
            rowKey={keyOf}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button
                    key="ok"
                    type="primary"
                    onClick={() => handleApprove(item.id)}
                  >
                    Підтвердити
                  </Button>,
                  <Button
                    key="no"
                    danger
                    onClick={() => handleReject(item.id)}
                  >
                    Відхилити
                  </Button>,
                ]}
              >
                <img
                  src={`${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`}
                  alt="Face"
                  style={{
                    width: 60,
                    borderRadius: 6,
                    marginRight: 14,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleImageClick(
                      `${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`,
                    )
                  }
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
