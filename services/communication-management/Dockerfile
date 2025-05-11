FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build
EXPOSE 4003
CMD ["node", "dist/main"]
