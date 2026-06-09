import axios from 'axios';

const isServer = typeof window === 'undefined';

export const apiClient = axios.create({
  // No servidor, acessa a API direto. No navegador, usa o Proxy do Next.js para evitar CORS.
  baseURL: isServer ? 'https://apirestaurantes.onrender.com/api' : '/api/render',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tentar novamente (retry) automaticamente caso a API do Render esteja acordando (Cold Start)
// Ele captura erros 500 (retornados pelo Next proxy) ou erros de rede e tenta novamente até 3 vezes.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Se a config não existir, rejeita logo
    if (!config) return Promise.reject(error);
    
    // Inicializa contador de retry se não existir
    config.retryCount = config.retryCount || 0;

    // Retenta se for um erro do servidor (500+) ou erro de conexão, até 3 vezes
    if (config.retryCount < 3 && (error.response?.status >= 500 || error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      config.retryCount += 1;
      
      // Espera progressivamente: 1.5s, 3s, 4.5s
      const delay = config.retryCount * 1500;
      console.warn(`[API] Erro de conexão com o Render. Tentativa ${config.retryCount} de 3 em ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

