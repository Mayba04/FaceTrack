import React, { useEffect, useState } from "react";
import { Input, Select, Button, Table, Typography,  Space, Modal,  Form, message, Card, Pagination, Carousel} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { addNewUserAction, changeUserRoleAction, deleteUserAction, fetchFilteredUsersAction, toggleBlockUserAction, updateUserAction} from "../../store/action-creators/userActions";
import type { User } from "../../store/reducers/UserReducer/types";
import { hasGroups } from "../../services/api-group-service";
import { searchGroupsByNameAction } from "../../store/action-creators/groupActions";
import { fetchUserDetails } from "../../services/api-user-service";
import { APP_ENV } from "../../env";

const { Title } = Typography;
const { Option } = Select;


const ManageUsers: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { users, loading, totalCount, pageSize, currentPage, loggedInUser } = useSelector(
    (state: RootState) => state.UserReducer
  );
  const groupSearchResults = useSelector((state: RootState) => state.GroupReducer.searchResults ?? []);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [groupOptions, setGroupOptions] = useState<{ id: number; name: string }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


  useEffect(() => {
    handleSearch();
  }, [page]);

  useEffect(() => {
    setGroupOptions(groupSearchResults.map(g => ({ id: g.id, name: g.name })));
  }, [groupSearchResults]);  

  useEffect(() => {
    dispatch(searchGroupsByNameAction(""));
  }, []);
  

  useEffect(() => {
    if (groupSearchResults.length === 0) {
      dispatch(searchGroupsByNameAction(""));
    }
  }, [dispatch, groupSearchResults.length]);
  

  const handleGroupSearch = async (value: string) => {
    if (value.trim() === "") {
      await dispatch(searchGroupsByNameAction("")); 
      return;
    }
  
    if (value.length >= 1) {
      await dispatch(searchGroupsByNameAction(value));
    }
  };
  
  
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

