export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost' : 'http://51.158.71.201';

export const API_NUAGE_PATH = process.env.NODE_ENV === 'development' ? ':8000' : '/nuage';

export const API_GATEWAY_PATH = process.env.NODE_ENV === 'development' ? ':4002' : '/gw';

export const API_SIMILARITY_PATH = process.env.NODE_ENV === 'development' ? ':5000' : '/similarity';

export const AIR_GUITAR_OFFSET = 30;

export const GATEWAY_SOCKET_PATH = '/socket.io';
