FROM node:20-alpine 

RUN mkdir -p /app
WORKDIR /app

COPY backend/package*.json /app/
RUN npm ci

COPY backend/. /app

EXPOSE 8080
CMD [ "npm", "start" ]