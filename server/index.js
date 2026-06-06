'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const pkg = require('./package.json');

const app = express();
const port = Number(process.env.PORT || 3000);
const basePath = normalizeBasePath(process.env.BASE_PATH || '');
const publicBaseUrl = normalizePublicBaseUrl(process.env.PUBLIC_BASE_URL || '');
const publicDir = path.resolve(__dirname, '..', 'public');
const indexPath = path.join(publicDir, 'index.html');

app.set('trust proxy', true);
app.disable('x-powered-by');

function normalizeBasePath(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === '/') return '';
  return `/${raw.replace(/^\/+|\/+$/g, '')}`;
}

function normalizePublicBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function withBase(route) {
  if (!basePath) return route;
  if (route === '/') return `${basePath}/`;
  return `${basePath}${route}`;
}

function baseHref() {
  return basePath ? `${basePath}/` : '/';
}

function renderIndex(req, res) {
  fs.readFile(indexPath, 'utf8', (error, html) => {
    if (error) {
      res.status(500).type('text/plain').send('index.html konnte nicht geladen werden');
      return;
    }

    res
      .type('html')
      .send(
        html
          .replace(/%BASE_HREF%/g, baseHref())
          .replace(/%MALEN_BASE%/g, basePath)
      );
  });
}

app.get(withBase('/status'), (req, res) => {
  res.json({
    ok: true,
    app: 'malen',
    version: pkg.version,
    basePath,
    publicBaseUrl,
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

if (basePath) {
  app.get(basePath, (req, res) => {
    res.redirect(301, `${basePath}/`);
  });
}

app.use((req, res, next) => {
  if (req.path.endsWith('/service-worker.js') || req.path.endsWith('/manifest.webmanifest')) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.get(withBase('/index.html'), renderIndex);

app.use(
  withBase('/'),
  express.static(publicDir, {
    index: false,
    maxAge: '7d',
    setHeaders(res, filePath) {
      if (filePath.endsWith('service-worker.js') || filePath.endsWith('manifest.webmanifest')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.get(withBase('/'), renderIndex);
app.get(withBase('/*'), renderIndex);

app.listen(port, () => {
  const publicUrl = publicBaseUrl || `http://localhost:${port}${basePath}`;
  console.log(`Malen PWA ${pkg.version} listening on ${publicUrl}`);
});
