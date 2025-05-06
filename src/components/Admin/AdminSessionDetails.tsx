import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Spin,
  Table,
} from "antd";
import dayjs from "dayjs";
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

const { Title } = Typography;

const AdminSessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.SessionReducer.session);
  const { matrix, loading } = useSelector((state: RootState) => state.AttendanceReducer);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const groupName = groups.find((g) => g.id === Number(session?.groupId))?.name ?? "—";

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
    <div style={{ padding: 32 }}>
      <Title level={3}>Сесія: {session.name}</Title>
      <p><b>Група:</b> {groupName}</p>
      <p>
        <b>Дата:</b>{" "}
        {dayjs(session.startTime).format("DD.MM.YYYY HH:mm")} –{" "}
        {dayjs(session.endTime).format("HH:mm")}
      </p>
      <p><b>Створив:</b> {session.createdBy}</p>

      {loading ? (
        <Spin />
      ) : matrix?.students?.length ? (
        <Table
          columns={[
            {
              title: "ПІБ",
              dataIndex: "fullName",
              key: "fullName",
              fixed: "left",
            },
            ...matrix.sessions.map((s) => ({
              title: dayjs(s.startTime).format("DD.MM.YYYY"),
              dataIndex: s.id.toString(),
              key: s.id.toString(),
              align: "center" as const,
              render: (_: any, student: any) => {
                const record = matrix.attendances.find(
                  a => a.sessionHistoryId === s.id && a.studentId === student.id
                );
              
                const value = record ? "✓" : "н";
              
                return (
                  <button
                    onClick={() => handleAttendanceToggle(student.id, s)}
                    style={{
                      background: "none",
                      border: "none",
                      color: value === "✓" ? "green" : "red",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    {value}
                  </button>
                );
              }              
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
  );
};

export default AdminSessionDetails;
