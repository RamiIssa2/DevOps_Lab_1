import axios from 'axios';

const hostname = window.location.hostname;
const API = axios.create({
  baseURL: `http://${hostname}:5000`, // use VM's IP
});

export default API;