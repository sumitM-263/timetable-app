import axios from "axios";

const API = axios.create({
  baseURL: "https://timetable-app-h2pg.onrender.com/"
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

// Handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default API;