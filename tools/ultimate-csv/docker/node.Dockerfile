FROM node:20.11.1-alpine
WORKDIR /app
COPY node/package.json node/tsconfig.json ./node/
COPY common ./common
COPY node/src ./node/src
RUN corepack enable && pnpm -v || npm i -g pnpm@9.12.1 \
  && cd node && pnpm i --frozen-lockfile=false && pnpm run build
EXPOSE 3001
CMD ["node", "node/dist/src/http.js"]


