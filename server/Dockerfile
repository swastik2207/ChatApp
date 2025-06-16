FROM node:20

WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y build-essential python3 && npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]
