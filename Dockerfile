FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json ./
RUN pnpm i

COPY . ./
RUN pnpm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/.output/ ./built/

ENV PORT 80
ENV HOST 0.0.0.0

EXPOSE 80

CMD ["node", "/app/built/server/index.mjs"]