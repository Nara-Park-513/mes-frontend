import axios from 'axios';

const API_BASE = 'http://localhost:8686/api' //스프링부트 서버주소

export const getProductionStatus = () => axios.get(`${API_BASE}/production`);
export const getWorkOrders = () => axios.get(`${API_BASE}/work-orders`);
export const getEquipmentStatus = () => axios.get(`${API_BASE}/equipment`);
export const getInventoryStatus = () => axios.get(`${API_BASE}/inventory`);