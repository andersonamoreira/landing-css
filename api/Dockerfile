FROM node:20-alpine
WORKDIR /app

# Dependências
COPY api/package*.json ./
RUN npm install --production

# Código da API
COPY api/server.js .

# Arquivos estáticos do site (acessíveis via porta 8080)
COPY index.html ./static/
COPY css/       ./static/css/
COPY js/        ./static/js/
COPY imagens/   ./static/imagens/

EXPOSE 8080
CMD ["node", "server.js"]
