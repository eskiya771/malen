# =====================================================================
#  Malen PWA - Docker Image
# ---------------------------------------------------------------------
#  Node/Express wie in der Mevidarts-Vorlage: statische PWA, Healthcheck
#  und Reverse-Proxy-freundliche Laufzeit-Konfiguration.
# =====================================================================
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        tini \
        wget \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3000 \
    BASE_PATH="" \
    PUBLIC_BASE_URL="https://malen.mtankurt.synology.me"

WORKDIR /app

COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev --no-fund --no-audit

COPY server ./server
COPY public ./public

EXPOSE 3000

WORKDIR /app/server
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "index.js"]
