// URL de base de l'API backend.
// En développement : défini dans .env.local
// En production   : passé comme ARG lors du build Docker (VITE_API_URL)
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8181';
