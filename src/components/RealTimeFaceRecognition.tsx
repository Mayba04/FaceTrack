import React, { useRef, useEffect } from "react";
import { detectBase64Video } from "../services/face-recognition-service";

const RealTimeFaceRecognition: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const startVideo = () => {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => console.error("Error accessing webcam: ", err));
        }
    };

    const processFrame = async () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            // Малюємо кадр з відео на canvas
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // Отримуємо зображення з canvas у форматі base64
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
                // Запит до бекенду
                const response = await detectBase64Video(file);
                const { faces } = response as any;

                // Малюємо прямокутники навколо облич
                faces.forEach((face: any) => {
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(face.x, face.y, face.width, face.height);
                });
            } catch (error) {
                console.error("Error processing frame:", error);
            }
        }
    };

    useEffect(() => {
        startVideo();
        const interval = setInterval(() => {
            processFrame();
        }, 100); // Обробка кадрів кожні 500 мс
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mt-4">
            <h2>Real-Time Face Recognition</h2>
            <div style={{ position: "relative", display: "inline-block" }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{ width: "640px", height: "480px", border: "1px solid black" }}
                ></video>
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "640px",
                        height: "480px",
                    }}
                ></canvas>
            </div>
        </div>
    );
};

export default RealTimeFaceRecognition;
