import { SessionState, SessionActions, SessionActionTypes } from "./type";

const initialState: SessionState = {
    session: null, 
    sessions: [], 
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalCount: 0,
};

const SessionReducer = (state = initialState, action: SessionActions): SessionState => {
    switch (action.type) {
        case SessionActionTypes.START_REQUEST:
            console.log("SessionActionTypes.START_REQUEST")
            return { ...state, loading: true, error: null };

        case SessionActionTypes.FETCH_SESSIONS_SUCCESS:
            return {
                ...state,
                sessions: action.payload.sessions,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
                pageSize: action.payload.pageSize,
                totalCount: action.payload.totalCount,
                loading: false,
            };

        case SessionActionTypes.FETCH_SESSIONS_ERROR:
        case SessionActionTypes.FETCH_SESSION_ERROR:
        case SessionActionTypes.CREATE_SESSION_ERROR:
        case SessionActionTypes.UPDATE_SESSION_ERROR:
        case SessionActionTypes.DELETE_SESSION_ERROR:
            return { ...state, loading: false, error: action.payload };

        case SessionActionTypes.FETCH_SESSION_SUCCESS:
            return { ...state, session: action.payload, loading: false };

        case SessionActionTypes.CREATE_SESSION_SUCCESS:
            return {
                ...state,
                sessions: [...state.sessions, action.payload],
                totalCount: state.totalCount + 1,
                loading: false,
            };

            case SessionActionTypes.UPDATE_SESSION_SUCCESS:
                console.log("UPDATE_SESSION_SUCCESS action triggered", action.payload);
                return {
                    ...state,
                    sessions: state.sessions.map((session) =>
                        session.id === action.payload.id
                            ? { 
                                ...session, 
                                startTime: action.payload.startTime ? new Date(action.payload.startTime) : null,
                                endTime: action.payload.endTime ? new Date(action.payload.endTime) : null
                              }
                            : session
                    ),
                    loading: false,  
                };

        case SessionActionTypes.DELETE_SESSION_SUCCESS:
            return {
                ...state,
                sessions: state.sessions.filter((session) => session.id !== String(action.payload)),
                totalCount: state.totalCount - 1,
                loading: false,
            };


        default:
            return state;
    }
};

export default SessionReducer;
