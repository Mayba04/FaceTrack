import axios from "axios";
import { APP_ENV } from "../env";

const instance = axios.create({
    baseURL: APP_ENV.BASE_URL + "/api",
    // Видаляємо встановлення Content-Type тут!
    // headers: {
    //   "Content-Type": "application/json",
    // },
});

// Інтерцептор для запитів
instance.interceptors.request.use(
    (config) => {
        console.log(`Request URL: ${config.baseURL}${config.url}`);
        console.log("Request Data:", config.data);
        console.log("Request Params:", config.params);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Інтерцептор для відповідей
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
