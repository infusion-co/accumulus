export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost' : 'https://kavok.fr';

export const API_NUAGE_PATH = process.env.NODE_ENV === 'development' ? ':8000' : '/nuage';

export const API_GATEWAY_PATH = process.env.NODE_ENV === 'development' ? ':4002/socket.io' : '/gw/socket.io';

export const API_SIMILARITY_PATH = process.env.NODE_ENV === 'development' ? ':5000' : '/similarity';

export const AIR_GUITAR_OFFSET = 30;