const handleShowDetails = async (userId: string) => {
  try {
    const response = await fetchUserDetails(userId);
    const { success, message: msg, payload } = response as any;

    if (!success) {
      message.error(msg || "Не вдалося завантажити дані користувача");
      return;
    }

    setUserDetails(payload);
    setIsDetailsModalOpen(true);
  } catch  {
    message.error("Помилка при завантаженні користувача");
  }
};

  const handleEdit = (user: User) => {
    if (user.role === "Admin" && loggedInUser?.role !== "Admin") {
      return Modal.warning({
        title: "Редагування заборонено",
        content: "Модератор не може редагувати адміністратора.",
      });
    }

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

    if (user.role === "Admin" && loggedInUser?.role !== "Admin") {
      return Modal.warning({
        title: "Видалення заборонено",
        content: "Модератор не може видалити адміністратора.",
      });
    }    

    if (user.role === "Lecturer") {
      const hasLinkedGroups = await hasGroups(userId);
      if (hasLinkedGroups) {
        return Modal.warning({
          title: "Видалення неможливе",
          content: "Цей викладач має закріплені групи. Видаліть групи перед видаленням користувача.",
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
          content: "Ви не можете змінити свою роль або роль адміністратора.",
        });
      }

      const confirmChange = async () => {
        await dispatch(
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
        setSelectedUser(null); 
        await handleSearch();
        message.success("Користувача оновлено");
      };

      if (currentRole === "Lecturer" && ["Moderator", "Student"].includes(newRole)) {
        const hasLinkedGroups = await hasGroups(selectedUser.id);
        if (hasLinkedGroups) {
          return Modal.warning({
            title: "Неможливо змінити роль",
            content: "Цей викладач має закріплені групи. Видаліть їх, щоб змінити роль.",
          });
        }
        return Modal.confirm({
          title: "Підтвердження",
          content: `Ви впевнені, що хочете змінити роль викладача на ${newRole}?`,
          onOk: await confirmChange,
        });
      }

      if (currentRole === "Student" && ["Lecturer", "Moderator"].includes(newRole)) {
        return Modal.confirm({
          title: "Увага",
          content: "Усі студентські дані буде втрачено. Ви впевнені, що хочете змінити роль?",
          onOk: await confirmChange,
        });
      }

      if (currentRole === "Moderator" && ["Lecturer", "Student"].includes(newRole)) {
        return Modal.confirm({
          title: "Підтвердження",
          content: `Ви впевнені, що хочете змінити роль модератора на ${newRole}?`,
          onOk: await confirmChange,
        });
      }

      await confirmChange();
    });
  };

  const handleToggleBlock = (user: User) => {
    if (!user) return;

    let comment = "";
    let blockUntil = "";

    if (user.role === "Admin" && loggedInUser?.role !== "Admin") {
      return Modal.warning({
        title: "Блокування заборонено",
        content: "Модератор не може заблокувати адміністратора.",
      });
    }
    

    Modal.confirm({
      title: user.lockoutEnabled ? "Розблокувати користувача?" : "Заблокувати користувача",
      content: (
        <>
          {!user.lockoutEnabled && (
            <>
              <p>Введіть дату розблокування (необов’язково):</p>
              <Input
                type="datetime-local"
                onChange={(e) => (blockUntil = e.target.value)}
              />
              <p>Коментар адміністратора (необов’язково):</p>
              <Input
                placeholder="Коментар"
                onChange={(e) => (comment = e.target.value)}
              />
            </>
          )}
        </>
      ),
      onOk: async () => {
       
        await dispatch(toggleBlockUserAction(
          user.id,
          comment || undefined,
          blockUntil ? new Date(blockUntil).toISOString() : undefined
        ));
        handleSearch();
      },
    });
  };

  const columns = [
    {
      title: "ПІБ",
      dataIndex: "fullName",
      key: "fullName",
       render: (_: string, record: User) => (
        <span
          className="notranslate"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => handleShowDetails(record.id)}
        >
          {record.fullName}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
       render: (_: string, record: User) => (
        <span
          className="notranslate"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => handleShowDetails(record.id)}
        >
          {record.email}
        </span>
      ),
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <span className="notranslate">{role}</span>,
    },
    {
      title: "Статус",
      dataIndex: "lockoutEnabled",
      key: "lockoutEnabled",
      render: (_: any, record: User) => (
        <Space>
          {record.lockoutEnabled ? "Заблоковано" : "Активний"}
          {record.id !== loggedInUser?.id &&
            (
              (loggedInUser?.role === "Admin" && record.role !== "Admin") ||
              (loggedInUser?.role === "Moderator" && !["Admin", "Moderator"].includes(record.role))
            ) && (
              <Button
                type="link"
                danger={record.lockoutEnabled}
                onClick={() => handleToggleBlock(record)}
              >
                {record.lockoutEnabled ? "Розблокувати" : "Блокувати"}
              </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Дії",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
        {(loggedInUser?.role === "Admin" && record.role !== "Admin") ||
            (loggedInUser?.role === "Moderator" && !["Admin", "Moderator"].includes(record.role)) ? (
              <Button type="link" onClick={() => handleEdit(record)}>
                Редагувати
              </Button>
          ) : null
        }
          {record.id !== loggedInUser?.id &&
          (
            (loggedInUser?.role === "Admin" && record.role !== "Admin") ||
            (loggedInUser?.role === "Moderator" && !["Admin", "Moderator"].includes(record.role))
          ) && (
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              Видалити
            </Button>
        )}
        </Space>
      ),
    },
  ];

  return (
    <div
  style={{
    minHeight: "100vh",
    padding: "48px 16px",
    background: "linear-gradient(120deg,#e3f0ff 0%,#c6e6fb 100%)",
  }}
>
  <Card
    style={{
      maxWidth: 1100,
      margin: "0 auto",
      borderRadius: 24,
      padding: "32px 28px",
      boxShadow: "0 8px 24px rgba(30,64,175,0.12)",
    }}
  >
    <Title level={2} style={{ textAlign: "center", fontWeight: 800, marginBottom: 32 }}>
      👥 Керування користувачами
    </Title>

    {/* ─ Фільтри ─ */}
    <Space style={{ marginBottom: 24, display: "flex", flexWrap: "wrap" }}>
      <Input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ width: 200 }}
      />
      <Select
        allowClear
        placeholder="Role"
        value={role ?? undefined}
        style={{ width: 160 }}
        onChange={(value) => setRole(value)}
      >
        <Option className="notranslate" value="Admin">Admin</Option>
        <Option className="notranslate" value="Student">Student</Option>
        <Option className="notranslate" value="Lecturer">Lecturer</Option>
        <Option className="notranslate" value="Moderator">Moderator</Option>
      </Select>
      <Select
        showSearch
        placeholder="Search group"
        onSearch={handleGroupSearch}
        onChange={(value) => setGroupId(value)}
        style={{ width: 200 }}
        allowClear
        value={groupId ?? undefined}
        filterOption={false}
      >
        {groupOptions.map((group) => (
          <Option key={group.id} value={group.id}>
            <span className="notranslate">{group.name}</span>
          </Option>
        ))}
      </Select>
      <Button type="primary" onClick={handleSearch} loading={loading}>
        🔍 Пошук
      </Button>
      <Button type="dashed" onClick={() => setIsAddModalVisible(true)}>
        ➕ Додати користувача
      </Button>
    </Space>

    {/* ─ Таблиця ─ */}
    <div style={{ width: "100%", overflowX: "auto", marginBottom: 24 }}>
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record: User) => record.id}
        loading={loading}
        pagination={false}
        bordered
        scroll={{ x: 900 }} 
        style={{ minWidth: 800 }}
      />
    </div>

    {/* ─ Пагінація ─ */}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onChange={(page) => setPage(page)}
        showSizeChanger={false}
      />
    </div>
  </Card>
  
      {/* Модальне вікно редагування */}
      <Modal
        title="Редагування користувача"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdate}
        okText="Зберегти"
        cancelText="Скасувати"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="ПІБ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
  
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
  
          <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
            <Select>
              {selectedUser &&
                getAllowedRoles(selectedUser.role).map((r) => (
                  <Option key={r} value={r}>
                    <span className="notranslate">{r}</span>
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
  
      {/* Модальне вікно додавання */}
      <Modal
        title="Додати нового користувача"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => {
          addForm.validateFields().then(async (values) => {
            const { email, role } = values;
            const result = await dispatch(addNewUserAction(email, role));
            if (result.success) {
              message.success(result.message);
              setIsAddModalVisible(false);
              addForm.resetFields();
              handleSearch();
            } else {
              message.error(result.message);
            }
          });
        }}
        okText="Додати"
        cancelText="Скасувати"
        centered
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Введіть email" },
              { type: "email", message: "Невірний формат email" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>
  
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Оберіть роль" }]}
          >
            <Select placeholder="Оберіть роль">
              <Option  className="notranslate" value="Student">Student</Option>
              <Option  className="notranslate" value="Lecturer">Lecturer</Option>
              <Option  className="notranslate" value="Moderator">Moderator</Option>
              {loggedInUser?.role === "Admin" && <Option className="notranslate" value="Admin">Admin</Option>}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

     <Modal
        title="Деталі користувача"
        open={isDetailsModalOpen}
        onCancel={() => setIsDetailsModalOpen(false)}
        footer={null}
        centered
      >
        {userDetails ? (
          <div style={{ lineHeight: 1.8 }}>
            {/* Головне фото */}
            {userDetails.mainPhotoFileName ? (
            <img
              src={`${APP_ENV.BASE_URL}/images/600_${userDetails.mainPhotoFileName}`}
              alt="Головне фото"
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: 8,
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "#eee",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: 14,
              }}
            >
              Фото
            </div>
          )}

            {/* Основна текстова інформація */}
            <p><strong>ПІБ:</strong> <span className="notranslate">{userDetails.fullName}</span></p>
            <p><strong>Email:</strong> <span className="notranslate">{userDetails.email}</span></p>
            <p><strong>Роль:</strong> <span className="notranslate">{userDetails.role}</span></p>
            <p><strong>Статус:</strong> <span className="notranslate">{userDetails.lockoutEnabled ? "Blocked" : "Active"}</span></p>

            {/* Список всіх фото */}
           {userDetails.photos?.length > 0 && (
            <>
              <h4 style={{ marginTop: 24 }}>Фотографії:</h4>
                <Carousel arrows>
                {userDetails.photos.map((photo: any) => (
                  <div key={photo.id}>
                    <img
                      src={`${APP_ENV.BASE_URL}/images/600_${photo.fileName}`}
                      alt={photo.description || "Фото"}
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                    {photo.description && (
                      <p style={{ textAlign: "center", marginTop: 8 }}>{photo.description}</p>
                    )}
                  </div>
                ))}
              </Carousel>

            </>
          )}

          </div>
        ) : (
          <p>Завантаження...</p>
        )}
      </Modal>





    </div>
  );
  
};

export default ManageUsers;