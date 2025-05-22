export interface PlannedSession {
  id: number;
  sessionId: number;
  plannedDate: string;
  startTime: string;
  endTime: string;
  sessionName?: string;
}

export interface PlannedSessionState {
  plannedSession: PlannedSession;
  sessions: PlannedSession[];
  upcoming: PlannedSession[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export enum PlannedSessionActionTypes {
  START_REQUEST = "PLANNED_SESSION_START_REQUEST",
  CREATE_SUCCESS = "PLANNED_SESSION_CREATE_SUCCESS",
  CREATE_ERROR = "PLANNED_SESSION_CREATE_ERROR",
  FETCH_BY_SESSION_ID_SUCCESS = "PLANNED_SESSION_FETCH_BY_SESSION_ID_SUCCESS",
  FETCH_ERROR = "PLANNED_SESSION_FETCH_ERROR",
  UPDATE_SUCCESS = "UPDATE_SUCCESS",
  UPDATE_ERROR = "UPDATE_ERROR",
  DELETE_SUCCESS = "DELETE_SUCCESS",
  DELETE_ERROR = "DELETE_ERROR",
  FETCH_UPCOMING_BY_TEACHER_SUCCESS = "PLANNED_SESSION_FETCH_UPCOMING_BY_TEACHER_SUCCESS",
  FETCH_UPCOMING_BY_STUDENT_SUCCESS = "PLANNED_SESSION_FETCH_UPCOMING_BY_STUDENT_SUCCESS",
}


interface FetchUpcomingByStudentSuccessAction {
  type: PlannedSessionActionTypes.FETCH_UPCOMING_BY_STUDENT_SUCCESS;
  payload: PlannedSession[];
}

interface FetchUpcomingByTeacherSuccessAction {
  type: PlannedSessionActionTypes.FETCH_UPCOMING_BY_TEACHER_SUCCESS;
  payload: PlannedSession[];
}


interface UpdateSuccessAction {
  type: PlannedSessionActionTypes.UPDATE_SUCCESS;
  payload: string;
}

interface UpdateErrorAction {
  type: PlannedSessionActionTypes.UPDATE_ERROR;
  payload: string;
}

interface DeleteSuccessAction {
  type: PlannedSessionActionTypes.DELETE_SUCCESS;
  payload: string;
}

interface DeleteErrorAction {
  type: PlannedSessionActionTypes.DELETE_ERROR;
  payload: string;
}


interface FetchBySessionIdSuccessAction {
  type: PlannedSessionActionTypes.FETCH_BY_SESSION_ID_SUCCESS;
  payload: PlannedSession[];
}

interface FetchErrorAction {
  type: PlannedSessionActionTypes.FETCH_ERROR;
  payload: string;
}

interface StartRequestAction {
  type: PlannedSessionActionTypes.START_REQUEST;
}

interface CreateSuccessAction {
  type: PlannedSessionActionTypes.CREATE_SUCCESS;
  payload: string; 
}

interface CreateErrorAction {
  type: PlannedSessionActionTypes.CREATE_ERROR;
  payload: string; 
}

export type PlannedSessionActions =
  | StartRequestAction
  | CreateSuccessAction
  | CreateErrorAction
  | FetchBySessionIdSuccessAction
  | FetchErrorAction
  | UpdateSuccessAction
  | UpdateErrorAction
  | DeleteSuccessAction
  | DeleteErrorAction
  | FetchUpcomingByTeacherSuccessAction
  | FetchUpcomingByStudentSuccessAction;