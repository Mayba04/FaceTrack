export interface User {
  id: string;
  fullName: string;
  email: string;
  emailConfirmed: boolean;
  lockoutEnd?: Date | null;
  lockoutEnabled: boolean;
  role: string;
}

export interface UserState {
  user: User | null; 
  users: User[]; 
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
  START_REQUEST = "START_REQUEST",
  LOGIN_USER_SUCCESS = "LOGIN_USER_SUCCESS",
  LOGIN_USER_ERROR = "LOGIN_USER_ERROR",
  LOGOUT_USER = "LOGOUT_USER",
  REFRESH_TOKEN_SUCCESS = "REFRESH_TOKEN_SUCCESS",
  REFRESH_TOKEN_ERROR = "REFRESH_TOKEN_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
}

interface StartRequestAction {
  type: UserActionTypes.START_REQUEST;
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
  | ServerErrorAction;
