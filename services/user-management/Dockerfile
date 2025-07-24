FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --force
COPY . .
COPY .env.production .env
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main"]