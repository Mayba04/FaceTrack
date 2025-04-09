import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import { fetchAttendanceMatrixAction } from "../../store/action-creators/attendanceAction";
import { Table, Typography, Spin } from "antd";
import moment from "moment";
import { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();

  const { users: students, loading: studentsLoading } = useSelector((state: RootState) => state.UserReducer);
  const { matrix, loading: attendanceLoading } = useSelector((state: RootState) => state.AttendanceReducer);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentByGroupIdAction(Number(id)));
      dispatch(fetchAttendanceMatrixAction(Number(id)));
    }
  }, [id]);

  const studentColumns = [
    { title: "ПІБ", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  const getAttendanceValue = (studentId: string, sessionId: number) => {
    const record = matrix?.attendances.find(a => a.sessionId === sessionId && a.studentId === studentId);
    return record ? (record.isPresent ? "✓" : "н") : "";
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
      render: (_: any, record: any) => getAttendanceValue(record.id, session.id),
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
        <Table columns={studentColumns} dataSource={students} rowKey="id" pagination={false} />
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
