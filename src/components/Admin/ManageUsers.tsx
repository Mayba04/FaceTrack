import React, { useEffect, useState } from "react";
import {
  Input,
  Select,
  Button,
  Table,
  Typography,
  Space,
  Modal,
  Form,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  fetchFilteredUsersAction,
  updateUserAction,
} from "../../store/action-creators/userActions";
import type { User } from "../../store/reducers/UserReducer/types";

const { Title } = Typography;
const { Option } = Select;

const ManageUsers: React.FC = () => {
  const dispatch = useDispatch<any>();

  const {
    users,
    loading,
    totalCount,
    pageSize,
    currentPage,
    loggedInUser,
  } = useSelector((state: RootState) => state.UserReducer);

  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    dispatch(
      fetchFilteredUsersAction({
        fullName: fullName || null,
        role,
        groupId,
        pageNumber: page,
        pageSize: 10,
      })
    );
  };

  // Клік "Edit"
  const handleEdit = (user: User) => {
    if (user.id === loggedInUser?.id) {
      Modal.warning({
        title: "Редагування недоступне",
        content: "Ви не можете редагувати свій власний акаунт.",
      });
      return;
    }

    setSelectedUser(user);

    const allowedRoles = ["Admin", "Student", "Lecturer", "Moderator"];
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: allowedRoles.includes(user.role) ? user.role : undefined,
    });

    setIsModalVisible(true);
  };

  const handleUpdate = () => {
    form
      .validateFields()
      .then((formValues) => {
        if (!selectedUser) return;
  
        
        const updatedUser = {
          id: selectedUser.id,
          fullName: formValues.fullName,
          email: selectedUser.email 
        };
  
        dispatch(updateUserAction(updatedUser));
        setIsModalVisible(false);
        handleSearch();
        message.success("Користувача оновлено");
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };
  

  // Налаштування стовпців таблиці
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      ),
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
          <Option value="Moderator">Moderator</Option>
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

      <Modal
        title="Edit User"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdate}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="Student">Student</Option>
              <Option value="Lecturer">Lecturer</Option>
              <Option value="Moderator">Moderator</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
