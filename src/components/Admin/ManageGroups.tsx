import React, { useEffect, useState } from "react";
import { Input, Button, Table, Typography, Space, Modal, Form, message, Select, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  fetchFilteredGroupsAction,
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
  changeGroupTeacherAction
} from "../../store/action-creators/groupActions";
import { GroupActionTypes, type Group } from "../../store/reducers/GroupReducer/types";
import { User } from "../../store/reducers/UserReducer/types";
import { fetchLecturersAction } from "../../store/action-creators/userActions";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ManageGroups: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { groups, totalCount, pageSize, currentPage, loading: groupLoading } = useSelector((state: RootState) => state.GroupReducer);
  const { users, loading: userLoading } = useSelector((state: RootState) => state.UserReducer);

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [teacherOptions, setTeacherOptions] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupTeacher, setGroupTeacher] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    handleSearch();
  }, [page]);

  useEffect(() => {
    if (isAddVisible) {
      searchTeachers("");
    }
  }, [isAddVisible]);

  useEffect(() => {
    if (isEditVisible && selectedGroup?.teacherId) {
      (async () => {
        const result: any = await dispatch(fetchLecturersAction(""));
        const fetchedLecturers: User[] = result?.success ? result.payload : [];

        const teacherInStore = users.find((u) => u.id === selectedGroup.teacherId);
        const mergedOptions = [...fetchedLecturers];
        if (teacherInStore && !fetchedLecturers.some((t) => t.id === teacherInStore.id)) {
          mergedOptions.push(teacherInStore);
        }

        setTeacherOptions(mergedOptions);
      })();
    }
  }, [isEditVisible, selectedGroup]);

  const searchTeachers = async (name: string) => {
    try {
      const result: any = await dispatch(fetchLecturersAction(name));
      setTeacherOptions(result?.success ? result.payload : []);
    } catch (err) {
      console.error("Search error:", err);
      setTeacherOptions([]);
    }
  };

  const handleSearch = () => {
    dispatch(
      fetchFilteredGroupsAction({
        name: groupName || null,
        teacherName: groupTeacher || null,
        pageNumber: page,
        pageSize: 10,
      })
    );
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    editForm.setFieldsValue({
      name: group.name,
      teacherId: group.teacherId,
    });
    setIsEditVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      const { name: newName, teacherId: newTeacherId } = values;
      const currentTeacherId = selectedGroup?.teacherId;

      if (newName !== selectedGroup?.name) {
        await dispatch(updateGroupAction(selectedGroup!.id, newName, currentTeacherId!));
      }

      if (newTeacherId !== currentTeacherId) {
        await dispatch(changeGroupTeacherAction(selectedGroup!.id, currentTeacherId!, newTeacherId));
      }

      message.success("Групу оновлено");
      setIsEditVisible(false);
      handleSearch();
    } catch {
      message.error("Не вдалося оновити групу");
    }
  };

  const handleCreate = () => {
    addForm.validateFields().then(async (values) => {
      const { name, teacherId } = values;
      const res = await dispatch(createGroupAction(name, teacherId));
      if (res?.success !== false) {
        message.success("Group created");
        setIsAddVisible(false);
        addForm.resetFields();
        handleSearch();
      }
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete group?",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: async () => {
        await dispatch(deleteGroupAction(id));
        handleSearch();
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditVisible(false);
    dispatch({ type: GroupActionTypes.END_REQUEST });
  };

  const columns = [
    {
      title: "Group",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: Group) => (
        <a onClick={() => navigate(`/admin/groups/${record.id}`)}>{record.name}</a>
      ),
    },
    { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
    { title: "Students", dataIndex: "studentsCount", key: "studentsCount" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Group) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
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
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 8px 24px rgba(30,64,175,0.12)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", fontWeight: 800, marginBottom: 32 }}>
          Керування групами
        </Title>

        <Space style={{ marginBottom: 24 }} wrap>
          <Input placeholder="Назва групи" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <Input placeholder="ПІБ викладача" value={groupTeacher} onChange={(e) => setGroupTeacher(e.target.value)} />
          <Button type="primary" onClick={handleSearch} loading={groupLoading}>
            Пошук
          </Button>
          <Button type="dashed" onClick={() => setIsAddVisible(true)}>
            Створити групу
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={groups}
          rowKey={(g: Group) => g.id}
          loading={groupLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      <Modal title="Створити групу" open={isAddVisible} onCancel={() => setIsAddVisible(false)} onOk={handleCreate} okText="Створити">
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Назва групи" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacherId" label="Викладач" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Пошук за ПІБ"
              filterOption={false}
              onSearch={searchTeachers}
              loading={userLoading}
              notFoundContent={userLoading ? "Завантаження..." : "Немає результатів"}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {teacherOptions.map((t) => (
                <Select.Option key={t.id} value={t.id} label={t.fullName}>
                  {t.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Редагувати групу" open={isEditVisible} onCancel={handleCancelEdit} onOk={handleUpdate} okText="Зберегти">
        <Form form={editForm} layout="vertical" onKeyDown={(e) => e.stopPropagation()}>
          <Form.Item name="name" label="Назва групи" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacherId" label="Викладач" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Пошук за ПІБ"
              filterOption={false}
              onSearch={searchTeachers}
              loading={userLoading}
              notFoundContent={userLoading ? "Завантаження..." : "Немає результатів"}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {teacherOptions.map((t) => (
                <Select.Option key={t.id} value={t.id} label={t.fullName}>
                  {t.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageGroups;