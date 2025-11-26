FROM nginx:latest

COPY ./frontend/dist /usr/share/nginx/html/
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
