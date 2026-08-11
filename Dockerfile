FROM node:22-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server ./server

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
