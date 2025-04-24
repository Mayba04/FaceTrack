import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, message, Checkbox, Typography, Card } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";

const { Paragraph } = Typography;

const AttendanceMark: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const { sessionId } = useParams();

  const handleCapture = async () => {
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("file", blob, "face.webp");
      formData.append("sessionId", sessionId!);

      const response = await axios.post("/api/attendance/mark", formData);
      if (response.data && response.data.success) {
        message.success("Відмітка успішна!");
      } else {
        message.error(response.data.error || "Не знайдено обличчя. Спробуйте ще раз.");
      }
    } catch {
      message.error("Помилка під час відправки фото.");
    } finally {
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
          screenshotFormat="image/webp"
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
