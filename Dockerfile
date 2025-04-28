FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8001

EXPOSE 8001

CMD [ "npm", "start" ]