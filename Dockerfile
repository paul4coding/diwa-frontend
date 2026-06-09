# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline || npm ci
COPY . .
# VITE_API_URL est passé depuis docker-compose (build arg)
ARG VITE_API_URL=http://localhost:8181
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build:docker

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Config pour React Router (SPA)
RUN printf "server { \n \
    listen 80; \n \
    location / { \n \
        root /usr/share/nginx/html; \n \
        index index.html index.htm; \n \
        try_files \$uri \$uri/ /index.html; \n \
    } \n \
}" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
