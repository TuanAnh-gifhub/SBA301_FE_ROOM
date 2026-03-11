FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_GOOGLE_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_ID=$VITE_GOOGLE_ID

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]