import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, message, Checkbox, Typography, Card } from "antd";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markAttendanceAction } from "../../store/action-creators/attendanceAction"; 
import { RootState } from "../../store";

const { Paragraph } = Typography;

const AttendanceMark: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const user = useSelector((state: RootState) => state.UserReducer.loggedInUser);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const { sessionId } = useParams();
  const dispatch = useDispatch();

  const handleCapture = async () => {
    setLoading(true);
    try {
      // 1) Робимо скрін із веб-камери
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await (await fetch(imageSrc)).blob();
  
      // 2) Формуємо FormData з тими полями, які відповідають DTO
      const formData = new FormData();
      formData.append("SessionId", sessionId!);           // назва має точно співпасти з SessionId
      formData.append("StudentId", user!.id);              // і тут — точно StudentId
      formData.append("Photo", blob, "face.webp");         // ключ “Photo” → IFormFile Photo
  
      // 3) Відправляємо через наш Redux-action
      const response: any = await dispatch(markAttendanceAction(formData) as any);
  
      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message || "Не вдалося відмітити присутність");
      }
    }  finally {
      setLoading(false);
    }
  };
  

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 12px",
      }}
    >
      <Card
        style={{
          maxWidth: 410,
          width: "100%",
          borderRadius: 18,
          boxShadow: "0 6px 32px 0 rgba(30,64,175,0.13)",
          textAlign: "center",
          padding: "30px 18px",
        }}
      >
        <Paragraph style={{ marginBottom: 16, fontSize: 15 }}>
          <b>Важливо!</b> Натискаючи <b>"Відмітитись"</b>, ви погоджуєтесь на{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2" }}
          >
            обробку вашого фото для ідентифікації особи
          </a>
          . <br />
          Дані зберігаються та використовуються лише згідно з політикою конфіденційності.
        </Paragraph>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{
            width: 320,
            height: 240,
            margin: "auto",
            borderRadius: 12,
            border: "3px solid #d8e6ff",
            boxShadow: "0 1px 9px #bed9fc63",
            objectFit: "cover",
            background: "#f5faff",
          }}
        />
        <div style={{ marginTop: 18 }}>
          <Checkbox checked={consent} onChange={e => setConsent(e.target.checked)}>
            Я погоджуюсь з обробкою мого зображення для ідентифікації особи
          </Checkbox>
        </div>
        <Button
          type="primary"
          loading={loading}
          disabled={!consent}
          onClick={handleCapture}
          style={{
            marginTop: 18,
            width: "100%",
            fontWeight: 600,
            background: consent
              ? "linear-gradient(90deg,#1976d2 60%,#64b5f6)"
              : "#d5e2ef",
            color: consent ? "#fff" : "#b3bed0",
            border: "none",
            fontSize: 16,
            boxShadow: consent ? "0 2px 10px #1976d229" : "none",
            letterSpacing: 1,
            height: 46,
            transition: "background .17s,color .17s",
          }}
        >
          Відмітитись
        </Button>
      </Card>
    </div>
  );
};

export default AttendanceMark;
