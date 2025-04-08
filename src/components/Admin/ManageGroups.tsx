import React, { useEffect, useState } from "react";
import { Input, Button, Table, Typography, Space, Modal, Form, message, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchFilteredGroupsAction, createGroupAction, deleteGroupAction, updateGroupAction, changeGroupTeacherAction, } from "../../store/action-creators/groupActions";
import { GroupActionTypes, type Group } from "../../store/reducers/GroupReducer/types";
import { User } from "../../store/reducers/UserReducer/types";
import { fetchFilteredUsersAction } from "../../store/action-creators/userActions";

const { Title } = Typography;


const ManageGroups: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { groups, totalCount, pageSize, currentPage, loading: groupLoading } =
    useSelector((state: RootState) => state.GroupReducer);

  const { users, loading: userLoading } = useSelector(
    (state: RootState) => state.UserReducer
  );

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

  const searchTeachers = async (name: string) => {
    try {
      const result: any = await dispatch(
        fetchFilteredUsersAction({
          fullName: name,
          role: "Lecturer",
          pageNumber: 1,
          pageSize: 10,
        })
      );
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

    const teacherInStore = users.find((u) => u.id === group.teacherId);
    if (
      teacherInStore &&
      !teacherOptions.some((t) => t.id === teacherInStore.id)
    ) {
      setTeacherOptions((prev) => [...prev, teacherInStore]);
    }

    setTimeout(() => setIsEditVisible(true), 0);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      const { name: newName, teacherId: newTeacherId } = values;
      const currentTeacherId = selectedGroup?.teacherId;

      if (newName !== selectedGroup?.name) {
        await dispatch(
          updateGroupAction(selectedGroup!.id, newName, currentTeacherId!)
        );
      }

      if (newTeacherId !== currentTeacherId) {
        await dispatch(
          changeGroupTeacherAction(
            selectedGroup!.id,
            currentTeacherId!,
            newTeacherId
          )
        );
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
    { title: "Group", dataIndex: "name", key: "name" },
    { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
    { title: "Students", dataIndex: "studentsCount", key: "studentsCount" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Group) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Manage Groups</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Input
          placeholder="Teacher Name"
          value={groupTeacher}
          onChange={(e) => setGroupTeacher(e.target.value)}
        />
        <Button type="primary" onClick={handleSearch} loading={groupLoading}>
          Search
        </Button>
        <Button type="dashed" onClick={() => setIsAddVisible(true)}>
          Create Group
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

      <Modal
        title="Create Group"
        open={isAddVisible}
        onCancel={() => setIsAddVisible(false)}
        onOk={handleCreate}
        okText="Create"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacherId" label="Teacher Id" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Group"
        open={isEditVisible}
        onCancel={handleCancelEdit}
        onOk={handleUpdate}
        okText="Save"
      >
        <Form form={editForm} layout="vertical" onKeyDown={(e) => e.stopPropagation()}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacherId" label="Teacher" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Search by name"
              filterOption={false}
              onSearch={searchTeachers}
              loading={userLoading}
              notFoundContent={userLoading ? "Loading..." : "No results"}
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