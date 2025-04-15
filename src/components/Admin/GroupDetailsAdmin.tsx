import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import {
  fetchAttendanceMatrixAction,
  addAbsenceAction,
  deleteAbsenceAction,
} from "../../store/action-creators/attendanceAction";
import { Table, Typography, Spin } from "antd";
import moment from "moment";
import { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const groupId = Number(id);

  const { users: students, loading: studentsLoading } = useSelector((state: RootState) => state.UserReducer);
  const { matrix, loading: attendanceLoading } = useSelector((state: RootState) => state.AttendanceReducer);

  useEffect(() => {
    if (groupId) {
      dispatch(fetchStudentByGroupIdAction(groupId));
      dispatch(fetchAttendanceMatrixAction(groupId));
    }
  }, [groupId]);

  const getRecord = (studentId: string, virtualSessionId: number) =>
    matrix?.attendances.find(a => a.sessionId === virtualSessionId && a.studentId === studentId);

  const handleCellClick = async (studentId: string, virtualSessionId: number) => {
    const session = matrix?.sessions.find(s => s.id === virtualSessionId);
    if (!session) return;
  
    const originalSessionId = (session as any).originalSessionId;
    const timestamp = session.startTime;
    const record = getRecord(studentId, virtualSessionId);
    console.log(record?.id)
    if (record?.id) {
      // якщо вже є відмітка — видаляємо її незалежно від isPresent
      await dispatch(deleteAbsenceAction(record.id));
    } else {
      // немає запису — додаємо "н"
      await dispatch(addAbsenceAction(studentId, originalSessionId, timestamp));
    }
  
    dispatch(fetchAttendanceMatrixAction(groupId));
  };


  const attendanceColumns: ColumnsType<{ id: string; fullName: string }> = [
    {
      title: "ПІБ",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
    },
    ...(matrix?.sessions.map(session => ({
      title: moment(session.startTime).format("DD.MM.YYYY"),
      dataIndex: session.id.toString(),
      key: session.id.toString(),
      align: "center" as const,
      render: (_: any, student: any) => {
        const recordData = getRecord(student.id, session.id);
        let value = "";
      
        if (recordData) {
          value = recordData.isPresent ? "✓" : "н";
        } else {
          value = "н"; 
        }
      
        return (
          <button
            onClick={() => handleCellClick(student.id, session.id)} 
            style={{
              background: "none",
              border: "none",
              color:
                value === "н" ? "red" :
                value === "✓" ? "green" :
                "#888",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            {value}
          </button>
        );
      },      
    })) || []),
  ];

  const attendanceData = matrix?.students.map(student => ({
    id: student.id,
    fullName: student.fullName,
  })) || [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Деталі групи</Title>

      <Title level={4}>Список студентів</Title>
      {studentsLoading ? (
        <Spin />
      ) : students.length ? (
        <Table columns={[{ title: "ПІБ", dataIndex: "fullName" }]} dataSource={students} rowKey="id" pagination={false} />
      ) : (
        <p>У цій групі немає студентів</p>
      )}

      <Title level={4} style={{ marginTop: 32 }}>Відвідуваність</Title>
      {attendanceLoading ? (
        <Spin />
      ) : matrix?.students.length ? (
        <Table
          columns={attendanceColumns}
          dataSource={attendanceData}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      ) : (
        <p>Немає даних про відвідування</p>
      )}
    </div>
  );
};

export default GroupDetails;
