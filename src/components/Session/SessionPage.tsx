import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { detectBase64Video } from "../../services/api-facetrack-service";
import { Button } from "react-bootstrap";

interface IFace {
  name: string;
  faceImageBase64: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    setLoading(true);
    try {
      const file = await captureFrame();
      if (!file) return;

      const response = await detectBase64Video(file, Number(sessionId));
      const { faces } = response as any;

      if (Array.isArray(faces)) {
        setRecognizedFaces((prevFaces) => {
          const newFaces = faces.filter(
            (newFace) => !prevFaces.some((prevFace) => prevFace.faceImageBase64 === newFace.faceImageBase64)
          );
          return newFaces.length > 0 ? [...prevFaces, ...newFaces] : prevFaces;
        });
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startVideo();

    if (isCapturing) {
      intervalRef.current = setInterval(processFrame, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, isCapturing]);

  const toggleCapture = () => setIsCapturing((prev) => !prev);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-lg-8 mx-auto mt-3">
          <div className="card shadow-lg p-4">
            <h2 className="text-center">Session {sessionId} - Face Recognition</h2>

            <video ref={videoRef} autoPlay muted className="w-100 rounded mb-3" style={{ maxHeight: "400px", objectFit: "cover" }} />

            <Button variant={isCapturing ? "danger" : "success"} onClick={toggleCapture}>
              {isCapturing ? "Stop Capturing" : "Start Capturing"}
            </Button>

            <div className="card mt-3 faces-card" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <h4 className="card-header text-center">Recognized Faces</h4>
              <div className="card-body">
                {loading && recognizedFaces.length === 0 ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : recognizedFaces.length > 0 ? (
                  <ul className="list-group">
                    {recognizedFaces.map((face, index) => (
                      <li key={index} className="list-group-item d-flex align-items-center">
                        <img
                          src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                          alt={face.name}
                          className="rounded-circle me-3"
                          width={50}
                          height={50}
                        />
                        <span>{face.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted">No faces recognized yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
