import React, { useRef, useState, useEffect } from "react";
import { Card, Avatar, List, Spin } from "antd";
import { detectBase64Video } from "../../services/face-recognition-service";
import "./RealTimeFaceRecognition.css";

interface IFace {
  name: string;
  faceImageBase64: string;
}

const RealTimeFaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/png");

    const file = await fetch(base64Image)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new File([blob], "frame.png", {
            type: "image/png",
          })
      );

    try {
      setLoading(true);
      const response = await detectBase64Video(file);
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
  }, []);

  return (
    <div className="realtime-container">
      <Card className="video-card">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="video-stream"
        />
        <canvas ref={canvasRef} className="hidden-canvas" />
      </Card>

      <Card className="faces-card">
        <h3 className="faces-title">Recognized Faces</h3>
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : recognizedFaces.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={recognizedFaces}
            renderItem={(face) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                      alt={face.name}
                      size={64}
                    />
                  }
                  title={<span className="face-name">{face.name}</span>}
                />
              </List.Item>
            )}
          />
        ) : (
          <p className="no-faces">No faces recognized yet.</p>
        )}
      </Card>
    </div>
  );
};

export default RealTimeFaceRecognition;
