FROM node:16

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm rebuild bcrypt --build-from-source

CMD ["npm", "run", "dev"]

EXPOSE 3060