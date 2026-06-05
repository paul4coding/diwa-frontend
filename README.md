# DIWA Frontend — React + TypeScript + Vite

Interface web de la plateforme DIWA Internationale.

---

## Stack

| Technologie | Version |
|---|---|
| React | 19.2.4 |
| TypeScript | ~6.0.2 |
| Vite | 8.0.8 |
| TanStack Query | v5 |
| Port dev | 5173 |

---

## Démarrage en développement

```bash
git clone https://github.com/paul4coding/diwa-frontend.git
cd diwa-frontend

# Copier la config locale
cp .env.example .env.local

npm install
npm run dev
# → http://localhost:5173
```

Le fichier `.env.local` contient :

```env
VITE_API_URL=http://localhost:8181
```

Modifier `VITE_API_URL` si le backend tourne sur une autre adresse.

---

## Build production

```bash
npm run build
# Résultat dans le dossier dist/
```

> `VITE_API_URL` est intégré **au moment du build**. Il faut le définir avant de lancer `npm run build`.

```bash
VITE_API_URL=https://api.votre-domaine.com npm run build
```

---

## Déploiement Docker

Le Dockerfile utilise un build multi-étapes (Node → Nginx Alpine).

```bash
docker build \
  --build-arg VITE_API_URL=https://api.votre-domaine.com \
  -t diwa-frontend .

docker run -p 80:80 diwa-frontend
```

En pratique, utiliser `docker-compose` depuis le dossier parent (voir README du backend).

---

## Variables d'environnement

| Variable | Défaut (dev) | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8181` | URL de base du backend (sans slash final) |

---

## Structure des pages

| Page | Rôle |
|---|---|
| `/` | Accueil + catalogue véhicules |
| `/login` | Authentification |
| `/mon-espace` | Espace client (demandes, factures) |
| `/receptionniste` | Dashboard réceptionniste |
| `/technicien` | Dashboard technicien |
| `/admin/*` | Administration (véhicules, pièces, SAV) |
