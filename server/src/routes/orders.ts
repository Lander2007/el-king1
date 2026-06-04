import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Settings } from '../models/Settings';
import { adminMiddleware, AuthRequest } from '../middleware/auth';
import { serverOrderSchema } from '../lib/validations/order';

const router = Router();

// POST /api/orders (Place order)
router.post('/orders', async (req: any, res: Response) => {
  // Validate request body using Zod
  const validation = serverOrderSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.error.format(),
    });
  }

  const { customer, items, paymentMethod, notes, country } = validation.data;

  try {
    let calculatedSubtotal = 0;
    const validatedItems = [];

    // 1. Validate stock and pricing from DB
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name.en || product.name.ar}`,
        });
      }

      // Determine price for country
      const priceKey = country as keyof typeof product.pricing;
      const dbPrice = product.pricing[priceKey] !== undefined ? product.pricing[priceKey] : product.pricing.default;
      calculatedSubtotal += dbPrice * item.quantity;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: dbPrice,
        currency: item.currency,
      });
    }

    // 2. Determine shipping rate from DB settings or fall back to defaults
    const settingsObj = await Settings.findOne();
    const shippingRates = settingsObj?.shippingRates;
    let shippingCost = country === 'EG' ? 50 : country === 'SA' ? 20 : country === 'AE' ? 15 : 10;
    if (shippingRates) {
      const rate = shippingRates.get(country);
      if (rate !== undefined && rate !== null) {
        shippingCost = rate;
      }
    }

    // Deduct discount if applicable (we can implement promo code verification here if desired)
    // For now we accept subtotal minus discount or the direct calculations
    const finalTotal = calculatedSubtotal + shippingCost;

    // 3. Deduct stock and emit inventory updates
    const wsNamespace = req.app.get('wsNamespace');
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();

        if (wsNamespace) {
          wsNamespace.emit('product:updated', product);
          if (product.stock < 10) {
            wsNamespace.emit('inventory:low', {
              productId: product._id,
              stock: product.stock,
              name: product.name,
            });
          }
        }
      }
    }

    // 4. Generate order number (WD-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Order.countDocuments();
    const orderNumber = `WD-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // 5. Create order
    const order = await Order.create({
      orderNumber,
      customer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shipping: shippingCost,
      total: finalTotal,
      currency: country,
      country,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      notes,
    });

    if (wsNamespace) {
      wsNamespace.emit('order:created', order);
    }

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/orders/:id (Get single order status)
router.get('/orders/:id', async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/orders (Admin list all)
router.get('/admin/orders', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/orders/:id (Admin update status)
router.put('/admin/orders/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // Socket.io sync to notify customer of order status updates
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('order:updated', order);
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
