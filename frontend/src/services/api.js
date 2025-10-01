import axios from "axios";

const API = axios.create({ 
  baseURL: process.env.NODE_ENV === 'production' 
    ? "/api"
    : "http://localhost:5000/api"
});

export default API;
