import instance from "./api-instance";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any, config?: any) => instance.post(url, body, config).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const Attendance = {
    getAttendanceBySession: (Id: number) => requests.get(`/attendance/session/${Id}`),
    markStudentsPresent: (attendanceData: any) => requests.post("/attendance/create", attendanceData),
    getMatrixByGroupId: (groupId: number) => requests.get(`/attendance/matrix/group/${groupId}`),
    markAbsent: (attendanceData: any) => requests.post("/attendance/mark-absent", attendanceData),
    deleteAttendanceById: (id: number) => requests.delete(`/attendance/delete/${id}`),
};


export async function markStudentAbsent(data: any) {
  try {
    return await Attendance.markAbsent(data);
  } catch (error) {
    console.error("Error marking student absent:", error);
    return { success: false };
  }
}

export async function deleteAttendance(id: number) {
  try {
    return await Attendance.deleteAttendanceById(id);
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return { success: false };
  }
}

export async function getAttendanceMatrixByGroupId(groupId: number) {
  try {
      return await Attendance.getMatrixByGroupId(groupId);
  } catch (error) {
      console.error("Error fetching attendance matrix:", error);
      return { success: false, message: "Failed to fetch attendance matrix", error };
  }
}

export async function getAttendanceBySession(sessionId: number) {
    try {
      const response = await Attendance.getAttendanceBySession(sessionId);
      return response;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return { success: false, message: "Failed to fetch attendance" };
    }
  }
  
  export async function markStudentsPresent(attendanceData: any) {
    try {
        return await Attendance.markStudentsPresent(attendanceData);
    } catch (error) {
        console.error("Error marking students present:", error);
        return { success: false, message: "Failed to mark students present", error };
    }
}