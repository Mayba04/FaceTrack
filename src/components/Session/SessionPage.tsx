import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import { detectBase64Video } from "../../services/api-facetrack-service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { fetchSessionByIdAction } from "../../store/action-creators/sessionAction";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import type { AppDispatch } from "../../store";
import { addedVectorsToStudents, deleteVector } from "../../services/api-faceVectors-service";

interface IFace {
  name: string;
  faceImageBase64: string;
  vectorId: number;
  assignedStudentId?: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const studentsFromStore = useSelector((state: RootState) => state.UserReducer.users);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sessionData = useSelector((state: RootState) => state.SessionReducer.session);
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Запускаємо відео
    startVideo();

    // Завантажуємо поточну сесію
    dispatch(fetchSessionByIdAction(Number(sessionId)))
      .catch((err) => {
        console.error("Error fetching session:", err);
      });
      
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (sessionData?.groupId) {
      dispatch(fetchStudentByGroupIdAction(Number(sessionData.groupId)));
    }
  }, [sessionData, dispatch]);

  useEffect(() => {
    // Якщо isCapturing = true, кожні 5с викликаємо processFrame
    if (isCapturing) {
      intervalRef.current = setInterval(processFrame, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // При демонтажі зупиняємо
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapturing]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }).catch((err) => console.error("Error accessing webcam:", err));
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
          const existingVectorIds = new Set(prevFaces.map((face) => face.vectorId));
          const existingUserNames = new Set(prevFaces.map((face) => face.name));
  
          const newFaces = faces.filter((newFace: IFace) => {
           
            if (existingVectorIds.has(newFace.vectorId)) return false;
  
            if (newFace.name !== "Unknown" && existingUserNames.has(newFace.name)) {
              return false;
            }
  
            return true;
          });
  
          return newFaces.length > 0 ? [...prevFaces, ...newFaces] : prevFaces;
        });
      }
    } catch (err) {
      console.error("Error processing frame:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleCapture = () => {
    setIsCapturing((prev) => !prev);
  };

  const handleAssignStudent = (vectorId: number, studentId: string) => {
    setRecognizedFaces((prev) =>
      prev.map((face) =>
        face.vectorId === vectorId ? { ...face, assignedStudentId: studentId } : face
      )
    );
  };

  const handleRemoveFace = async (vectorId: number) => {
    if (!vectorId) return;

    try {
        const response = await deleteVector(vectorId);
        const { success, message } = response as any; 
        if (success) {
            setRecognizedFaces((prev) => prev.filter((face) => face.vectorId !== vectorId));
        } else {
            console.error("Server error while deleting vector:", message);
            alert("Failed to delete vector. Try again.");
        }
    } catch (error) {
        console.error("Unexpected error deleting vector:", error);
        alert("Unexpected error occurred. Try again.");
    }
};


  const saveVectors = async () => {
    try {
      const assignmentData = recognizedFaces
        .filter((face) => face.name === "Unknown" && face.assignedStudentId)
        .map((face) => ({
          vectorId: face.vectorId,
          studentId: face.assignedStudentId
        }));

      if (assignmentData.length === 0) {
        alert("Немає вибраних невідомих облич для збереження.");
        return;
      }

      await addedVectorsToStudents(assignmentData);

      setRecognizedFaces((prev) =>
        prev.map((face) => {
          if (face.name === "Unknown" && face.assignedStudentId) {
            const st = studentsFromStore.find((s) => s.id === face.assignedStudentId);
            if (st) {
              return { ...face, name: st.fullName };
            }
          }
          return face;
        })
      );

      alert("Vectors saved successfully!");
    } catch (error) {
      console.error("Error saving vectors:", error);
      alert("Error saving vectors!");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-lg-8 mx-auto mt-3">
          <div className="card shadow-lg p-4">
            <h2 className="text-center">
              Session {sessionId} - Face Recognition
            </h2>

            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-100 rounded mb-3"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />

            <Button variant={isCapturing ? "danger" : "success"} onClick={toggleCapture}>
              {isCapturing ? "Stop Capturing" : "Start Capturing"}
            </Button>

            <div className="mt-3">
              <h4>Recognized Faces</h4>

              {!isCapturing && (
                <div className="mb-2">
                  <Button onClick={saveVectors} variant="primary">
                    Save Vectors
                  </Button>
                </div>
              )}

              {loading && recognizedFaces.length === 0 ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : recognizedFaces.length > 0 ? (
                <ul
                  className="list-group"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {recognizedFaces.map((face) => {
                    const isUnknown = face.name === "Unknown";
                    return (
                      <li
                        key={face.vectorId}
                        className="list-group-item d-flex align-items-center"
                      >
                        <img
                          src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                          alt={face.name}
                          className="rounded-circle me-3"
                          width={50}
                          height={50}
                        />
                        <span className="me-3">{face.name}</span>

                        {isUnknown && !isCapturing && (
                          <select
                            className="form-select me-2"
                            style={{ maxWidth: "200px" }}
                            value={face.assignedStudentId || ""}
                            onChange={(e) =>
                              handleAssignStudent(face.vectorId, e.target.value)
                            }
                          >
                            <option value="">Select student...</option>
                            {studentsFromStore.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.fullName}
                              </option>
                            ))}
                          </select>
                        )}

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveFace(face.vectorId)}
                        >
                          Remove
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-center text-muted">No faces recognized yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;