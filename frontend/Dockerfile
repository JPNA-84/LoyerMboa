FROM node:18-alpine AS build

WORKDIR /app
COPY package.json .
RUN npm install

COPY public/ ./public/
COPY src/ ./src/

# Build args for environment
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production: serve via nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
