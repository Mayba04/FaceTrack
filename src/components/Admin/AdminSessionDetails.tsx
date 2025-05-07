import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Spin,
  Table,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  GetSessionByIdAction,
} from "../../store/action-creators/sessionAction";
import {
  fetchAttendanceMatrixBySessionAction,
  addAbsenceAction,
  deleteAbsenceAction,
} from "../../store/action-creators/attendanceAction";

import {
  updateSessionAction,
  deleteSessionAction,
} from "../../store/action-creators/sessionAction";

import { useNavigate } from "react-router-dom";
import { Modal, Input, DatePicker, Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Title } = Typography;

const AdminSessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.SessionReducer.session);
  const { matrix, loading } = useSelector((state: RootState) => state.AttendanceReducer);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const groupName = groups.find((g) => g.id === Number(session?.groupId))?.name ?? "—";
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (sessionId) {
      dispatch(GetSessionByIdAction(Number(sessionId)) as any);
    }
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (session?.id) {
      dispatch(fetchAttendanceMatrixBySessionAction(Number(session.id)) as any);
    }
  }, [session?.id, dispatch]);

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
    await dispatch(GetSessionByIdAction(Number(session.id)) as any);
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (!session) return;
  
    Modal.confirm({
      title: "Видалити сесію?",
      onOk: async () => {
        await dispatch(deleteSessionAction(session.id) as any);
        navigate("/admin/groups");
      },
    });
  };
  

  const handleAttendanceToggle = async (studentId: string, sessionEntry: any) => {
    if (!session?.id) return;  
    const sessionHistoryId = sessionEntry.id;
    const timestamp = new Date(sessionEntry.startTime).toISOString();
  
    const record = matrix!.attendances.find(
      a => a.sessionHistoryId === sessionEntry.id && a.studentId === studentId
    );
  
    if (record?.id) {
        console.log(record?.id)
      await dispatch(deleteAbsenceAction(record.id) as any);
    } else {
        // console.log(studentId)
        // console.log(sessionHistoryId)
        // console.log(timestamp)
      await dispatch(addAbsenceAction(studentId, sessionHistoryId, timestamp) as any);
    }
  
    await dispatch(fetchAttendanceMatrixBySessionAction(Number(session!.id)) as any);
  };
  

  if (!session) return <Spin style={{ marginTop: 64 }} size="large" />;

  return (
    <div
    style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f4ff, #e2ecf9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 48,
        paddingBottom: 48,
    }}
    >
      <div
        style={{
          maxWidth: 900,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: "#1976d2", fontWeight: 700 }}>
            Сесія: {session.name}
          </Title>
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip title="Редагувати сесію">
              <Button shape="circle" icon={<EditOutlined />} onClick={handleEdit} />
            </Tooltip>
            <Tooltip title="Видалити сесію">
              <Button shape="circle" danger icon={<DeleteOutlined />} onClick={handleDelete} />
            </Tooltip>
          </div>
        </div>
  
        <p><b>Група:</b> {groupName}</p>
        <p>
          <b>Дата:</b>{" "}
          {dayjs(session.startTime).format("DD.MM.YYYY HH:mm")} –{" "}
          {dayjs(session.endTime).format("HH:mm")}
        </p>
        <p><b>Створив:</b> {session.createdBy}</p>
  
        <div style={{ marginTop: 32 }}>
          {loading ? (
            <Spin />
          ) : matrix?.students?.length ? (
            <Table
              columns={[
                {
                  title: "ПІБ студента",
                  dataIndex: "fullName",
                  key: "fullName",
                  fixed: "left",
                  render: (text: string) => (
                    <span style={{ fontWeight: 500 }}>{text}</span>
                  ),
                },
                ...matrix.sessions.map((s) => ({
                  title: dayjs(s.startTime).format("DD.MM"),
                  dataIndex: s.id.toString(),
                  key: s.id.toString(),
                  align: "center" as const,
                  render: (_: any, student: any) => {
                    const record = matrix.attendances.find(
                      (a) => a.sessionHistoryId === s.id && a.studentId === student.id
                    );
                    const value = record ? "✓" : "н";
  
                    return (
                      <button
                        onClick={() => handleAttendanceToggle(student.id, s)}
                        style={{
                          background: "none",
                          border: "none",
                          color: value === "✓" ? "#4caf50" : "#f44336",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        {value}
                      </button>
                    );
                  },
                })),
              ]}
              dataSource={matrix.students.map((s) => ({
                id: s.id,
                fullName: s.fullName,
              }))}
              rowKey="id"
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          ) : (
            <p>Немає даних про відвідуваність</p>
          )}
        </div>
  
        <Modal
          title="Редагування сесії"
          open={editOpen}
          onCancel={() => setEditOpen(false)}
          onOk={handleSave}
        >
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
      </div>
    </div>
  );
  
};

export default AdminSessionDetails;
