import { combineReducers } from "redux";
import UserReducer from "./UserReducer";
import GroupReducer from "./GroupReducer";


export const rootReducer = combineReducers({
    UserReducer,
    GroupReducer
})

export type RootState = ReturnType<typeof rootReducer>;