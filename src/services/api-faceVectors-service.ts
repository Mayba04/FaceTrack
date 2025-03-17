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
    deleteSesionVector: (Id: number) => requests.delete(`/sessionFaceVector/delete/${Id}`),
    markStudentsPresent: (attendanceData: any) => requests.post("/attendance/create", attendanceData),
};

export async function addedVectorsToStudents(vectorUserData: any) {
    try {
        const response = await FaceVector.addedVectorsToStudents(vectorUserData);
        return response;
    } catch (error) {
        console.error("Error addedVectorsToStudents:", error);
        return { success: false, message: "Failed to addedVectorsToStudents", error };
    }
}

export async function deleteVector(vectorId: number) {
    try {
        console.log("vectorId ", vectorId);
        const response = await FaceVector.deleteSesionVector(vectorId);
        return response;
    } catch (error) {
        console.error("Error deleteSesionVector:", error);
        return { success: false, message: "Failed to deleteSesionVector", error };
    }
}

export async function markStudentsPresent(attendanceData: any) {
    try {
        return await FaceVector.markStudentsPresent(attendanceData);
    } catch (error) {
        console.error("Error marking students present:", error);
        return { success: false, message: "Failed to mark students present", error };
    }
}