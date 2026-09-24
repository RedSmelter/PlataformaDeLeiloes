FROM node:24-alpine

RUN apk add --no-cache docker-cli docker-cli-compose

WORKDIR /opt/autoscaler

COPY src ./src

CMD ["node", "src/watcher.mjs"]