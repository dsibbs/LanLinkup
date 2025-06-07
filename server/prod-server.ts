import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Serve static files (frontend)
  const clientPath = path.join(__dirname, 'client'); // adjust if your build path is different
  app.use(express.static(clientPath));

  // Handle client-side routing (SPA)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    throw err;
  });

  const port = Number(process.env.PORT) || 5000;
  const host = '0.0.0.0';

  server.listen({ port, host }, () => {
  });
})();
