import instance from "./api-instance";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any, config?: any) => instance.post(url, body, config).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const FaceTrack = {
    detectBase64Video: (file: File, sessionId: number) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId.toString()); 
    
        return requests.post("/FaceTrack/process-frame", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },    
};

export async function detectBase64Video(file: File, sessionId: number) {
    try {
        const response = await FaceTrack.detectBase64Video(file, sessionId);
        console.log("Response from detectBase64Video:", response); 
        return response;
    } catch (error) {
        console.error("detectBase64Video error:", error); 
        return { message: "Failed to fetch detectBase64Video", error };
    }
}
