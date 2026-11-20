FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY src ./src
USER node
ENTRYPOINT ["node", "src/index.mjs"]
