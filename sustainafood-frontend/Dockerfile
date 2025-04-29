# Étape 1 : Build de l'app
FROM node:20 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Étape 2 : Serveur Nginx pour servir le build
FROM nginx:alpine

# Copie du build dans Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Remplacement de la config nginx pour servir sur un sous-chemin si besoin
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]