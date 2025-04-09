import { combineReducers } from "redux";
import UserReducer from "./UserReducer";
import GroupReducer from "./GroupReducer";
import SessionReducer from "./SessionReducer";
import { AttendanceReducer } from "./AttendanceReducer";


export const rootReducer = combineReducers({
    UserReducer,
    GroupReducer,
    SessionReducer,
    AttendanceReducer
})

export type RootState = ReturnType<typeof rootReducer>;