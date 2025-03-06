import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, List, Spin, Typography } from "antd";
import { detectBase64Video } from "../../services/api-facetrack-service";
import "../RealTimeFaceRecognition.css";

const { Title } = Typography;

interface IFace {
  name: string;
  faceImageBase64: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const captureFrame = async (): Promise<File | null> => {
    if (!videoRef.current) return null;
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL("image/png");
    const blob = await fetch(base64Image).then((res) => res.blob());
    return new File([blob], "frame.png", { type: "image/png" });
  };

  const processFrame = async () => {
    try {
      setLoading(true);
      const file = await captureFrame();
      if (!file) return;
      const response = await detectBase64Video(file, Number(sessionId));
      const { faces } = response as any;
      if (Array.isArray(faces)) {
        setRecognizedFaces(faces);
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startVideo();
    const interval = setInterval(() => {
      processFrame();
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Session {sessionId} - Face Recognition
        </Title>
        <video ref={videoRef} autoPlay muted style={{ width: "100%", borderRadius: "8px", maxHeight: "400px", objectFit: "cover" }} />
        <Card style={{ marginTop: "20px" }}>
          <h3>Recognized Faces</h3>
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : recognizedFaces.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={recognizedFaces}
              renderItem={(face) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={`data:image/jpeg;base64,${face.faceImageBase64}`} alt={face.name} size={64} />}
                    title={<span>{face.name}</span>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <p style={{ textAlign: "center" }}>No faces recognized yet.</p>
          )}
        </Card>
      </Card>
    </div>
  );
};

export default SessionPage;
