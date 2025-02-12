import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { isTokenExpired, removeTokens } from "../services/api-instance";

// Функція для завантаження збереженого стану з localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem("state");
        if (serializedState === null) {
            return undefined;
        }

        const parsedState = JSON.parse(serializedState);
        const token = parsedState?.UserReducer?.token; 
        parsedState.UserReducer.loading = false;
        if (token && isTokenExpired(token)) {
            console.warn("Access token expired, logging out.");
            removeTokens();
            return undefined;
        }

        return parsedState;
    } catch (err) {
        console.error("Error loading state from localStorage", err);
        return undefined;
    }
};

// Завантаження збереженого стану
const preloadedState = loadState();

// Створення Redux Store
const store = configureStore({
    reducer: rootReducer,
    preloadedState,
});

// Функція для збереження стану у localStorage
store.subscribe(() => {
    try {
        const state = store.getState();
        localStorage.setItem("state", JSON.stringify(state));
    } catch (err) {
        console.error("Error saving state to localStorage", err);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
