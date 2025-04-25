import { Dispatch } from "redux";
import { SessionActions, SessionActionTypes } from "../../reducers/SessionReducer/type";
import { fetchGroupSessions, createSession, updateSession, deleteSession, fetchSessionById, getTodaysSessions, getPendingFaceRequests} from "../../../services/api-session-service";
import { message } from "antd";

export const fetchSessionsAction = (groupId: string) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await fetchGroupSessions(groupId);
            const { success, payload, message } = response as any;

            if (success) {
                dispatch({
                    type: SessionActionTypes.FETCH_SESSIONS_SUCCESS,
                    payload: {
                        sessions: payload,
                        currentPage: 1,
                        totalPages: 1,
                        pageSize: payload.length,
                        totalCount: payload.length,
                    },
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error fetching sessions: ", error);
            dispatch({ type: SessionActionTypes.FETCH_SESSIONS_ERROR, payload: "Error fetching sessions" });
        }
    };
};

export const fetchSessionByIdAction = (Id: number) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await fetchSessionById(Id);
            const { payload, success, message } = response as any; 
            if (success) {
                dispatch({
                    type: SessionActionTypes.FETCH_SESSION_SUCCESS,
                    payload: payload,
                });
            } else {
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to fetching session:", error?.message || error);
            dispatch({
                type: SessionActionTypes.FETCH_SESSION_ERROR,
                payload: "Error fetching session",
            });
            message.error(error?.message || "Failed fetching sessions");
        }
    };
};

export const createSessionAction = (sessionData: { groupId: number; startTime: string; endTime: string; createdBy: string, userId: string } ) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        await dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await createSession(sessionData);
            const { success, payload, message } = response as any;

            if (success) {
                await dispatch({
                    type: SessionActionTypes.CREATE_SESSION_SUCCESS,
                    payload: payload,
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error creating session: ", error);
            dispatch({ type: SessionActionTypes.CREATE_SESSION_ERROR, payload: "Error creating session" });
        }
    };
};

export const updateSessionAction = (sessionData: { id: string, groupId: number; startTime: string; endTime: string; createdBy: string, userId: string }) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });
        try {
            const response = await updateSession(sessionData);
            const { success, message, payload } = response as any;
            console.log("response ", response)
            if (success) {
                console.log("Dispatching UPDATE_SESSION_SUCCESS");
                dispatch({
                    type: SessionActionTypes.UPDATE_SESSION_SUCCESS,
                    payload: payload,
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error updating session: ", error);
            dispatch({ type: SessionActionTypes.UPDATE_SESSION_ERROR, payload: "Error updating session" });
        }
      
    };
};

export const deleteSessionAction = (sessionId: string) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await deleteSession(sessionId);
            const { success, message, payload } = response as any;

            if (success) {
                dispatch({
                    type: SessionActionTypes.DELETE_SESSION_SUCCESS,
                    payload: payload,
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error deleting session: ", error);
            dispatch({ type: SessionActionTypes.DELETE_SESSION_ERROR, payload: "Error deleting session" });
        }
    };
};

export const fetchTodaysSessionsAction = (studentId: string) => {
    return async () => {
    
      try {
        const response = await getTodaysSessions(studentId);
        return response;
      } catch  {
        return { success: false, payload: [] }; 
      }
    };
  };


  export const fetchPendingFaceRequestsAction = (sessionId: number) => {
    return async () => {
      try {
        const response = await getPendingFaceRequests(sessionId);
        return response;
      } catch {
        return { success: false, payload: [] };
      }
    };
  };
