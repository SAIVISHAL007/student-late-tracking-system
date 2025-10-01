import axios from "axios";

const API = axios.create({ 
  baseURL: process.env.NODE_ENV === 'production' 
    ? "/api"  // Railway serves frontend and backend from same domain
    : "http://localhost:5000/api"
});

export default API;
