import { Modal, Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { fetchUserDetail } from "../../services/api-user-service";
import { APP_ENV } from "../../env";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<Props> = ({ open, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const userId = useSelector((state: RootState) => state.UserReducer.loggedInUser?.id);

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
        setNewPassword("");
        setConfirmPassword("");
      }
    };

    loadUser();
  }, [open, userId]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      message.error("Паролі не співпадають");
      return;
    }

    // TODO: реалізуй запит на бекенд
    message.success("Пароль успішно змінено");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePhoto = () => {
    // TODO: відкриття модалки/вибір фото/виклик API
    message.info("Функціонал зміни фото ще не реалізовано");
  };

  return (
    <Modal
      title="Ваш профіль"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
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
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "#eee",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
              }}
            >
              Фото відсутнє
            </div>
          )}
          <Button size="small" onClick={handleChangePhoto} style={{ marginBottom: 16 }}>
            {user.mainPhotoFileName ? "Змінити фото" : "Додати фото"}
          </Button>

          {/* ПІБ */}
          <h2 style={{ marginBottom: 24 }}>{user.fullName}</h2>

          {/* Інформація */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px 40px",
              width: "100%",
              maxWidth: 600,
              marginBottom: 32,
            }}
          >
            <div>
              <strong>Email Address:</strong>
              <p style={{ margin: 0 }}>{user.email}</p>
            </div>
            <div>
              <strong>Role:</strong>
              <p style={{ margin: 0 }}>{user.role}</p>
            </div>
            <div>
              <strong>Status:</strong>
              <p style={{ margin: 0 }}>{user.lockoutEnabled ? "Blocked" : "Active"}</p>
            </div>
          </div>

          {/* Зміна пароля */}
          <div style={{ width: "100%", maxWidth: 400 }}>
            <h3>Змінити пароль</h3>
            <Input.Password
              placeholder="Новий пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Input.Password
              placeholder="Підтвердження пароля"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Button type="primary" block onClick={handlePasswordChange}>
              Змінити пароль
            </Button>
          </div>
        </div>
      ) : (
        <p>Не вдалося завантажити профіль.</p>
      )}
    </Modal>
  );
};

export default UserProfileModal;
