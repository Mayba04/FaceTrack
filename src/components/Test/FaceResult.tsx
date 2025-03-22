import React from "react";

interface FaceResultProps {
    result: {
        FacesDetected: number;
        FaceVectors: number[][];
    };
}

const FaceResult: React.FC<FaceResultProps> = ({ result }) => {
    return (
        <div>
            <h3>Recognition Results</h3>
            <p>Faces Detected: {result.FacesDetected}</p>
            <div>
                <h4>Face Vectors:</h4>
                {result.FaceVectors.map((vector, index) => (
                    <pre key={index}>
                        Face {index + 1}: {JSON.stringify(vector, null, 2)}
                    </pre>
                ))}
            </div>
        </div>
    );
};

export default FaceResult;
