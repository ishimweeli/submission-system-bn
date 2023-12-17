FROM node:18-bullseye

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm pkg delete scripts.postinstall

COPY prisma/ ./prisma

RUN npm install

RUN npm run prisma:generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
