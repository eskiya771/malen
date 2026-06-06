# Malen PWA

Installierbare PWA zum freien Zeichnen auf dem iPad. Der Aufbau orientiert sich an `mevidarts`: Node/Express-Server, Healthcheck, PWA-Caching und Reverse-Proxy-Konfiguration ueber Umgebungsvariablen.

## Start auf der Synology

```sh
docker compose up -d --build
```

Der Container veroeffentlicht die App auf Port `3003` und leitet intern auf den Express-Server-Port `3000`.

Reverse Proxy:

- Quelle: `https://malen.mtankurt.synology.me`
- Ziel: `http://<synology-ip>:3003`
- WebSocket ist nicht noetig

Die Compose-Datei setzt:

- `BASE_PATH=""` fuer Root-Betrieb direkt unter der Subdomain
- `PUBLIC_BASE_URL="https://malen.mtankurt.synology.me"`
- Healthcheck: `http://localhost:3000/status`

## iPad

Die App in Safari ueber `https://malen.mtankurt.synology.me` oeffnen und mit "Zum Home-Bildschirm" installieren. Das Manifest nutzt `display: fullscreen`.
