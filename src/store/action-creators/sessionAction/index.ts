import { Dispatch } from "redux";
import { SessionActions, SessionActionTypes } from "../../reducers/SessionReducer/type";
import { fetchGroupSessions, createSession, updateSession, deleteSession } from "../../../services/api-session-service";

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

export const createSessionAction = (sessionData: { groupId: number; startTime: string; endTime: string; createdBy: string, userId: string } ) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await createSession(sessionData);
            const { success, payload, message } = response as any;

            if (success) {
                dispatch({
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

export const updateSessionAction = (sessionId: string, startTime?: Date | null, endTime?: Date | null) => {
    return async (dispatch: Dispatch<SessionActions>) => {
        dispatch({ type: SessionActionTypes.START_REQUEST });

        try {
            const response = await updateSession(sessionId, startTime, endTime);
            const { success, message, payload } = response as any;

            if (success) {
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
