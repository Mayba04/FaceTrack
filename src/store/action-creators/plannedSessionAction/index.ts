import { Dispatch } from "redux";
import { PlannedSessionActionTypes, PlannedSessionActions } from "../../reducers/PlannedSessionReducer/type";
import { createPlannedSession, deletePlannedSession, fetchPlannedSessions, fetchUpcomingSessions, fetchUpcomingSessionsByStudent, updatePlannedSession } from "../../../services/api-planned-session-service"; 


export const fetchUpcomingSessionsByStudentAction =
  (studentId: string) =>
  async (dispatch: Dispatch<PlannedSessionActions>) => {
    dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

    const response = await fetchUpcomingSessionsByStudent(studentId);
    const { success, payload, message } = response as any;

    if (success) {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_UPCOMING_BY_STUDENT_SUCCESS,
        payload,
      });
    } else {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_ERROR,
        payload: message,
      });
    }
  };


export const fetchUpcomingSessionsByTeacherAction = (teacherId: string) => {
  return async (dispatch: Dispatch<PlannedSessionActions>) => {
    dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

    const response = await fetchUpcomingSessions(teacherId);
    const { success, payload, message } = response as any;

    if (success) {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_UPCOMING_BY_TEACHER_SUCCESS,
        payload,
      });
    } else {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_ERROR,
        payload: message,
      });
    }
  };
};

export const addPlannedSessionAction =
  (model: any) =>
async (dispatch: Dispatch<PlannedSessionActions>) => {
  dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

  const response = await createPlannedSession(model); 
  const { success, message } = response as any;
  if (success) {
    dispatch({
      type: PlannedSessionActionTypes.CREATE_SUCCESS,
      payload: "Майбутню сесію додано успішно!",
    });
  } else {
    dispatch({
      type: PlannedSessionActionTypes.CREATE_ERROR,
      payload: message ?? "Не вдалося додати сесію",
    });
  }
  return response;
};

export const fetchPlannedSessionsBySessionIdAction = (sessionId: number) => {
  return async (dispatch: Dispatch<PlannedSessionActions>) => {
    dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

    const response = await fetchPlannedSessions(sessionId);
     const { success, payload, message } = response as any;
    if (success) {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_BY_SESSION_ID_SUCCESS,
        payload: payload,
      });
    } else {
      dispatch({
        type: PlannedSessionActionTypes.FETCH_ERROR,
        payload: message,
      });
    }
  };
};


export const updatePlannedSessionAction =
  (dto: any) => async (dispatch: Dispatch<PlannedSessionActions>) => {
    dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

    const response = await updatePlannedSession(dto);
    if (response.success) {
      dispatch({
        type: PlannedSessionActionTypes.UPDATE_SUCCESS,
        payload: "Сесію оновлено",
      });
    } else {
     dispatch({
        type: PlannedSessionActionTypes.UPDATE_ERROR,
        payload: response.message ?? "Сталася помилка при оновленні сесії",
        });

    }

    return response;
  };

export const deletePlannedSessionAction =
  (id: number) => async (dispatch: Dispatch<PlannedSessionActions>) => {
    dispatch({ type: PlannedSessionActionTypes.START_REQUEST });

    const response = await deletePlannedSession(id);
    if (response.success) {
      dispatch({
        type: PlannedSessionActionTypes.DELETE_SUCCESS,
        payload: "Сесію видалено",
      });
    } else {
      dispatch({
        type: PlannedSessionActionTypes.DELETE_ERROR,
        payload: response.message ?? "Сталася помилка при видаленні сесії",
      });
    }

    return response;
  };