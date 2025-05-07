export interface User {
  id: string;
  fullName: string;
  email: string;
  emailConfirmed: boolean;
  lockoutEnd?: Date | null;
  lockoutEnabled: boolean;
  role: string;
  mainPhotoFileName : string;
}

export interface UserState {
  user: User | null; 
  users: User[]; 
  loggedInUser: User | null; 
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

export enum UserActionTypes {
  USER_START_REQUEST  = "USER_START_REQUEST ",
  LOGIN_USER_SUCCESS = "LOGIN_USER_SUCCESS",
  LOGIN_USER_ERROR = "LOGIN_USER_ERROR",
  LOGOUT_USER = "LOGOUT_USER",
  REFRESH_TOKEN_SUCCESS = "REFRESH_TOKEN_SUCCESS",
  REFRESH_TOKEN_ERROR = "REFRESH_TOKEN_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  FETCH_STUDENTS_SUCCESS = "FETCH_STUDENTS_SUCCESS",
  FETCH_STUDENTS_ERROR = "FETCH_STUDENTS_ERROR",
  ADD_STUDENTGROUP_SUCCESS = "ADD_STUDENTGROUP_SUCCESS",
  ADD_STUDENTGROUP_ERROR = "ADD_STUDENTGROUP_ERROR",
  FINISH_REQUEST = "FINISH_REQUEST",
}

interface FinishRequestAction {
  type: UserActionTypes.FINISH_REQUEST;
}

interface AddStudentGroupSuccessAction {
  type: UserActionTypes.ADD_STUDENTGROUP_SUCCESS;
  payload: string;
}


interface AddStudentGroupErrorAction {
  type: UserActionTypes.ADD_STUDENTGROUP_ERROR;
  payload: string;
}

interface FetchStudentsSuccessAction {
  type: UserActionTypes.FETCH_STUDENTS_SUCCESS;
  payload: {
  users: User[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  };
}
  
  interface FetchStudentsErrorAction {
    type: UserActionTypes.FETCH_STUDENTS_ERROR;
    payload: string;
  }


interface StartRequestAction {
  type: UserActionTypes.USER_START_REQUEST ;
}

interface LoginUserSuccessAction {
  user: null;
  type: UserActionTypes.LOGIN_USER_SUCCESS;
  payload: {
    user: any; token: string; refreshToken: string; decodedToken: User 
};
}

interface RefreshTokenSuccessAction {
  type: UserActionTypes.REFRESH_TOKEN_SUCCESS;
  payload: { token: string };
}

interface LogoutUserAction {
  type: UserActionTypes.LOGOUT_USER;
}

interface ServerErrorAction {
  type: UserActionTypes.SERVER_ERROR;
  payload: string;
}

interface LoginUserErrorAction {
  type: UserActionTypes.LOGIN_USER_ERROR;
  payload: string;
}

export type UserActions =
  | StartRequestAction
  | LoginUserSuccessAction
  | LoginUserErrorAction
  | RefreshTokenSuccessAction
  | LogoutUserAction
  | FetchStudentsErrorAction
  | FetchStudentsSuccessAction
  | ServerErrorAction
  | AddStudentGroupSuccessAction
  | AddStudentGroupErrorAction
  | FinishRequestAction;
