# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# enable pnpm
RUN corepack enable

# copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# copy project
COPY . .

# build vite app
RUN pnpm build


# ---------- Production stage ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]