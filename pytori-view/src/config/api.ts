const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? '/api' 
  : ''

export const API_ENDPOINTS = {
  summary: `${API_BASE_URL}/summary`,
  repositorySummary: (repositoryName: string) => `${API_BASE_URL}/summary?repository_name=${repositoryName}`
} 