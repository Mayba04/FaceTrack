import { UserState, UserActions, UserActionTypes } from "./types";

const initialState: UserState = {
    user: null,
    users: [],
    loggedInUser: null,
    token: null,
    refreshToken: null,
    role: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalCount: 0,
};

const UserReducer = (state = initialState, action: UserActions): UserState => {
    switch (action.type) {
        case UserActionTypes.USER_START_REQUEST :
            return { ...state, loading: true, error: null };
        case UserActionTypes.LOGIN_USER_SUCCESS:
            return {
                ...state,
                user: action.payload.user || null,
                loggedInUser: action.payload.user || null, 
                token: action.payload.token || null,
                refreshToken: action.payload.refreshToken || null,
                role: action.payload.user?.role || null,
                loading: false,
            };
        case UserActionTypes.FETCH_STUDENTS_SUCCESS:
            return {
                ...state,
                users: action.payload.users,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
                pageSize: action.payload.pageSize,
                totalCount: action.payload.totalCount,
                loading: false,
            };
        case UserActionTypes.LOGIN_USER_ERROR:
        case UserActionTypes.FETCH_STUDENTS_ERROR:
        case UserActionTypes.SERVER_ERROR:
            return { ...state, loading: false, error: action.payload };

        case UserActionTypes.FINISH_REQUEST:
            return { ...state, loading: false };

        case UserActionTypes.REFRESH_TOKEN_SUCCESS:
            return { ...state, token: action.payload.token };

        case UserActionTypes.LOGOUT_USER:
            return { ...initialState, loading: false };

        default:
            return state;
    }
};

export default UserReducer;
