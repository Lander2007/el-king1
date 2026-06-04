import { Router, Response } from 'express';
import { Product } from '../models/Product';
import { adminMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/products (filters, search, pagination)
router.get('/', async (req: any, res: Response) => {
  const { q, category, brand, model, limit = 20, page = 1, isActive } = req.query;

  try {
    const queryObj: any = {};

    // Filter by active status
    if (isActive !== undefined) {
      queryObj.isActive = isActive === 'true';
    } else {
      queryObj.isActive = true; // by default, return active only
    }

    if (category) {
      queryObj.category = category;
    }

    if (brand) {
      queryObj.brand = { $regex: new RegExp(brand as string, 'i') };
    }

    if (model) {
      queryObj.model = model;
    }

    if (q) {
      // Text search or partial regex search on name/model
      queryObj.$or = [
        { 'name.en': { $regex: new RegExp(q as string, 'i') } },
        { 'name.ar': { $regex: new RegExp(q as string, 'i') } },
        { model: { $regex: new RegExp(q as string, 'i') } },
        { brand: { $regex: new RegExp(q as string, 'i') } },
      ];
    }

    const total = await Product.countDocuments(queryObj);
    const products = await Product.find(queryObj)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/category/:cat (by category/brand)
router.get('/category/:cat', async (req: any, res: Response) => {
  try {
    const products = await Product.find({
      category: req.params.cat,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:slug (single by slug)
router.get('/:slug', async (req: any, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products (admin only)
router.post('/', adminMiddleware, async (req: any, res: Response) => {
  try {
    const product = await Product.create(req.body);

    // Socket.io sync
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('product:created', product);
    }

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id (admin only)
router.put('/:id', adminMiddleware, async (req: any, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Socket.io sync
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('product:updated', product);
      if (product.stock < 10) {
        wsNamespace.emit('inventory:low', { productId: product._id, stock: product.stock, name: product.name });
      }
    }

    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id (admin only - soft delete)
router.delete('/:id', adminMiddleware, async (req: any, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Socket.io sync
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('product:deleted', { id: product._id });
    }

    res.json({ message: 'Product deactivated successfully', product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
