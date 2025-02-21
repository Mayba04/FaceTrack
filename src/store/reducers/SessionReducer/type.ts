export interface Session {
    id: string;
    groupId: string;
    startTime?: Date | null;
    endTime?: Date | null;
    createdBy: string;
    userId: string;
  }
  
  export interface SessionState {
    session: Session | null; 
    sessions: Session[]; 
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  }
  export enum SessionActionTypes {
    START_REQUEST = "START_REQUEST",
    FETCH_SESSIONS_SUCCESS = "FETCH_SESSIONS_SUCCESS",
    FETCH_SESSIONS_ERROR = "FETCH_SESSIONS_ERROR",
    FETCH_SESSION_SUCCESS = "FETCH_SESSION_SUCCESS",
    FETCH_SESSION_ERROR = "FETCH_SESSION_ERROR",
    CREATE_SESSION_SUCCESS = "CREATE_SESSION_SUCCESS",
    CREATE_SESSION_ERROR = "CREATE_SESSION_ERROR",
    UPDATE_SESSION_SUCCESS = "UPDATE_SESSION_SUCCESS",
    UPDATE_SESSION_ERROR = "UPDATE_SESSION_ERROR",
    DELETE_SESSION_SUCCESS = "DELETE_SESSION_SUCCESS",
    DELETE_SESSION_ERROR = "DELETE_SESSION_ERROR",
}
  
interface StartRequestAction {
    type: SessionActionTypes.START_REQUEST;
}

interface FetchSessionsSuccessAction {
    type: SessionActionTypes.FETCH_SESSIONS_SUCCESS;
    payload: {
        sessions: Session[];
        currentPage: number;
        totalPages: number;
        pageSize: number;
        totalCount: number;
    };
}

interface FetchSessionsErrorAction {
    type: SessionActionTypes.FETCH_SESSIONS_ERROR;
    payload: string;
}

interface FetchSessionSuccessAction {
    type: SessionActionTypes.FETCH_SESSION_SUCCESS;
    payload: Session;
}

interface FetchSessionErrorAction {
    type: SessionActionTypes.FETCH_SESSION_ERROR;
    payload: string;
}

interface CreateSessionSuccessAction {
    type: SessionActionTypes.CREATE_SESSION_SUCCESS;
    payload: Session;
}

interface CreateSessionErrorAction {
    type: SessionActionTypes.CREATE_SESSION_ERROR;
    payload: string;
}

interface UpdateSessionSuccessAction {
    type: SessionActionTypes.UPDATE_SESSION_SUCCESS;
    payload: { sessionId: number; startTime?: string | null; endTime?: string | null };
}

interface UpdateSessionErrorAction {
    type: SessionActionTypes.UPDATE_SESSION_ERROR;
    payload: string;
}

interface DeleteSessionSuccessAction {
    type: SessionActionTypes.DELETE_SESSION_SUCCESS;
    payload: number;
}

interface DeleteSessionErrorAction {
    type: SessionActionTypes.DELETE_SESSION_ERROR;
    payload: string;
}

export type SessionActions =
    | StartRequestAction
    | FetchSessionsSuccessAction
    | FetchSessionsErrorAction
    | FetchSessionSuccessAction
    | FetchSessionErrorAction
    | CreateSessionSuccessAction
    | CreateSessionErrorAction
    | UpdateSessionSuccessAction
    | UpdateSessionErrorAction
    | DeleteSessionSuccessAction
    | DeleteSessionErrorAction;