FROM node:18 AS build
WORKDIR /src
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build
FROM nginx:latest AS production
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
