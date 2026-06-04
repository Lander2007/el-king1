import { Product } from '../models/Product';
import { Settings } from '../models/Settings';
import { Order } from '../models/Order';

export function initChangeStreams(wsNamespace: any) {
  try {
    // 1. Product change stream
    const productStream = Product.watch([], { fullDocument: 'updateLookup' });
    productStream.on('change', (change) => {
      console.log('MongoDB Change Stream: Product collection change:', change.operationType);
      if (change.operationType === 'insert') {
        wsNamespace.emit('product:created', change.fullDocument);
      } else if (change.operationType === 'update' || change.operationType === 'replace') {
        wsNamespace.emit('product:updated', change.fullDocument);
      } else if (change.operationType === 'delete') {
        wsNamespace.emit('product:deleted', { id: change.documentKey._id });
      }
    });
    productStream.on('error', (err) => {
      console.warn('Product Change Stream error (falling back to direct route emissions):', err.message);
    });

    // 2. Settings change stream
    const settingsStream = Settings.watch([], { fullDocument: 'updateLookup' });
    settingsStream.on('change', (change) => {
      console.log('MongoDB Change Stream: Settings collection change:', change.operationType);
      if (change.operationType === 'update' || change.operationType === 'replace') {
        wsNamespace.emit('settings:updated', change.fullDocument);
      }
    });
    settingsStream.on('error', (err) => {
      console.warn('Settings Change Stream error:', err.message);
    });

    // 3. Order change stream
    const orderStream = Order.watch([], { fullDocument: 'updateLookup' });
    orderStream.on('change', (change) => {
      console.log('MongoDB Change Stream: Order collection change:', change.operationType);
      if (change.operationType === 'update' || change.operationType === 'replace') {
        wsNamespace.emit('order:updated', change.fullDocument);
      }
    });
    orderStream.on('error', (err) => {
      console.warn('Order Change Stream error:', err.message);
    });

    console.log('MongoDB Change Streams successfully registered.');
  } catch (error: any) {
    console.warn('Could not initialize MongoDB Change Streams (Replica Set required). Direct Socket.IO fallback active:', error.message);
  }
}
