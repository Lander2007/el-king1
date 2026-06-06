import { Router, Response, Request } from 'express';
import { Product } from '../models/Product';

const router = Router();

/**
 * Get the site URL from environment variables or request origin
 * Priority: VITE_APP_URL > request origin > default
 */
const getSiteUrl = (req: Request): string => {
  // Use VITE_APP_URL if set (production environment)
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL;
  }

  // Fall back to request origin if available
  if (req.headers.origin) {
    return req.headers.origin;
  }

  // Last resort - use request host header (useful for same-server setup)
  const protocol = req.protocol || 'https';
  const host = req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
};

// GET /sitemap.xml
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).select('slug updatedAt');
    const siteUrl = getSiteUrl(req);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add home page
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add category/brand pages
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/samsung</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/iphone</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // Add product pages dynamically
    products.forEach((product) => {
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/product/${product.slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /robots.txt
router.get('/robots.txt', (req: Request, res: Response) => {
  const siteUrl = getSiteUrl(req);
  const content = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\nDisallow: /payment/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.status(200).send(content);
});

export default router;
