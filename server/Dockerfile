FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
