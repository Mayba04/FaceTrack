import React, { useEffect, useState } from "react";
import { Input, Select, Button, Table, Typography, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchFilteredUsersAction } from "../../store/action-creators/userActions";
import type { User } from "../../store/reducers/UserReducer/types";

const { Title } = Typography;
const { Option } = Select;

const ManageUsers: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { users, loading, totalCount, pageSize, currentPage } = useSelector((state: RootState) => state.UserReducer);

  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);

  const handleSearch = () => {
    dispatch(fetchFilteredUsersAction({
      fullName: fullName || null,
      role,
      groupId,
      pageNumber: page,
      pageSize: 10
    }));
  };

  useEffect(() => {
    handleSearch(); // Load users initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => role || "—",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Manage Users</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Role"
          value={role ?? undefined}
          style={{ width: 150 }}
          onChange={(value) => setRole(value)}
        >
          <Option value="Admin">Admin</Option>
          <Option value="Student">Student</Option>
          <Option value="Lecturer">Lecturer</Option>
        </Select>
        <Input
          type="number"
          placeholder="Group ID"
          value={groupId ?? ""}
          onChange={(e) => setGroupId(Number(e.target.value) || null)}
          style={{ width: 120 }}
        />
        <Button type="primary" onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record: User) => record.id}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          onChange: (page) => setPage(page),
        }}
      />
    </div>
  );
};

export default ManageUsers;
