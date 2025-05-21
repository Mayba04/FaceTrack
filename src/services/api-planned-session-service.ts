import instance from "./api-instance";
import { AxiosError } from "axios";

const responseBody = (r: any) => r.data;

const requests = {
   get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
   post: (url: string, body?: any) => instance.post(url, body).then(responseBody),
   put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
   delete: (url: string) => instance.delete(url).then(responseBody),
};

const PlannedSession = {
  create: (d: any) => requests.post("/PlannedSession", d),
  getBySessionId: (sessionId: number) => requests.get(`/PlannedSession/by-session/${sessionId}`),
  update: (d: any) => requests.put("/PlannedSession/update", d),        
  delete: (id: number) => requests.delete(`/PlannedSession/${id}`),    
};

export async function updatePlannedSession(dto: any) {
  try {
    const response = await PlannedSession.update(dto);
    return { success: true, payload: response };
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message ?? "Не вдалося оновити сесію",
    };
  }
}

export async function deletePlannedSession(id: number) {
  try {
    await PlannedSession.delete(id);
    return { success: true };
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message ?? "Не вдалося видалити сесію",
    };
  }
}


export async function fetchPlannedSessions(sessionId: number) {
  try {
    const response = await PlannedSession.getBySessionId(sessionId);
    return { success: true, payload: response.payload };
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message ?? "Не вдалося отримати заплановані сесії"
    };
  }
}

export async function createPlannedSession(dto: any) {
  try {
    console.log("dto ", dto)
    return await PlannedSession.create(dto);
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message ?? "Не вдалося створити майбутню сесію",
    };
  }
}
