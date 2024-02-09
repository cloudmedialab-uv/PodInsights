FROM node:18-alpine

WORKDIR /app

COPY ./src /app

RUN npm install --production

EXPOSE 8080

CMD [ "node", "index.js" ]