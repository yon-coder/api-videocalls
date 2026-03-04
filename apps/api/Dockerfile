FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # Se estiver usando TS, senão apenas aponte para o index.js
EXPOSE 3000
CMD ["node", "dist/index.js"]