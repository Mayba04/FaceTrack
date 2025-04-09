import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import { Table, Typography, Spin } from "antd";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const { users: students, loading } = useSelector((state: RootState) => state.UserReducer);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentByGroupIdAction(Number(id)));
    }
  }, [id]);

  const columns = [
    { title: "ПІБ", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Деталі групи</Title>
      <Title level={4}>Список студентів</Title>

      {loading ? (
        <Spin />
      ) : students.length ? (
        <Table columns={columns} dataSource={students} rowKey="id" pagination={false} />
      ) : (
        <p>У цій групі немає студентів</p>
      )}
    </div>
  );
};

export default GroupDetails;
