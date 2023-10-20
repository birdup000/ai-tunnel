FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i -g serve && npm ci --omit=dev
COPY . .
RUN npm run build --production
CMD serve -s build
