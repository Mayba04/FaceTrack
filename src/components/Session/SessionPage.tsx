import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { detectBase64Video } from "../../services/api-facetrack-service";
import { Button } from "react-bootstrap";

// Інтерфейс, що відображає структуру об'єкта, який повертає бекенд у полі "faces"
interface IFace {
  name: string;
  faceImageBase64: string;
  vectorId: number; // або string, якщо бекенд повертає рядок
}

const SessionPage: React.FC = () => {
  // Забираємо sessionId з URL (React Router)
  const { sessionId } = useParams<{ sessionId: string }>();

  // Реф на відео-елемент (щоб отримувати "прямий ефір" з камери)
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Стан з розпізнаними обличчями
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);

  // Стан, що вказує на "завантаження" (у процесі обробки кадру)
  const [loading, setLoading] = useState<boolean>(false);

  // Чи зараз відбувається знімання (капчеринг) кадрів
  const [isCapturing, setIsCapturing] = useState<boolean>(true);

  // Реф для збереження інтервалу (щоб можна було зупинити)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функція запуску відео з вебкамери
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

  // Функція знімання поточного кадру з <video>
  const captureFrame = async (): Promise<File | null> => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Перетворюємо зображення з canvas у base64
    const base64Image = canvas.toDataURL("image/png");
    // Робимо з цієї base64 Blob
    const blob = await fetch(base64Image).then((res) => res.blob());
    // Із Blob формуємо файл
    return new File([blob], "frame.png", { type: "image/png" });
  };

  // Викликається кожні N секунд (згідно з setInterval), щоб відіслати поточний кадр на бекенд
  const processFrame = async () => {
    setLoading(true);
    try {
      const file = await captureFrame();
      if (!file) return;

      // Запит до бекенду: надсилаємо файл і sessionId
      const response = await detectBase64Video(file, Number(sessionId));
      const { faces } = response as any; // Типізацію можна дописати суворіше

      // Якщо повертається масив faces
      if (Array.isArray(faces)) {
        // Оновлюємо recognizedFaces, уникаючи дублювання за vectorId
        setRecognizedFaces((prevFaces) => {
          // Відкидаємо обличчя, vectorId яких уже є в prevFaces
          const newFaces = faces.filter((newFace: IFace) => {
            return !prevFaces.some((prevFace) => prevFace.vectorId === newFace.vectorId);
          });

          // Якщо newFaces порожнє — просто повертаємо старий масив
          // Інакше — об'єднуємо старий + нові
          return newFaces.length > 0 ? [...prevFaces, ...newFaces] : prevFaces;
        });
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect, що спрацьовує при монтуванні/зміні isCapturing
  useEffect(() => {
    startVideo();

    // Якщо isCapturing == true, ставимо setInterval
    if (isCapturing) {
      intervalRef.current = setInterval(processFrame, 5000); // кожні 5 секунд
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // При розмонтуванні компонента очищуємо інтервал
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isCapturing]);

  // Кнопка "Start/Stop Capturing"
  const toggleCapture = () => setIsCapturing((prev) => !prev);

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-lg-8 mx-auto mt-3">
          <div className="card shadow-lg p-4">
            <h2 className="text-center">
              Session {sessionId} - Face Recognition
            </h2>

            {/* Відео-потік із вебкамери */}
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-100 rounded mb-3"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />

            {/* Кнопка старт/стоп */}
            <Button
              variant={isCapturing ? "danger" : "success"}
              onClick={toggleCapture}
            >
              {isCapturing ? "Stop Capturing" : "Start Capturing"}
            </Button>

            {/* Список розпізнаних облич */}
            <div
              className="card mt-3 faces-card"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <h4 className="card-header text-center">Recognized Faces</h4>
              <div className="card-body">
                {/* Якщо триває завантаження і ще немає жодного розпізнаного обличчя */}
                {loading && recognizedFaces.length === 0 ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : recognizedFaces.length > 0 ? (
                  <ul className="list-group">
                    {recognizedFaces.map((face) => (
                      <li
                        key={face.vectorId} // краще використовувати унікальний key — vectorId
                        className="list-group-item d-flex align-items-center"
                      >
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
                  <p className="text-center text-muted">
                    No faces recognized yet.
                  </p>
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
