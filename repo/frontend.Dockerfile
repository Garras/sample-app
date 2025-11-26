FROM node:20-alpine as build

COPY frontend/. /app

# RUN npm run $FRONTEND_NPM_BUILD_SCRIPT

FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
