import { combineReducers } from "redux";
import UserReducer from "./UserReducer";
import GroupReducer from "./GroupReducer";
import SessionReducer from "./SessionReducer";


export const rootReducer = combineReducers({
    UserReducer,
    GroupReducer,
    SessionReducer
})

export type RootState = ReturnType<typeof rootReducer>;