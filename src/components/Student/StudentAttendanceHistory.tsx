import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchSessionsByStudentIdAction } from "../../store/action-creators/sessionAction";
import { getStudentSessionStats, getAbsencesByStudentAndSessionId } from "../../services/api-attendance-service";
import moment from "moment";

const { Title } = Typography;

const StudentAttendanceHistory: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const { sessions, loading } = useSelector((state: RootState) => state.SessionReducer);
  const [stats, setStats] = useState<Record<number, { missed: number; percent: number }>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [absences, setAbsences] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSessionsByStudentIdAction(user.id) as any);
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user?.id && sessions?.length) {
      sessions.forEach(async (session: any) => {
        const response = await getStudentSessionStats(user.id!, session.id);
        const { success, payload } = response as any;
        if (success) {
          setStats(prev => ({
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

  const columns = [
    {
      title: "Назва",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Пропущено",
      key: "missed",
      render: (_: any, session: any) => {
        const missed = stats[session.id]?.missed ?? "—";
        return `${missed} н-ок`;
      },
    },
    {
      title: "% Відвідування",
      key: "percent",
      render: (_: any, session: any) => {
        const percent = stats[session.id]?.percent ?? "—";
        return `${percent}%`;
      },
    },
    {
      title: "Дії",
      key: "action",
      render: (_: any, session: any) => (
        <button
          style={{
            border: "none",
            background: "#1976d2",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
          onClick={() => handleOpenAbsencesModal(session.id)}
        >
          Переглянути н-ки
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>✅ Історія відвідувань</Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={sessions || []}
            rowKey="id"
            pagination={false}
          />
        </>
      )}

      <Modal
        title="Деталі відвідувань"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {absences.length > 0 ? (
          <Table
            dataSource={absences.map((a: any, index: number) => ({
            key: index,
            date: moment(a.date).format("DD.MM.YYYY"),
            status: a.isPresent ? "✓" : "н"
          }))}
            columns={[
              {
                title: "Дата",
                dataIndex: "date",
                key: "date",
              },
              {
                title: "Статус",
                dataIndex: "status",
                key: "status",
                render: (_: any, row: any) => (
                    <span
                      style={{
                        color: row.status === "✓" ? "green" : "red",
                        fontWeight: 600
                      }}
                    >
                      {row.status}
                    </span>
                  )
              }
            ]}
            pagination={false}
          />
        ) : (
          <p>Відміток про присутність немає.</p>
        )}
      </Modal>
    </div>
  );
};

export default StudentAttendanceHistory;
