import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, message, Checkbox, Typography, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markAttendanceAction } from "../../store/action-creators/attendanceAction";
import { RootState } from "../../store";
import {
  fetchUserByIdAction,
  updateUserAgreedToImageProcessingAction,
} from "../../store/action-creators/userActions";

const { Paragraph } = Typography;

const AttendanceMark: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const user      = useSelector((s: RootState) => s.UserReducer.loggedInUser);

  const [loading,     setLoading]     = useState(false);
  const [consent,     setConsent]     = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* первинний тихий check — лише для попереднього стану кнопки */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(s => { s.getTracks().forEach(t => t.stop()); setCameraReady(true); })
      .catch(() => setCameraReady(false));
  }, []);

  /* очищаємо треки, коли користувач іде зі сторінки */
  useEffect(() => {
    return () => {
      webcamRef.current?.stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* підтягуємо користувача та згоду */
  useEffect(() => {
    if (user?.id) dispatch(fetchUserByIdAction(user.id) as any);
  }, [dispatch, user?.id]);

  useEffect(() => {
    setConsent(user?.agreedToImageProcessing === true);
  }, [user?.agreedToImageProcessing]);

  /* react-webcam колбеки */
  const onCamAllowed = () => setCameraReady(true);
  const onCamError   = () => setCameraReady(false);

  /* натискаємо “Відмітитись” */
  const handleCapture = async () => {
    if (!consent)     { message.warning("Потрібно погодитись на обробку зображення"); return; }
    if (!cameraReady) { message.warning("Камеру заблоковано або ще не дозволено");   return; }

    /* --- чорний кадр --- */
    if (webcamRef.current?.video?.videoWidth === 0) {
      message.error("Камеру дозволено, але зображення відсутнє.");
      setCameraReady(false);
      return;
    }

    setLoading(true);
    try {
      await dispatch(fetchUserByIdAction(user!.id) as any);

      if (!user?.agreedToImageProcessing)
        await dispatch(updateUserAgreedToImageProcessingAction({
          id: user!.id, agreedToImageProcessing: true,
        }) as any);

      const img = webcamRef.current!.getScreenshot();
      if (!img) throw new Error("Не вдалося зробити фото");

      const blob = await (await fetch(img)).blob();
      const fd   = new FormData();
      fd.append("SessionId", sessionId!);
      fd.append("StudentId", user!.id);
      fd.append("Photo",     blob, "face.webp");

      const resp: any = await dispatch(markAttendanceAction(fd) as any);
      const { success, message: msg } = resp as any;

    if (success) {
      message.success(msg);
      navigate("/student/sessions/today");
    } else {
      message.error(msg ?? "Не вдалося відмітити присутність");
    }

    } catch {
      message.error("Сталася помилка при відмітці");
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled =
    (!consent && !user?.agreedToImageProcessing) || !cameraReady;

  /* UI */
  return (
    <div
      style={{
        minHeight:"100vh",
        background:"linear-gradient(120deg,#e3f0ff 0%,#c6e6fb 100%)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 12px",
      }}
    >
      <Card
        style={{
          maxWidth:410, width:"100%", borderRadius:18,
          boxShadow:"0 6px 32px rgba(30,64,175,.13)",
          textAlign:"center", padding:"30px 18px",
        }}
      >
        <Paragraph style={{ marginBottom:16, fontSize:15 }}>
          <b>Важливо!</b> Натискаючи <b>«Відмітитись»</b>, ви погоджуєтесь на&nbsp;
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{color:"#1976d2"}}>
            обробку вашого фото для ідентифікації
          </a>.
        </Paragraph>

        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMedia={onCamAllowed}
          onUserMediaError={onCamError}
          style={{
            width:320, height:240, margin:"auto",
            borderRadius:12, border:"3px solid #d8e6ff",
            boxShadow:"0 1px 9px #bed9fc63",
            objectFit:"cover", background:"#f5faff",
          }}
        />

        {!cameraReady && (
          <Paragraph style={{ color:"#d93025", marginTop:12 }}>
            ⚠️ Камеру заблоковано або не надано дозвіл.
          </Paragraph>
        )}

        {!user?.agreedToImageProcessing && (
          <div style={{ marginTop:18 }}>
            <Checkbox checked={consent} onChange={e => setConsent(e.target.checked)}>
              Я погоджуюсь з обробкою мого зображення
            </Checkbox>
          </div>
        )}

        <Button
          type="primary"
          loading={loading}
          disabled={btnDisabled}
          onClick={handleCapture}
          style={{
            marginTop:18, width:"100%", height:46, fontWeight:600,
            background: btnDisabled
              ? "#d5e2ef"
              : "linear-gradient(90deg,#1976d2 60%,#64b5f6)",
            color: btnDisabled ? "#b3bed0" : "#fff",
            border:"none",
            boxShadow: btnDisabled ? "none" : "0 2px 10px #1976d229",
            letterSpacing:1,
          }}
        >
          Відмітитись
        </Button>
      </Card>
    </div>
  );
};

export default AttendanceMark;
