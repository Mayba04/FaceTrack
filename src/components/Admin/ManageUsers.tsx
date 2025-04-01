import React, { useEffect, useState } from "react";
import { Input, Select, Button, Table, Typography,  Space, Modal,  Form, message} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { changeUserRoleAction, deleteUserAction, fetchFilteredUsersAction, updateUserAction} from "../../store/action-creators/userActions";
import type { User } from "../../store/reducers/UserReducer/types";
import { hasGroups } from "../../services/api-group-service";

const { Title } = Typography;
const { Option } = Select;

const ManageUsers: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { users, loading, totalCount, pageSize, currentPage, loggedInUser} = useSelector((state: RootState) => state.UserReducer);
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    handleSearch();
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

  const getAllowedRoles = (currentRole: string): string[] => {
    switch (currentRole) {
      case "Lecturer":
        return ["Lecturer", "Student", "Moderator"];
      case "Student":
        return ["Student", "Lecturer", "Moderator"];
      case "Moderator":
        return ["Moderator", "Lecturer", "Student"];
      default:
        return ["Admin", "Student", "Lecturer", "Moderator"];
    }
  };

  const handleEdit = (user: User) => {
    if (user.id === loggedInUser?.id) {
      Modal.warning({
        title: "Редагування недоступне",
        content: "Ви не можете редагувати свій власний акаунт.",
      });
      return;
    }

    setSelectedUser(user);

    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: getAllowedRoles(user.role).includes(user.role) ? user.role : undefined,
    });

    setIsModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.role === "Lecturer") {
      const hasLinkedGroups = await hasGroups(userId);
      console.log(hasLinkedGroups)
      if (hasLinkedGroups) {
        return Modal.warning({
          title: "Видалення неможливе",
          content:
            "Цей викладач має закріплені групи. Видаліть групи перед видаленням користувача.",
        });
      }
    }

    Modal.confirm({
      title: "Підтвердження",
      content: "Ви впевнені, що хочете видалити цього користувача?",
      okText: "Так",
      cancelText: "Скасувати",
      onOk: async () => {
        await dispatch(deleteUserAction(userId));
        handleSearch();
      },
    });
  };

  const handleUpdate = () => {
    form.validateFields().then(async (formValues) => {
      if (!selectedUser) return;

      const { fullName, role: newRole } = formValues;
      const currentRole = selectedUser.role;

      if (selectedUser.id === loggedInUser?.id || currentRole === "Admin") {
        return Modal.warning({
          title: "Заборонено",
          content:
            "Ви не можете змінити свою роль або роль адміністратора.",
        });
      }

      const confirmChange = async () => {
        dispatch(
          updateUserAction({
            id: selectedUser.id,
            fullName,
            email: selectedUser.email,
          })
        );
        if (newRole !== currentRole) {
          await dispatch(changeUserRoleAction(selectedUser.id, newRole));
        }
        setIsModalVisible(false);
        handleSearch();
        message.success("Користувача оновлено");
      };

      if (currentRole === "Lecturer" && ["Moderator", "Student"].includes(newRole)) {
        const hasLinkedGroups = await hasGroups(selectedUser.id);
        if (hasLinkedGroups) {
          return Modal.warning({
            title: "Неможливо змінити роль",
            content:
              "Цей викладач має закріплені групи. Видаліть їх, щоб змінити роль.",
          });
        }
        return Modal.confirm({
          title: "Підтвердження",
          content: `Ви впевнені, що хочете змінити роль викладача на ${newRole}?`,
          onOk: confirmChange,
        });
      }

      if (currentRole === "Student" && ["Lecturer", "Moderator"].includes(newRole)) {
        return Modal.confirm({
          title: "Увага",
          content:
            "Усі студентські дані буде втрачено. Ви впевнені, що хочете змінити роль?",
          onOk: confirmChange,
        });
      }

      if (currentRole === "Moderator" && ["Lecturer", "Student"].includes(newRole)) {
        return Modal.confirm({
          title: "Підтвердження",
          content: `Ви впевнені, що хочете змінити роль модератора на ${newRole}?`,
          onOk: confirmChange,
        });
      }

      await confirmChange();
    });
  };

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
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          {record.id !== loggedInUser?.id && (
            <Button
              type="link"
              danger
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          )}
        </Space>
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
              {selectedUser &&
                getAllowedRoles(selectedUser.role).map((r) => (
                  <Option key={r} value={r}>
                    {r}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsers;