const ENV_MODE = import.meta.env['VITE_IS_MODE'];

const envVar = (name: string) => import.meta.env[`VITE_${name}_${ENV_MODE}`];

export const VITE_BASE_URL = envVar('BASE_URL');
export const VITE_API_URL = envVar('API_URL');
export const VITE_IMAGE_URL = envVar('IMAGE_URL');
