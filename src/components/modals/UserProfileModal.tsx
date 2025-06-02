import { Modal, Button, Input, message, Form } from "antd";
import { useEffect, useState } from "react";
import { changeUserPassword, fetchUserDetail, setMainPhoto } from "../../services/api-user-service";
import { APP_ENV } from "../../env";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { LockOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<Props> = ({ open, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.UserReducer.loggedInUser?.id);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadUser = async () => {
      if (open && userId) {
        try {
          const response = await fetchUserDetail(userId);
          const { success, message: msg, payload } = response as any;

          if (!success) {
            message.error(msg || "Не вдалося завантажити дані користувача");
            return;
          }

          setUser(payload);
        } catch (error) {
          console.error("Помилка при завантаженні користувача", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(true);
        form.resetFields();
      }
    };

    loadUser();
  }, [open, userId]);

  const handlePasswordChange = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Паролі не співпадають");
      return;
    }

    const data = {
      userId,
      currentPassword,
      newPassword,
      confirmNewPassword: confirmPassword,
    };

    const response = await changeUserPassword(data);
    const { success, message: msg } = response as any;

    if (success) {
      message.success(msg);
      form.resetFields();
    } else {
      message.error(msg || "Не вдалося змінити пароль");
    }
  };

  const handleChangePhoto = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !userId) return;

      const response = await setMainPhoto(userId, file);
      const { success, message: msg, payload } = response as any;
      if (success) {
        message.success(msg);
        setUser(payload);
      } else {
        message.error(msg || "Не вдалося оновити фото");
      }
    };

    input.click();
  };

  return (
    <Modal
      title="Ваш профіль"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
        padding: "24px 32px",
      }}
    >
      {loading ? (
        <p>Завантаження...</p>
      ) : user ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Фото */}
          {user.mainPhotoFileName ? (
            <img
              src={`${APP_ENV.BASE_URL}/images/600_${user.mainPhotoFileName}`}
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
          <Button size="small" onClick={handleChangePhoto} style={{ marginBottom: 12 }}>
            {user.mainPhotoFileName ? "Змінити фото" : "Додати фото"}
          </Button>

          <h2 style={{ marginBottom: 16, fontSize: 20 }}>{user.fullName}</h2>

          {/* Інформація */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 32px",
              width: "100%",
              maxWidth: 600,
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            <div>
              <strong>Email:</strong>
              <p style={{ margin: 0 }}>{user.email}</p>
            </div>
            <div>
              <strong>Роль:</strong>
              <p style={{ margin: 0 }}>{user.role}</p>
            </div>
            <div>
              <strong>Статус:</strong>
              <p style={{ margin: 0 }}>{user.lockoutEnabled ? "Blocked" : "Active"}</p>
            </div>
          </div>

          {/* Зміна пароля */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                padding: 20,
                borderRadius: 12,
                background: "#fff",
              }}
            >
              <h3
                style={{
                  marginBottom: 20,
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#222",
                }}
              >
                Змінити пароль
              </h3>

              <Form layout="vertical" onFinish={handlePasswordChange} form={form}>
                <Form.Item
                  name="currentPassword"
                  label="Поточний пароль"
                  rules={[{ required: true, message: "Введіть поточний пароль" }]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Поточний пароль"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Новий пароль"
                  rules={[
                    { required: true, message: "Введіть новий пароль" },
                    { min: 6, message: "Мінімум 6 символів" },
                    {
                      validator: (_, value) =>
                        /[A-Z]/.test(value)
                          ? Promise.resolve()
                          : Promise.reject("Має бути велика літера"),
                    },
                    {
                      validator: (_, value) =>
                        /[a-z]/.test(value)
                          ? Promise.resolve()
                          : Promise.reject("Має бути мала літера"),
                    },
                    {
                      validator: (_, value) =>
                        /\d/.test(value)
                          ? Promise.resolve()
                          : Promise.reject("Має бути цифра"),
                    },
                    {
                      validator: (_, value) =>
                        /[!@#$%^&*()_\-+=.,:;?]/.test(value)
                          ? Promise.resolve()
                          : Promise.reject("Має бути спецсимвол"),
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Новий пароль"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Підтвердження пароля"
                  dependencies={["newPassword"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Підтвердіть пароль" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value)
                          return Promise.resolve();
                        return Promise.reject("Паролі не співпадають");
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Підтвердження пароля"
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="middle"
                    style={{
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    Змінити пароль
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      ) : (
        <p>Не вдалося завантажити профіль.</p>
      )}
    </Modal>
  );
};

export default UserProfileModal;
