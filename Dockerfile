FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Копируем сертификаты (p12) внутрь контейнера
COPY certs ./certs

# Копируем остальной код
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
