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
};

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