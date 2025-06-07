import React, { useEffect, useState } from "react";
import { Typography, Spin, Modal, Button, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchSessionsByStudentIdAction } from "../../store/action-creators/sessionAction";
import {
  getStudentSessionStats,
  getAbsencesByStudentAndSessionId,
} from "../../services/api-attendance-service";
import moment from "moment";
import {
  CheckSquareFilled,
  BookOutlined,
  CloseCircleOutlined,
  FundOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { fetchGroupsByIdsAction } from "../../store/action-creators/groupActions";

const { Title } = Typography;

const StudentAttendanceHistory: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const { sessions, loading } = useSelector((state: RootState) => state.SessionReducer);
  const { groups } = useSelector((state: RootState) => state.GroupReducer);
  const [stats, setStats] = useState<Record<number, { missed: number; percent: number }>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [absences, setAbsences] = useState<any[]>([]);

  useEffect(() => {
  if (!sessions.length) return;

  const groupIdsInSessions = sessions.map((s) => Number(s.groupId));
  const groupIdsInStore = groups.map((g) => g.id);
  const missingGroupIds = groupIdsInSessions.filter(id => !groupIdsInStore.includes(id));

  if (missingGroupIds.length > 0) {
    dispatch(fetchGroupsByIdsAction(missingGroupIds) as any);
  }
}, [sessions, groups]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSessionsByStudentIdAction(user.id) as any);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && sessions?.length) {
      sessions.forEach(async (session: any) => {
        const response = await getStudentSessionStats(user.id!, session.id);
        const { success, payload } = response as any;
        if (success) {
          setStats((prev) => ({
            ...prev,
            [session.id]: {
              missed: payload.missed,
              percent: payload.percent,
            },
          }));
        }
      });
    }
  }, [user, sessions]);

  const handleOpenAbsencesModal = async (sessionId: number) => {
    const response = await getAbsencesByStudentAndSessionId(user!.id, sessionId);
    const { success, payload } = response as any;
    if (success) {
      setAbsences(payload);
      setModalVisible(true);
    }
  };

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
          maxWidth: 820,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <CheckSquareFilled style={{ fontSize: 32, color: "#52c41a", marginRight: 16 }} />
          <Title level={2} style={{ margin: 0, color: "#002766", fontWeight: 800 }}>
            Історія відвідувань
          </Title>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : sessions.length ? (
          sessions.map((session: any) => {
            const stat = stats[session.id];
            const group = groups.find((g) => g.id === session.groupId);

            return (
                <div
                key={session.id}
                style={{
                    background: "#f6fafd",
                    borderRadius: 16,
                    marginBottom: 24,
                    padding: "20px 18px",
                    border: "2px solid #d8e5f2",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
                >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "50% 50%",
                        rowGap: 10,
                        columnGap: 24,
                        fontSize: 16,
                    }}
                >
                    {/* Рядок 1 */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                    <BookOutlined style={{ marginRight: 6, color: "#1976d2" }} />
                    Сесія:{" "}
                    <span style={{ color: "#3b2fc0", fontWeight: 700, marginLeft: 4 }} className="notranslate">
                        {session.name}
                    </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                    <UserOutlined style={{ marginRight: 6, color: "#1976d2" }} />
                    Група:{" "}
                    <span style={{ color: "#3b2fc0", fontWeight: 700, marginLeft: 4 }} className="notranslate">
                        {group?.name || "—"}
                    </span>
                    </div>

                    {/* Рядок 2 */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                    <CloseCircleOutlined style={{ marginRight: 6, color: "#ff4d4f" }} />
                    Пропущено:{" "}
                    <span style={{ fontWeight: 600, marginLeft: 4 }}>
                        {stat?.missed ?? "—"}
                    </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                    <FundOutlined style={{ marginRight: 6, color: "#52c41a" }} />
                    Відвідуваність:{" "}
                    <span style={{ fontWeight: 600, marginLeft: 4 }}>
                        {stat?.percent ?? "—"}%
                    </span>
                    </div>
                </div>

                <Button
                    type="default"
                    onClick={() => handleOpenAbsencesModal(session.id)}
                    style={{
                    width: "fit-content",
                    marginTop: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    color: "#1976d2",
                    borderColor: "#1976d2",
                    }}
                >
                    Переглянути н-ки
                </Button>
                </div>
            );
          })
        ) : (
          <Alert message="Немає даних про сесії." type="info" showIcon />
        )}

        <Modal
          title="Деталі відвідувань"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          {absences.length > 0 ? (
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {absences.map((a: any, index: number) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {moment(a.date).format("DD.MM.YYYY")} —{" "}
                  <span
                    style={{
                      color: a.isPresent ? "green" : "red",
                      fontWeight: 600,
                    }}
                  >
                    {a.isPresent ? "✓" : "н"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Відміток про присутність немає.</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentAttendanceHistory;
