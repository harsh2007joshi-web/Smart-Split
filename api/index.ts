import app from '../server/app';

export default function handler(req: any, res: any) {
  if (req.url === '/api' || req.url === '/api/' || req.url.startsWith('/api/index')) {
    if (req.originalUrl && req.originalUrl !== req.url) {
      req.url = req.originalUrl;
    }
  }
  return app(req, res);
}
