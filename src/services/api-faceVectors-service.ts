import instance from "./api-instance";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any) => instance.post(url, body).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const FaceVector = {
    addedVectorsToStudents: (vectorUserData: any) => requests.post("/sessionFaceVector/vectorUserAdded", vectorUserData),
};

export async function addedVectorsToStudents(vectorUserData: any) {
    try {
        const response = await FaceVector.addedVectorsToStudents(vectorUserData);
        return response;
    } catch (error) {
        console.error("Error addStudentToGroup:", error);
        return { success: false, message: "Failed to addStudentToGroup", error };
    }
}
