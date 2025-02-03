import instance from "./api-instance";

// Утиліта для обробки відповіді
const responseBody: any = (response: any) => response.data;

// Запити для HTTP-методів
const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any, headers?: any) => instance.post(url, body, { headers }).then(responseBody),
};

// API для FaceRecognition
const FaceRecognition = {
    testConnection: () => requests.get("/FaceRecognition/random-number"), 
    detectBase64: (file: File) => {
        const formData = new FormData();
        formData.append("file", file); // Поле називається "file", як у вашому контролері
        //detect-base64
        return requests.post("/FaceRecognition/detect-base64-with-names", formData, {
            headers: { "Content-Type": "multipart/form-data" }, // Налаштування для передачі файлів
        });
    }, 

    detectBase64Video: (file: File) => {
        const formData = new FormData();
        formData.append("file", file); // Поле називається "file", як у вашому контролері

        return requests.post("/FaceRecognition/process-frame", formData, {
            headers: { "Content-Type": "multipart/form-data" }, // Налаштування для передачі файлів
        });
    },
};
// Функція для виклику `detectBase64`
export async function detectBase64(file: File) {
    try {
        const response = await FaceRecognition.detectBase64(file);
        console.log("Response from detectBase64:", response); // Логування для перевірки відповіді
        return response;
    } catch (error) {
        console.error("detectBase64 error:", error); // Логування помилки
        return { message: "Failed to fetch detectBase64", error };
    }
}

export async function detectBase64Video(file: File) {
    try {
        const response = await FaceRecognition.detectBase64Video(file);
        console.log("Response from detectBase64Video:", response); // Логування для перевірки відповіді
        return response;
    } catch (error) {
        console.error("detectBase64Video error:", error); // Логування помилки
        return { message: "Failed to fetch detectBase64Video", error };
    }
}

// Функції для викликів
export async function testConnection() {
    try {
        const response = await FaceRecognition.testConnection();
        console.log("Response from/random-number:", response); // Додайте логування
        return response;
    } catch (error) {
        console.error("Error during testConnection:", error);
        throw error; // Викиньте помилку, щоб її можна було обробити в компоненті
    }
}


export default FaceRecognition;
