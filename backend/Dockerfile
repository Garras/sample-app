FROM node:20-alpine 

RUN mkdir -p /app
WORKDIR /app

COPY package*.json /app/
RUN npm ci

COPY . /app

EXPOSE 8080
CMD [ "npm", "start" ]