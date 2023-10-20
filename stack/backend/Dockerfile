FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i fastify @fastify/cors axios
COPY . .
CMD ["node","."]
