const fs = require('fs');
const path = require('path');
const os = require('os');

const sourceDataDir = path.resolve(__dirname, '../../data');
const sourceDbFilePath = path.join(sourceDataDir, 'db.json');
const tmpDbFilePath = path.join(os.tmpdir(), 'mahalaxmi_db.json');

function resolveDbFilePath() {
  if (process.env.VERCEL) {
    return tmpDbFilePath;
  }
  try {
    if (!fs.existsSync(sourceDataDir)) {
      fs.mkdirSync(sourceDataDir, { recursive: true });
    }
    fs.accessSync(sourceDataDir, fs.constants.W_OK);
    return sourceDbFilePath;
  } catch (err) {
    return tmpDbFilePath;
  }
}

const dbFilePath = resolveDbFilePath();

const defaultAdminHash = '$2a$10$NJvZG2YOEzFe/EHfiWgfR.A0nG7IaONF1FO1h4V4VkdlRpHaxOAv6'; // Admin@123

function getInitialData() {
  return {
    users: [
      {
        id: 1,
        full_name: 'Manoharsingh P. Rathore (Proprietor)',
        email: 'manohar@mahalaxminovelties.com',
        phone: '9481242188',
        password_hash: defaultAdminHash,
        role: 'admin',
        account_type: 'wholesale',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    customer_profiles: [],
    addresses: [],
    categories: [
      {
        id: 1,
        name_en: 'Matte & C.Z. Jewellery',
        name_kn: 'ಮ್ಯಾಟ್ & ಸಿ.ಝಡ್. ಜ್ಯುವೆಲ್ಲರಿ',
        slug: 'matte-cz-jewellery',
        description_en: 'Premium matte finish and sparkling cubic zirconia bridal sets, choker sets, and temple jewellery.',
        description_kn: 'ಪ್ರೀಮಿಯಂ ಮ್ಯಾಟ್ ಫಿನಿಶ್ ಮತ್ತು ಆಕರ್ಷಕ ಸಿ.ಝಡ್. ಬ್ರೈಡಲ್ ಸೆಟ್‌ಗಳು, ಚೋಕರ್‌ಗಳು ಮತ್ತು ದೇವಸ್ಥಾನ ಶೈಲಿಯ ಆಭರಣಗಳು.',
        display_order: 1,
        is_active: true
      },
      {
        id: 2,
        name_en: 'Patli Bangles',
        name_kn: 'ಪಟ್ಲಿ ಬಳೆಗಳು',
        slug: 'patli-bangles',
        description_en: 'Traditional and contemporary micro-plated patli bangles, kadas, and daily-wear bangles.',
        description_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮತ್ತು ಆಧುನಿಕ ಮೈಕ್ರೋ-ಪ್ಲೇಟೆಡ್ ಪಟ್ಲಿ ಬಳೆಗಳು, ಕಡಾಗಳು ಹಾಗೂ ನಿತ್ಯೋಪಯೋಗಿ ಬಳೆಗಳು.',
        display_order: 2,
        is_active: true
      },
      {
        id: 3,
        name_en: 'Necklaces',
        name_kn: 'ಹಾರಗಳು / ನೆಕ್ಲೇಸ್',
        slug: 'necklaces',
        description_en: 'Exquisite long harams, short necklaces, and ethnic designer necklace sets.',
        description_kn: 'ಭವ್ಯವಾದ ಉದ್ದನೆಯ ಹಾರಗಳು, ಸಣ್ಣ ನೆಕ್ಲೇಸ್‌ಗಳು ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕ ಡಿಸೈನರ್ ಹಾರಗಳು.',
        display_order: 3,
        is_active: true
      },
      {
        id: 4,
        name_en: 'Roldgold & Guarantee Chains',
        name_kn: 'ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ & ಗ್ಯಾರಂಟಿ ಚೈನ್‌ಗಳು',
        slug: 'roldgold-guarantee-chains',
        description_en: '1-year guarantee roldgold chains, thali chains, dokiya, and daily wear rope chains.',
        description_kn: '1-ವರ್ಷದ ಗ್ಯಾರಂಟಿ ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ ಚೈನ್‌ಗಳು, ತಾಳಿ ಚೈನ್‌ಗಳು, ಡೋಕಿಯಾ ಮತ್ತು ಹಗ್ಗದ ಮಾದರಿಯ ಸರಗಳು.',
        display_order: 4,
        is_active: true
      },
      {
        id: 5,
        name_en: 'Agra Payal',
        name_kn: 'ಆಗ್ರಾ ಕಾಲುಂಗುರ / ಪಾಯಲ್',
        slug: 'agra-payal',
        description_en: 'Genuine Agra silver-plated anklets, traditional ghungroo payals, and bridal foot jewellery.',
        description_kn: 'ಅಸಲಿ ಆಗ್ರಾ ಸಿಲ್ವರ್ ಕೋಟೆಡ್ ಕಾಲುಂಗುರಗಳು, ಗಂಟಿನ ಪಾಯಲ್‌ಗಳು ಮತ್ತು ವಧುವಿನ ಕಾಲು ಆಭರಣಗಳು.',
        display_order: 5,
        is_active: true
      },
      {
        id: 6,
        name_en: 'Finger Rings & Lockets',
        name_kn: 'ಉಂಗುರಗಳು & ಲಾಕೆಟ್‌ಗಳು',
        slug: 'finger-rings-lockets',
        description_en: 'Adjustable CZ finger rings, deity pendants, and designer daily wear lockets.',
        description_kn: 'ಹೊಂದಾಣಿಕೆ ಮಾಡಬಹುದಾದ ಸಿ.ಝಡ್. ಉಂಗುರಗಳು, ದೇವರ ಪೆಂಡೆಂಟ್‌ಗಳು ಮತ್ತು ಆಕರ್ಷಕ ಲಾಕೆಟ್‌ಗಳು.',
        display_order: 6,
        is_active: true
      }
    ],
    products: [],
    product_images: [],
    product_variants: [],
    inventory: [],
    inventory_transactions: [],
    carts: [],
    cart_items: [],
    orders: [],
    order_items: [],
    payments: [],
    deliveries: [],
    returns: [],
    delivery_pincodes: [
      { id: 1, pin_code: '585101', locality_name: 'Sangam Talkies / S.B. Temple Road / Market', delivery_fee: 30.00, min_order_amount: 200.00, estimated_delivery_hours: 12, is_active: true },
      { id: 2, pin_code: '585102', locality_name: 'Station Road / Nehru Gunj / Kirana Bazaar', delivery_fee: 40.00, min_order_amount: 300.00, estimated_delivery_hours: 24, is_active: true },
      { id: 3, pin_code: '585103', locality_name: 'MSK Mill / Ring Road / Aland Road', delivery_fee: 40.00, min_order_amount: 300.00, estimated_delivery_hours: 24, is_active: true },
      { id: 4, pin_code: '585104', locality_name: 'Jewargi Colony / Sedam Road / High Court Area', delivery_fee: 50.00, min_order_amount: 400.00, estimated_delivery_hours: 24, is_active: true },
      { id: 5, pin_code: '585105', locality_name: 'Shahabazar / Fort / Gazipur', delivery_fee: 40.00, min_order_amount: 300.00, estimated_delivery_hours: 24, is_active: true }
    ],
    business_settings: [
      { setting_key: 'store_name_en', setting_value: 'Mahalaxmi Novelties' },
      { setting_key: 'store_name_kn', setting_value: 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್' },
      { setting_key: 'store_proprietor', setting_value: 'Manoharsingh P. Rathore' },
      { setting_key: 'store_address', setting_value: 'Shop No. 8-713/13, Ground Floor, Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101' },
      { setting_key: 'store_tagline_en', setting_value: 'Wholesale Dealers — No Sales Representative' },
      { setting_key: 'store_phone', setting_value: '9481242188' },
      { setting_key: 'store_whatsapp', setting_value: '9880042188' },
      { setting_key: 'store_email', setting_value: 'contact@mahalaxminovelties.com' },
      { setting_key: 'upi_id', setting_value: '9481242188@okbizaxis' },
      { setting_key: 'upi_name', setting_value: 'Mahalaxmi Novelties' },
      { setting_key: 'upi_qr_image', setting_value: '/uploads/default-upi-qr.svg' },
      { setting_key: 'default_delivery_fee', setting_value: '40.00' },
      { setting_key: 'free_delivery_threshold', setting_value: '1500.00' },
      { setting_key: 'wholesale_min_order_total', setting_value: '2500.00' }
    ],
    notifications: []
  };
}

let memoryDb = null;

function normalizeDb(db) {
  db.users = db.users || [];
  db.customer_profiles = db.customer_profiles || [];
  db.addresses = db.addresses || [];
  db.categories = db.categories || [];
  db.products = (db.products || []).map(p => ({
    ...p,
    moq: p.moq || p.min_order_qty || 1,
    min_order_qty: p.moq || p.min_order_qty || 1,
    is_active: p.is_active !== false && p.is_active !== 0
  }));
  db.product_images = db.product_images || [];
  db.product_variants = db.product_variants || [];
  db.inventory = db.inventory || [];
  db.inventory_transactions = db.inventory_transactions || [];
  db.carts = db.carts || [];
  db.cart_items = db.cart_items || [];
  db.orders = db.orders || [];
  db.order_items = db.order_items || [];
  db.payments = db.payments || [];
  db.deliveries = db.deliveries || [];
  db.returns = db.returns || [];
  db.delivery_pincodes = db.delivery_pincodes || [];
  db.business_settings = db.business_settings || [];
  db.notifications = db.notifications || [];
  return db;
}

function loadDb() {
  if (memoryDb) return memoryDb;

  const candidatePaths = dbFilePath === sourceDbFilePath
    ? [sourceDbFilePath]
    : [dbFilePath, sourceDbFilePath];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        memoryDb = normalizeDb(JSON.parse(data));
        if (filePath !== dbFilePath) saveDb();
        return memoryDb;
      } catch (e) {
        console.warn(`Could not parse ${filePath}:`, e.message);
      }
    }
  }

  memoryDb = normalizeDb(getInitialData());
  saveDb();
  return memoryDb;
}

function saveDb() {
  if (!memoryDb) return;
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (e) {
    console.warn('Embedded DB persistence warning:', e.message);
  }
}

function nextId(collection) {
  if (!collection || collection.length === 0) return 1;
  return Math.max(...collection.map(item => Number(item.id) || 0)) + 1;
}

function getPrimaryImage(db, product) {
  if (!product) return null;
  const imgs = (db.product_images || [])
    .filter(im => im.product_id === product.id)
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
  return imgs[0]?.image_url || product.primary_image || null;
}

function enrichProduct(db, p) {
  const cat = db.categories.find(c => c.id === p.category_id);
  const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
  const available = inv.physical_stock - inv.reserved_stock;
  const imgs = (db.product_images || [])
    .filter(im => im.product_id === p.id)
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
  const primaryImg = imgs[0]?.image_url || p.primary_image || '/assets/products/kada-1250.jpg';
  const craftImg = p.craft_image || imgs[1]?.image_url || null;

  return {
    ...p,
    moq: p.moq || p.min_order_qty || 1,
    category_name_en: cat?.name_en || '',
    category_name_kn: cat?.name_kn || '',
    category_slug: cat?.slug || '',
    primary_image: primaryImg,
    craft_image: craftImg,
    physical_stock: inv.physical_stock,
    reserved_stock: inv.reserved_stock,
    available_stock: available,
    low_stock_threshold: inv.low_stock_threshold,
    stock_status: available <= 0 ? 'out_of_stock' : (available <= inv.low_stock_threshold ? 'low_stock' : 'in_stock')
  };
}

function resolveVerificationStatus(user, cp) {
  if (user.role === 'admin') return 'approved';
  if (user.account_type === 'wholesale') {
    return cp?.verification_status || 'pending';
  }
  return cp?.verification_status || null;
}

/**
 * Embedded SQL query parser & executor
 * Matches mysql2/promise return types:
 * - SELECT: Array of row objects
 * - INSERT / UPDATE / DELETE: { insertId, affectedRows } object
 */
function executeQuery(sql, params = []) {
  const db = loadDb();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const lowerSql = cleanSql.toLowerCase();

  // ==================== 1. SELECT QUERIES ====================
  if (lowerSql.startsWith('select')) {
    // 1.1 Business Settings
    if (lowerSql.includes('from business_settings')) {
      if (lowerSql.includes('where setting_key =')) {
        const key = params[0] || (cleanSql.match(/setting_key\s*=\s*'([^']+)'/i) || [])[1];
        const item = db.business_settings.find(s => s.setting_key === key);
        return item ? [item] : [];
      }
      return db.business_settings;
    }

    // 1.2 Delivery PIN Codes
    if (lowerSql.includes('from delivery_pincodes')) {
      if (lowerSql.includes('where pin_code =')) {
        const pin = String(params[0] || '').trim();
        return db.delivery_pincodes.filter(p => p.pin_code === pin && p.is_active !== false);
      }
      return [...db.delivery_pincodes].sort((a, b) => a.pin_code.localeCompare(b.pin_code));
    }

    // 1.3 Dashboard Aggregated KPIs & Charts
    if (lowerSql.includes('as total_sales')) {
      const paidOrders = db.orders.filter(o => o.payment_status === 'paid');
      const sum = paidOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
      return [{ total_sales: sum }];
    }
    if (lowerSql.includes('as orders_today')) {
      const today = new Date().toISOString().slice(0, 10);
      const cnt = db.orders.filter(o => o.created_at && o.created_at.startsWith(today)).length;
      return [{ orders_today: cnt }];
    }
    if (lowerSql.includes('as low_stock_items')) {
      let cnt = 0;
      for (const p of db.products) {
        if (!p.is_active) continue;
        const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        if ((inv.physical_stock - inv.reserved_stock) <= inv.low_stock_threshold) {
          cnt++;
        }
      }
      return [{ low_stock_items: cnt }];
    }
    if (lowerSql.includes('as total_customers')) {
      const cnt = db.users.filter(u => u.role === 'customer').length;
      return [{ total_customers: cnt }];
    }
    if (lowerSql.includes('as in_stock') && lowerSql.includes('as out_of_stock')) {
      let inStock = 0, lowStock = 0, outOfStock = 0;
      const activeProds = db.products.filter(p => p.is_active);
      for (const p of activeProds) {
        const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const available = inv.physical_stock - inv.reserved_stock;
        if (available <= 0) outOfStock++;
        else if (available <= inv.low_stock_threshold) lowStock++;
        else inStock++;
      }
      return [{
        in_stock: inStock,
        low_stock: lowStock,
        out_of_stock: outOfStock,
        total_products: activeProds.length,
        total_items: activeProds.length
      }];
    }
    if (lowerSql.includes('as on_delivery') && lowerSql.includes('as delivered')) {
      const orders = db.orders;
      return [{
        delivered: orders.filter(o => o.order_status === 'delivered').length,
        on_delivery: orders.filter(o => ['out_for_delivery', 'processing', 'confirmed'].includes(o.order_status)).length,
        returned: orders.filter(o => o.order_status === 'return_requested').length,
        canceled: orders.filter(o => o.order_status === 'cancelled').length
      }];
    }
    if (lowerSql.includes('as retail_count') && lowerSql.includes('as wholesale_count')) {
      const customers = db.users.filter(u => u.role === 'customer');
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return [{
        retail_count: customers.filter(u => u.account_type === 'retail').length,
        wholesale_count: customers.filter(u => u.account_type === 'wholesale').length,
        new_signups: customers.filter(u => !u.created_at || new Date(u.created_at).getTime() >= cutoff).length
      }];
    }
    if (lowerSql.includes('interval 6 month') || lowerSql.includes('%b %y')) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const result = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const period = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const paidOrders = db.orders.filter(o => o.payment_status === 'paid' && o.created_at && o.created_at.startsWith(sortKey));
        if (paidOrders.length > 0) {
          const sales = paidOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
          result.push({ period, sort_key: sortKey, sales, order_count: paidOrders.length });
        }
      }
      return result;
    }
    if (lowerSql.includes('interval 7 day') || lowerSql.includes('%d %b')) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const period = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
        const paidOrders = db.orders.filter(o => o.payment_status === 'paid' && o.created_at && o.created_at.startsWith(dateStr));
        if (paidOrders.length > 0) {
          const sales = paidOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
          result.push({ period, sort_key: dateStr, sales, order_count: paidOrders.length });
        }
      }
      return result;
    }
    if (lowerSql.includes('order by total_revenue desc') || lowerSql.includes('total_quantity_sold')) {
      // Strictly real paid sales aggregation (Zero Mock Data)
      const paidOrderIds = new Set(db.orders.filter(o => o.payment_status === 'paid').map(o => o.id));
      const agg = new Map();
      for (const oi of db.order_items) {
        if (!paidOrderIds.has(oi.order_id)) continue;
        const curr = agg.get(oi.product_id) || { qty: 0, rev: 0 };
        curr.qty += parseInt(oi.quantity, 10) || 0;
        curr.rev += parseFloat(oi.subtotal) || 0;
        agg.set(oi.product_id, curr);
      }
      const list = [];
      for (const [productId, stats] of agg.entries()) {
        const p = db.products.find(pr => pr.id === productId);
        if (!p) continue;
        list.push({
          id: p.id,
          sku: p.sku,
          name_en: p.name_en,
          name_kn: p.name_kn,
          total_quantity_sold: stats.qty,
          total_revenue: stats.rev,
          thumbnail: getPrimaryImage(db, p)
        });
      }
      return list.sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
    }
    if (lowerSql.includes('limit 6') && lowerSql.includes('order by o.created_at desc')) {
      const ords = [...db.orders]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 6);
      return ords.map(o => {
        const u = db.users.find(usr => usr.id === o.user_id);
        return {
          id: o.id,
          order_number: o.order_number,
          order_type: o.order_type,
          order_status: o.order_status,
          payment_status: o.payment_status,
          payment_method: o.payment_method,
          total_amount: o.total_amount,
          created_at: o.created_at,
          customer_name: u?.full_name || 'Customer',
          customer_phone: u?.phone || ''
        };
      });
    }
    if (lowerSql.includes('group by c.id') && lowerSql.includes('from categories c') && lowerSql.includes('sales_amount')) {
      const paidOrderIds = new Set(db.orders.filter(o => o.payment_status === 'paid').map(o => o.id));
      return [...db.categories]
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(c => {
          const prods = db.products.filter(p => p.category_id === c.id && p.is_active);
          const prodIds = new Set(prods.map(p => p.id));
          const sales = db.order_items
            .filter(oi => prodIds.has(oi.product_id) && paidOrderIds.has(oi.order_id))
            .reduce((sum, oi) => sum + (parseFloat(oi.subtotal) || 0), 0);
          return {
            id: c.id,
            name_en: c.name_en,
            name_kn: c.name_kn,
            product_count: prods.length,
            sales_amount: sales
          };
        });
    }

    // 1.4 Categories
    if (lowerSql.includes('from categories')) {
      if (lowerSql.includes('where (slug = ?') || lowerSql.includes('where slug =')) {
        const slugOrId = params[0];
        const numId = params[1];
        return db.categories.filter(
          c => c.is_active !== false && (c.slug === slugOrId || (numId && c.id === Number(numId)))
        );
      }
      return db.categories
        .filter(c => c.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id)
        .map(c => ({
          ...c,
          product_count: db.products.filter(p => p.category_id === c.id && p.is_active).length
        }));
    }

    // 1.5 Users
    if (lowerSql.includes('from users')) {
      if (lowerSql.includes('where u.id = ?') || lowerSql.includes('where id = ?')) {
        const id = Number(params[0]);
        const requireActive = lowerSql.includes('is_active = true');
        const u = db.users.find(x => Number(x.id) === id && (!requireActive || x.is_active !== false));
        if (!u) return [];
        const cp = db.customer_profiles.find(p => Number(p.user_id) === u.id);
        return [{
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          account_type: u.account_type,
          is_active: u.is_active,
          shop_name: cp?.shop_name || null,
          gst_number: cp?.gst_number || null,
          verification_status: resolveVerificationStatus(u, cp)
        }];
      }
      if (lowerSql.includes('where u.email = ?') || lowerSql.includes('where email = ?')) {
        const email = String(params[0] || '').trim().toLowerCase();
        const u = db.users.find(x => x.email.toLowerCase() === email) ||
          (email === 'admin@mahalaxminovelties.com' ? db.users.find(x => x.role === 'admin' && x.id === 1) : null);
        if (!u) return [];
        const cp = db.customer_profiles.find(p => Number(p.user_id) === u.id);
        return [{
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          password_hash: u.password_hash,
          role: u.role,
          account_type: u.account_type,
          is_active: u.is_active,
          shop_name: cp?.shop_name || null,
          gst_number: cp?.gst_number || null,
          verification_status: resolveVerificationStatus(u, cp)
        }];
      }
      if (lowerSql.includes("where u.role = 'customer'") || lowerSql.includes("where role = 'customer'")) {
        let custs = db.users.filter(u => u.role === 'customer').map(c => {
          const cp = db.customer_profiles.find(p => Number(p.user_id) === c.id);
          const userOrders = db.orders.filter(o => Number(o.user_id) === c.id);
          const totalSpent = userOrders
            .filter(o => o.payment_status === 'paid')
            .reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
          return {
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            phone: c.phone,
            role: c.role,
            account_type: c.account_type,
            is_active: c.is_active,
            created_at: c.created_at,
            shop_name: cp?.shop_name || null,
            gst_number: cp?.gst_number || null,
            verification_status: resolveVerificationStatus(c, cp),
            admin_notes: cp?.admin_notes || null,
            verified_at: cp?.verified_at || null,
            total_orders: userOrders.length,
            total_spent: totalSpent
          };
        });

        let pIdx = 0;
        if (lowerSql.includes('and u.account_type = ?')) {
          const acct = params[pIdx++];
          custs = custs.filter(c => c.account_type === acct);
        }
        if (lowerSql.includes('and cp.verification_status = ?')) {
          const vstat = params[pIdx++];
          custs = custs.filter(c => c.verification_status === vstat);
        }
        if (lowerSql.includes('like ?')) {
          const term = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
          custs = custs.filter(c =>
            (c.full_name && c.full_name.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.phone && c.phone.toLowerCase().includes(term)) ||
            (c.shop_name && c.shop_name.toLowerCase().includes(term))
          );
        }
        return custs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }
      if (lowerSql.includes("role = 'admin'")) {
        const requireActive = lowerSql.includes('is_active = true');
        return db.users
          .filter(u => u.role === 'admin' && (!requireActive || u.is_active !== false))
          .sort((a, b) => a.id - b.id);
      }
      return db.users;
    }

    // 1.6 Inventory Status (must precede generic FROM products check)
    if (lowerSql.includes('p.id as product_id') && lowerSql.includes('i.last_restocked_at') && lowerSql.includes('from products p')) {
      let rows = db.products.filter(p => p.is_active).map(p => {
        const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const cat = db.categories.find(c => c.id === p.category_id);
        const available = inv.physical_stock - inv.reserved_stock;
        return {
          product_id: p.id,
          category_id: p.category_id,
          sku: p.sku,
          name_en: p.name_en,
          name_kn: p.name_kn,
          retail_price: p.retail_price,
          wholesale_price: p.wholesale_price,
          category_name: cat?.name_en || '',
          physical_stock: inv.physical_stock,
          reserved_stock: inv.reserved_stock,
          available_stock: available,
          low_stock_threshold: inv.low_stock_threshold,
          last_restocked_at: inv.last_restocked_at || null,
          updated_at: inv.updated_at || null,
          stock_status: available <= 0 ? 'out_of_stock' : (available <= inv.low_stock_threshold ? 'low_stock' : 'in_stock'),
          primary_image: getPrimaryImage(db, p)
        };
      });

      let pIdx = 0;
      if (lowerSql.includes('and p.category_id = ?')) {
        const catId = Number(params[pIdx++]);
        rows = rows.filter(r => r.category_id === catId);
      }
      if (lowerSql.includes('like ?')) {
        const term = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        rows = rows.filter(r =>
          (r.name_en && r.name_en.toLowerCase().includes(term)) ||
          (r.sku && r.sku.toLowerCase().includes(term))
        );
      }
      if (lowerSql.includes('<= 0') && !lowerSql.includes('then')) {
        rows = rows.filter(r => r.available_stock <= 0);
      } else if (lowerSql.includes('> 0 and')) {
        rows = rows.filter(r => r.available_stock > 0 && r.available_stock <= r.low_stock_threshold);
      } else if (lowerSql.includes('> coalesce(i.low_stock_threshold, 5)')) {
        rows = rows.filter(r => r.available_stock > r.low_stock_threshold);
      }

      return rows.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''));
    }

    // 1.7 Products
    if (lowerSql.includes('from products')) {
      if (lowerSql.includes('count(*) as cnt') && lowerSql.includes('where category_id = ?')) {
        const catId = Number(params[0]);
        return [{ cnt: db.products.filter(p => p.category_id === catId).length }];
      }
      if (lowerSql.includes('where sku = ?')) {
        const sku = String(params[0] || '').trim().toLowerCase();
        return db.products.filter(p => (p.sku || '').toLowerCase() === sku);
      }
      if (lowerSql.includes('where p.id = ?') || lowerSql.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        const requireActive = lowerSql.includes('p.is_active = true');
        const prod = db.products.find(p => p.id === id && (!requireActive || p.is_active));
        if (!prod) return [];
        return [enrichProduct(db, prod)];
      }

      // Product listing with filters & sorting
      let list = db.products.filter(p => p.is_active).map(p => enrichProduct(db, p));
      let pIdx = 0;

      if (lowerSql.includes('and p.category_id = ?')) {
        const catId = Number(params[pIdx++]);
        list = list.filter(p => p.category_id === catId);
      } else if (lowerSql.includes('and c.slug = ?')) {
        const targetSlug = params[pIdx++];
        list = list.filter(p => p.category_slug === targetSlug);
      }

      if (lowerSql.includes('like ?')) {
        const term = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        pIdx += 4;
        if (term) {
          list = list.filter(p =>
            (p.name_en && p.name_en.toLowerCase().includes(term)) ||
            (p.name_kn && p.name_kn.toLowerCase().includes(term)) ||
            (p.sku && p.sku.toLowerCase().includes(term)) ||
            (p.description_en && p.description_en.toLowerCase().includes(term))
          );
        }
      }

      if (lowerSql.includes('p.retail_price >= ?')) {
        const minP = parseFloat(params[pIdx++]);
        if (!isNaN(minP)) list = list.filter(p => p.retail_price >= minP);
      }
      if (lowerSql.includes('p.retail_price <= ?')) {
        const maxP = parseFloat(params[pIdx++]);
        if (!isNaN(maxP)) list = list.filter(p => p.retail_price <= maxP);
      }

      if (lowerSql.includes('order by p.retail_price asc')) {
        list.sort((a, b) => a.retail_price - b.retail_price);
      } else if (lowerSql.includes('order by p.retail_price desc')) {
        list.sort((a, b) => b.retail_price - a.retail_price);
      } else if (lowerSql.includes('order by p.wholesale_price asc')) {
        list.sort((a, b) => a.wholesale_price - b.wholesale_price);
      } else if (lowerSql.includes('order by p.created_at desc')) {
        list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id);
      } else {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0) || a.id - b.id);
      }

      return list;
    }

    // 1.8 Product Images (ignore scalar image subqueries inside products/cart/order SELECTs)
    if (
      lowerSql.includes('from product_images') &&
      !lowerSql.includes('from products') &&
      !lowerSql.includes('from cart_items') &&
      !lowerSql.includes('from order_items') &&
      !lowerSql.includes('from orders')
    ) {
      if (lowerSql.includes('count(*) as cnt')) {
        const prodId = parseInt(params[0], 10);
        return [{ cnt: db.product_images.filter(img => img.product_id === prodId).length }];
      }
      const prodId = parseInt(params[0], 10);
      return db.product_images
        .filter(img => img.product_id === prodId)
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
    }

    // 1.9 Product Variants
    if (lowerSql.includes('from product_variants')) {
      const prodId = parseInt(params[0], 10);
      return db.product_variants.filter(v => v.product_id === prodId && v.is_active !== false);
    }

    // 1.10 Inventory
    if (lowerSql.includes('from inventory_transactions')) {
      let logs = db.inventory_transactions.map(it => {
        const prod = db.products.find(p => p.id === it.product_id);
        const u = it.created_by_user_id ? db.users.find(usr => usr.id === it.created_by_user_id) : null;
        return {
          ...it,
          sku: prod?.sku || '',
          name_en: prod?.name_en || '',
          name_kn: prod?.name_kn || '',
          created_by_name: u?.full_name || 'System'
        };
      });

      let pIdx = 0;
      if (lowerSql.includes('where it.product_id = ?')) {
        const prodId = parseInt(params[pIdx++], 10);
        logs = logs.filter(l => l.product_id === prodId);
      }
      logs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id);
      if (lowerSql.includes('limit ?')) {
        const limit = parseInt(params[pIdx] || 50, 10);
        logs = logs.slice(0, limit);
      }
      return logs;
    }

    if (lowerSql.includes('from inventory')) {
      if (lowerSql.includes('where product_id = ?')) {
        const prodId = parseInt(params[0], 10);
        const inv = db.inventory.find(i => i.product_id === prodId);
        return inv ? [inv] : [];
      }
      return db.inventory;
    }

    // 1.11 Carts
    if (lowerSql.includes('from carts')) {
      if (lowerSql.includes('user_id = ?')) {
        const uid = Number(params[0]);
        const c = db.carts.find(x => x.user_id != null && Number(x.user_id) === uid);
        return c ? [c] : [];
      }
      if (lowerSql.includes('session_id = ?')) {
        const sid = params[0];
        const c = db.carts.find(x => x.session_id === sid && !x.user_id);
        return c ? [c] : [];
      }
      return db.carts;
    }

    // 1.12 Cart Items
    if (lowerSql.includes('from cart_items')) {
      if (lowerSql.includes('where cart_id = ? and product_id = ?')) {
        const cartId = Number(params[0]);
        const prodId = Number(params[1]);
        return db.cart_items.filter(ci => Number(ci.cart_id) === cartId && Number(ci.product_id) === prodId);
      }
      if (lowerSql.includes('where ci.cart_id = ?') || lowerSql.includes('where cart_id = ?')) {
        const cartId = Number(params[0]);
        const items = db.cart_items.filter(ci => Number(ci.cart_id) === cartId);
        const enriched = [];
        for (const ci of items) {
          const prod = db.products.find(p => p.id === ci.product_id);
          if (!prod || !prod.is_active) continue;
          const cat = db.categories.find(c => c.id === prod.category_id);
          const inv = db.inventory.find(i => i.product_id === prod.id);
          const available = inv ? (inv.physical_stock - inv.reserved_stock) : 0;
          enriched.push({
            cart_item_id: ci.id,
            quantity: ci.quantity,
            unit_price: ci.unit_price,
            is_wholesale_pricing: Boolean(ci.is_wholesale_pricing),
            line_total: ci.quantity * ci.unit_price,
            product_id: ci.product_id,
            sku: prod.sku || '',
            name_en: prod.name_en || '',
            name_kn: prod.name_kn || '',
            retail_price: prod.retail_price || 0,
            wholesale_price: prod.wholesale_price || 0,
            moq: prod.moq || prod.min_order_qty || 1,
            category_name: cat?.name_en || '',
            available_stock: available,
            image_url: getPrimaryImage(db, prod)
          });
        }
        return enriched;
      }
      if (lowerSql.includes('where ci.id = ?') || lowerSql.includes('where id = ?')) {
        const id = Number(params[0]);
        const item = db.cart_items.find(ci => Number(ci.id) === id);
        if (!item) return [];
        const cart = db.carts.find(c => c.id === item.cart_id);
        const prod = db.products.find(p => p.id === item.product_id);
        const inv = prod ? db.inventory.find(i => i.product_id === prod.id) : null;
        return [{
          ...item,
          cart_user_id: cart?.user_id || null,
          cart_session_id: cart?.session_id || null,
          moq: prod?.moq || prod?.min_order_qty || 1,
          available_stock: inv ? (inv.physical_stock - inv.reserved_stock) : 0
        }];
      }
      return [];
    }

    // 1.13 Order Items (ignore scalar subqueries inside FROM orders queries)
    if (lowerSql.includes('from order_items') && !lowerSql.includes('from orders')) {
      if (lowerSql.includes('count(*) as cnt') && lowerSql.includes('where product_id = ?')) {
        const pid = Number(params[0]);
        return [{ cnt: db.order_items.filter(oi => Number(oi.product_id) === pid).length }];
      }
      const oid = parseInt(params[0], 10);
      return db.order_items
        .filter(oi => Number(oi.order_id) === oid)
        .map(oi => {
          const prod = db.products.find(p => p.id === oi.product_id);
          return {
            ...oi,
            image_url: getPrimaryImage(db, prod)
          };
        });
    }

    // 1.14 Orders
    if (lowerSql.includes('from orders')) {
      if (lowerSql.includes('count(*) as count')) {
        return [{ count: db.orders.length }];
      }
      if (lowerSql.includes('where o.id = ? and o.user_id = ?') || lowerSql.includes('where id = ? and user_id = ?')) {
        const oid = parseInt(params[0], 10);
        const uid = Number(params[1]);
        const ord = db.orders.find(o => Number(o.id) === oid && Number(o.user_id) === uid);
        if (!ord) return [];
        const u = db.users.find(usr => usr.id === ord.user_id);
        const p = db.payments.find(pay => pay.order_id === ord.id);
        const d = db.deliveries.find(del => del.order_id === ord.id);
        return [{
          ...ord,
          customer_name: u?.full_name || 'Customer',
          customer_phone: u?.phone || '',
          customer_email: u?.email || '',
          transaction_reference: p?.transaction_reference || null,
          verified_at: p?.verified_at || null,
          delivery_status: d?.delivery_status || 'assigned',
          delivery_agent_name: d?.delivery_agent_name || null,
          delivery_agent_phone: d?.delivery_agent_phone || null,
          tracking_notes: d?.tracking_notes || null,
          dispatched_at: d?.dispatched_at || null,
          delivered_at: d?.delivered_at || null
        }];
      }
      if (lowerSql.includes('where o.user_id = ?') || lowerSql.includes('where user_id = ?')) {
        const uid = Number(params[0]);
        const ords = db.orders
          .filter(o => Number(o.user_id) === uid)
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id);
        return ords.map(o => {
          const p = db.payments.find(pay => pay.order_id === o.id);
          const d = db.deliveries.find(del => del.order_id === o.id);
          const itemCount = db.order_items.filter(oi => oi.order_id === o.id).length;
          return {
            ...o,
            item_count: itemCount,
            transaction_reference: p?.transaction_reference || null,
            delivery_status: d?.delivery_status || 'assigned',
            delivery_agent_name: d?.delivery_agent_name || null,
            delivery_agent_phone: d?.delivery_agent_phone || null
          };
        });
      }
      if (lowerSql.includes('where o.id = ?') || lowerSql.includes('where id = ?')) {
        const oid = parseInt(params[0], 10);
        const ord = db.orders.find(o => o.id === oid);
        if (!ord) return [];
        const u = db.users.find(usr => usr.id === ord.user_id);
        const p = db.payments.find(pay => pay.order_id === ord.id);
        const d = db.deliveries.find(del => del.order_id === ord.id);
        return [{
          ...ord,
          customer_name: u?.full_name || 'Customer',
          customer_phone: u?.phone || '',
          customer_email: u?.email || '',
          transaction_reference: p?.transaction_reference || null,
          verified_at: p?.verified_at || null,
          delivery_status: d?.delivery_status || 'assigned',
          delivery_agent_name: d?.delivery_agent_name || null,
          delivery_agent_phone: d?.delivery_agent_phone || null,
          tracking_notes: d?.tracking_notes || null,
          dispatched_at: d?.dispatched_at || null,
          delivered_at: d?.delivered_at || null
        }];
      }

      // Admin getAllOrders with filters + pagination
      let rows = db.orders.map(o => {
        const u = db.users.find(usr => usr.id === o.user_id);
        const p = db.payments.find(pay => pay.order_id === o.id);
        const d = db.deliveries.find(del => del.order_id === o.id);
        const itemCount = db.order_items.filter(oi => oi.order_id === o.id).length;
        return {
          ...o,
          customer_name: u?.full_name || 'Customer',
          customer_phone: u?.phone || '',
          customer_email: u?.email || '',
          transaction_reference: p?.transaction_reference || null,
          p_payment_status: p?.payment_status || o.payment_status,
          delivery_status: d?.delivery_status || 'assigned',
          delivery_agent_name: d?.delivery_agent_name || null,
          delivery_agent_phone: d?.delivery_agent_phone || null,
          item_count: itemCount
        };
      });

      let pIdx = 0;
      if (lowerSql.includes('and o.order_status = ?')) {
        const status = params[pIdx++];
        rows = rows.filter(r => r.order_status === status);
      }
      if (lowerSql.includes('and o.payment_status = ?')) {
        const pStatus = params[pIdx++];
        rows = rows.filter(r => r.payment_status === pStatus);
      }
      if (lowerSql.includes('like ?')) {
        const term = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        pIdx += 4;
        rows = rows.filter(r =>
          (r.order_number && r.order_number.toLowerCase().includes(term)) ||
          (r.customer_name && r.customer_name.toLowerCase().includes(term)) ||
          (r.customer_phone && r.customer_phone.toLowerCase().includes(term)) ||
          (r.transaction_reference && r.transaction_reference.toLowerCase().includes(term))
        );
      }

      rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id);

      if (lowerSql.includes('limit ? offset ?')) {
        const limit = parseInt(params[pIdx++] || 20, 10);
        const offset = parseInt(params[pIdx++] || 0, 10);
        rows = rows.slice(offset, offset + limit);
      }
      return rows;
    }

    // 1.15 Deliveries
    if (lowerSql.includes('from deliveries')) {
      return [...db.deliveries]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id)
        .map(d => {
          const o = db.orders.find(ord => ord.id === d.order_id);
          const u = o ? db.users.find(usr => usr.id === o.user_id) : null;
          return {
            ...d,
            order_number: o?.order_number || '',
            total_amount: o?.total_amount || 0,
            shipping_address_json: o?.shipping_address_json || null,
            customer_name: u?.full_name || '',
            customer_phone: u?.phone || ''
          };
        });
    }

    // 1.16 Returns
    if (lowerSql.includes('from returns')) {
      if (lowerSql.includes('where order_id = ?')) {
        const oid = parseInt(params[0], 10);
        return db.returns.filter(r => r.order_id === oid);
      }
      return [...db.returns]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id)
        .map(r => {
          const o = db.orders.find(ord => ord.id === r.order_id);
          const u = db.users.find(usr => usr.id === r.user_id);
          return {
            ...r,
            order_number: o?.order_number || '',
            total_amount: o?.total_amount || 0,
            customer_name: u?.full_name || '',
            customer_phone: u?.phone || ''
          };
        });
    }

    // 1.17 Addresses
    if (lowerSql.includes('from addresses')) {
      const uid = params[0];
      return db.addresses
        .filter(a => Number(a.user_id) === Number(uid))
        .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return [];
  }

  // ==================== 2. INSERT QUERIES ====================
  if (lowerSql.startsWith('insert')) {
    if (lowerSql.includes('into users')) {
      const newId = nextId(db.users);
      db.users.push({
        id: newId,
        full_name: params[0],
        email: params[1],
        phone: params[2],
        password_hash: params[3],
        role: lowerSql.includes("'admin'") ? 'admin' : 'customer',
        account_type: params[4] || (lowerSql.includes("'wholesale'") ? 'wholesale' : 'retail'),
        is_active: true,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into customer_profiles')) {
      const uid = Number(params[0]);
      const existing = db.customer_profiles.find(cp => Number(cp.user_id) === uid);
      if (existing) {
        if (params[1] !== undefined) existing.shop_name = params[1];
        if (params[2] !== undefined) existing.gst_number = params[2];
        if (params[3] !== undefined) existing.verification_status = params[3];
        saveDb();
        return { insertId: existing.id, affectedRows: 1 };
      }
      const newId = nextId(db.customer_profiles);
      db.customer_profiles.push({
        id: newId,
        user_id: uid,
        shop_name: params[1] || null,
        gst_number: params[2] || null,
        verification_status: params[3] || 'pending',
        admin_notes: null,
        verified_at: null
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into categories')) {
      const newId = nextId(db.categories);
      db.categories.push({
        id: newId,
        name_en: params[0],
        name_kn: params[1],
        slug: params[2],
        description_en: params[3] || null,
        description_kn: params[4] || null,
        image_url: params[5] || null,
        display_order: parseInt(params[6] || 0, 10),
        is_active: true
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into products')) {
      const newId = nextId(db.products);
      const moq = parseInt(params[8] || 1, 10);
      db.products.push({
        id: newId,
        category_id: parseInt(params[0], 10),
        sku: params[1],
        name_en: params[2],
        name_kn: params[3],
        description_en: params[4],
        description_kn: params[5],
        retail_price: parseFloat(params[6]),
        wholesale_price: parseFloat(params[7]),
        moq,
        min_order_qty: moq,
        is_active: true,
        is_featured: params[9] === 1 || params[9] === true,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into product_images')) {
      const newId = nextId(db.product_images);
      db.product_images.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        image_url: params[1],
        is_primary: params[2] === 1 || params[2] === true,
        display_order: parseInt(params[3] || 0, 10)
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into product_variants')) {
      const newId = nextId(db.product_variants);
      db.product_variants.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        sku: params[1],
        variant_name: params[2],
        additional_price: parseFloat(params[3] || 0),
        stock_quantity: parseInt(params[4] || 0, 10),
        is_active: true
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into inventory_transactions')) {
      const newId = nextId(db.inventory_transactions);
      db.inventory_transactions.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        transaction_type: params[1],
        quantity: parseInt(params[2], 10),
        previous_physical_stock: parseInt(params[3], 10),
        new_physical_stock: parseInt(params[4], 10),
        previous_reserved_stock: parseInt(params[5], 10),
        new_reserved_stock: parseInt(params[6], 10),
        reference_id: params[7],
        created_by_user_id: params[8],
        notes: params[9],
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into inventory')) {
      const newId = nextId(db.inventory);
      const isZeroInit = lowerSql.includes('values (?, 0, 0, 5)');
      db.inventory.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        physical_stock: isZeroInit ? 0 : parseInt(params[1] || 0, 10),
        reserved_stock: 0,
        low_stock_threshold: isZeroInit ? 5 : parseInt(params[2] || 5, 10),
        last_restocked_at: isZeroInit ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into carts')) {
      const newId = nextId(db.carts);
      const isNullUser = lowerSql.includes('values (null,');
      db.carts.push({
        id: newId,
        user_id: isNullUser ? null : (params[0] || null),
        session_id: isNullUser ? params[0] : params[1],
        cart_type: (isNullUser ? params[1] : params[2]) || 'retail',
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into cart_items')) {
      const newId = nextId(db.cart_items);
      db.cart_items.push({
        id: newId,
        cart_id: Number(params[0]),
        product_id: Number(params[1]),
        quantity: parseInt(params[2], 10),
        unit_price: parseFloat(params[3]),
        is_wholesale_pricing: params[4] === 1 || params[4] === true
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into orders')) {
      const newId = nextId(db.orders);
      db.orders.push({
        id: newId,
        order_number: params[0],
        user_id: params[1],
        order_type: params[2],
        order_status: params[3],
        payment_status: params[4],
        payment_method: params[5],
        subtotal: parseFloat(params[6]),
        delivery_charge: parseFloat(params[7]),
        total_amount: parseFloat(params[8]),
        shipping_address_json: typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9],
        notes: params[10] || null,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into order_items')) {
      const newId = nextId(db.order_items);
      db.order_items.push({
        id: newId,
        order_id: Number(params[0]),
        product_id: Number(params[1]),
        variant_id: params[2],
        product_name: params[3],
        sku: params[4],
        unit_price: parseFloat(params[5]),
        quantity: parseInt(params[6], 10),
        subtotal: parseFloat(params[7]),
        is_wholesale: params[8] === 1 || params[8] === true
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into payments')) {
      const newId = nextId(db.payments);
      db.payments.push({
        id: newId,
        order_id: Number(params[0]),
        user_id: params[1],
        payment_method: params[2],
        amount: parseFloat(params[3]),
        transaction_reference: params[4] || null,
        payment_status: params[5],
        verified_at: null,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into deliveries')) {
      const newId = nextId(db.deliveries);
      db.deliveries.push({
        id: newId,
        order_id: Number(params[0]),
        pin_code: params[1],
        delivery_status: 'assigned',
        delivery_agent_name: null,
        delivery_agent_phone: null,
        tracking_notes: params[2] || null,
        dispatched_at: null,
        delivered_at: null,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into returns')) {
      const newId = nextId(db.returns);
      db.returns.push({
        id: newId,
        order_id: Number(params[0]),
        user_id: params[1],
        reason: params[2],
        status: 'requested',
        admin_notes: null,
        refund_amount: parseFloat(params[3] || 0),
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into delivery_pincodes')) {
      const existing = db.delivery_pincodes.find(p => p.pin_code === String(params[0]).trim());
      if (existing) {
        const err = new Error(`Duplicate entry '${params[0]}' for key 'pin_code'`);
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }
      const newId = nextId(db.delivery_pincodes);
      db.delivery_pincodes.push({
        id: newId,
        pin_code: String(params[0]).trim(),
        locality_name: params[1],
        delivery_fee: parseFloat(params[2] || 40),
        min_order_amount: parseFloat(params[3] || 300),
        estimated_delivery_hours: parseInt(params[4] || 24, 10),
        is_active: true
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into addresses')) {
      const newId = nextId(db.addresses);
      db.addresses.push({
        id: newId,
        user_id: params[0],
        label: params[1],
        recipient_name: params[2],
        phone: params[3],
        address_line1: params[4],
        address_line2: params[5],
        landmark: params[6],
        city: params[7],
        state: params[8],
        pin_code: params[9],
        is_default: params[10] === 1 || params[10] === true,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into business_settings')) {
      const key = params[0];
      const val = params[1];
      const existing = db.business_settings.find(s => s.setting_key === key);
      if (existing) {
        existing.setting_value = val;
      } else {
        db.business_settings.push({ setting_key: key, setting_value: val });
      }
      saveDb();
      return { insertId: 0, affectedRows: 1 };
    }

    if (lowerSql.includes('into notifications')) {
      const newId = nextId(db.notifications);
      db.notifications.push({
        id: newId,
        user_id: null,
        title: params[0],
        message: params[1],
        type: 'order',
        is_read: false,
        created_at: new Date().toISOString()
      });
      saveDb();
      return { insertId: newId, affectedRows: 1 };
    }
  }

  // ==================== 3. UPDATE QUERIES ====================
  if (lowerSql.startsWith('update')) {
    if (lowerSql.includes('users set')) {
      const uid = Number(params[params.length - 1]);
      const u = db.users.find(usr => Number(usr.id) === uid);
      if (u) {
        if (params[0] !== null && params[0] !== undefined) u.full_name = params[0];
        if (params[1] !== null && params[1] !== undefined) u.phone = params[1];
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('categories set')) {
      const cid = Number(params[params.length - 1]);
      const c = db.categories.find(cat => Number(cat.id) === cid);
      if (c) {
        const [name_en, name_kn, slug, description_en, description_kn, image_url, display_order, is_active] = params;
        if (name_en != null) c.name_en = name_en;
        if (name_kn != null) c.name_kn = name_kn;
        if (slug != null) c.slug = slug;
        if (description_en != null) c.description_en = description_en;
        if (description_kn != null) c.description_kn = description_kn;
        if (image_url != null) c.image_url = image_url;
        if (display_order != null) c.display_order = parseInt(display_order, 10);
        if (is_active != null) c.is_active = Boolean(is_active);
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('products set is_active = false')) {
      const pid = Number(params[0]);
      const p = db.products.find(prod => Number(prod.id) === pid);
      if (p) {
        p.is_active = false;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('products set')) {
      const pid = Number(params[params.length - 1]);
      const p = db.products.find(prod => Number(prod.id) === pid);
      if (p) {
        const [category_id, name_en, name_kn, description_en, description_kn, retail_price, wholesale_price, moq, is_active, is_featured] = params;
        if (category_id != null) p.category_id = parseInt(category_id, 10);
        if (name_en != null) p.name_en = name_en;
        if (name_kn != null) p.name_kn = name_kn;
        if (description_en != null) p.description_en = description_en;
        if (description_kn != null) p.description_kn = description_kn;
        if (retail_price != null) p.retail_price = parseFloat(retail_price);
        if (wholesale_price != null) p.wholesale_price = parseFloat(wholesale_price);
        if (moq != null) {
          p.moq = parseInt(moq, 10);
          p.min_order_qty = p.moq;
        }
        if (is_active != null) p.is_active = Boolean(is_active);
        if (is_featured != null) p.is_featured = Boolean(is_featured);
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('inventory set')) {
      const prodId = parseInt(params[params.length - 1], 10);
      const inv = db.inventory.find(i => i.product_id === prodId);
      if (inv) {
        if (lowerSql.includes('set reserved_stock = ? where product_id = ?')) {
          inv.reserved_stock = parseInt(params[0], 10);
        } else if (lowerSql.includes('set physical_stock = ? where product_id = ?')) {
          inv.physical_stock = parseInt(params[0], 10);
        } else if (lowerSql.includes('physical_stock = ?, reserved_stock = ?')) {
          inv.physical_stock = parseInt(params[0], 10);
          inv.reserved_stock = parseInt(params[1], 10);
        } else {
          const newPhysical = parseInt(params[0], 10);
          const newThreshold = parseInt(params[1], 10);
          if (newPhysical > inv.physical_stock) {
            inv.last_restocked_at = new Date().toISOString();
          }
          inv.physical_stock = newPhysical;
          inv.low_stock_threshold = newThreshold;
        }
        inv.updated_at = new Date().toISOString();
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('carts set cart_type = ?')) {
      const c = db.carts.find(x => Number(x.id) === Number(params[1]));
      if (c) {
        c.cart_type = params[0];
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('cart_items set quantity = ? where id = ?')) {
      const qty = parseInt(params[0], 10);
      const cid = Number(params[1]);
      const item = db.cart_items.find(ci => Number(ci.id) === cid);
      if (item) {
        item.quantity = qty;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('cart_items set quantity = ?, unit_price = ?')) {
      const qty = parseInt(params[0], 10);
      const price = parseFloat(params[1]);
      const isW = Boolean(params[2]);
      const cid = Number(params[params.length - 1]);
      const item = db.cart_items.find(ci => Number(ci.id) === cid);
      if (item) {
        item.quantity = qty;
        item.unit_price = price;
        item.is_wholesale_pricing = isW;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes("orders set order_status = 'cancelled'")) {
      const reason = params[0];
      const oid = parseInt(params[1], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) {
        ord.order_status = 'cancelled';
        ord.notes = `${ord.notes || ''} [Cancelled: ${reason}]`.trim();
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes("orders set order_status = 'return_requested'")) {
      const oid = parseInt(params[0], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) {
        ord.order_status = 'return_requested';
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('orders set order_status = ? where id = ?')) {
      const status = params[0];
      const oid = parseInt(params[1], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) {
        ord.order_status = status;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes("orders set payment_status = 'paid'")) {
      const oid = parseInt(params[0], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) {
        ord.payment_status = 'paid';
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('orders set payment_status = ? where id = ?')) {
      const status = params[0];
      const oid = parseInt(params[1], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) {
        ord.payment_status = status;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes("payments set payment_status = 'failed'")) {
      const oid = parseInt(params[0], 10);
      const p = db.payments.find(pay => pay.order_id === oid && pay.payment_status !== 'paid');
      if (p) {
        p.payment_status = 'failed';
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes("payments set payment_status = 'paid'")) {
      const oid = parseInt(params[0], 10);
      const p = db.payments.find(pay => pay.order_id === oid);
      if (p) {
        p.payment_status = 'paid';
        p.verified_at = new Date().toISOString();
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('payments set payment_status = ?')) {
      const status = params[0];
      const verifiedBy = params[1];
      const remarks = params[2];
      const oid = parseInt(params[3], 10);
      const p = db.payments.find(pay => pay.order_id === oid);
      if (p) {
        p.payment_status = status;
        p.verified_by_user_id = verifiedBy;
        p.admin_remarks = remarks;
        p.verified_at = new Date().toISOString();
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('deliveries set')) {
      if (lowerSql.includes('where order_id = ?')) {
        const oid = parseInt(params[0], 10);
        const d = db.deliveries.find(del => del.order_id === oid);
        if (d) {
          if (lowerSql.includes("'out_for_delivery'")) {
            d.delivery_status = 'out_for_delivery';
            d.dispatched_at = new Date().toISOString();
          } else if (lowerSql.includes("'delivered'")) {
            d.delivery_status = 'delivered';
            d.delivered_at = new Date().toISOString();
          }
          saveDb();
          return { insertId: 0, affectedRows: 1 };
        }
        return { insertId: 0, affectedRows: 0 };
      }
      const did = parseInt(params[params.length - 1], 10);
      const d = db.deliveries.find(del => del.id === did);
      if (d) {
        const [agentName, agentPhone, delStatus, notes] = params;
        if (agentName != null) d.delivery_agent_name = agentName;
        if (agentPhone != null) d.delivery_agent_phone = agentPhone;
        if (delStatus != null) {
          d.delivery_status = delStatus;
          if (delStatus === 'out_for_delivery') d.dispatched_at = new Date().toISOString();
          if (delStatus === 'delivered') d.delivered_at = new Date().toISOString();
        }
        if (notes != null) d.tracking_notes = notes;
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('returns set')) {
      const [status, admin_notes, refund_amount, rid] = params;
      const r = db.returns.find(ret => Number(ret.id) === Number(rid));
      if (r) {
        if (status != null) r.status = status;
        if (admin_notes !== undefined) r.admin_notes = admin_notes;
        if (refund_amount != null) r.refund_amount = parseFloat(refund_amount);
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    if (lowerSql.includes('customer_profiles set verification_status = ?')) {
      const status = params[0];
      const adminNotes = params[1];
      const uid = parseInt(params[params.length - 1], 10);
      let cp = db.customer_profiles.find(p => Number(p.user_id) === uid);
      if (!cp) {
        cp = {
          id: nextId(db.customer_profiles),
          user_id: uid,
          shop_name: null,
          gst_number: null,
          verification_status: status,
          admin_notes: adminNotes || null,
          verified_at: status === 'approved' ? new Date().toISOString() : null
        };
        db.customer_profiles.push(cp);
      } else {
        cp.verification_status = status;
        cp.admin_notes = adminNotes || null;
        if (status === 'approved') cp.verified_at = new Date().toISOString();
      }
      saveDb();
      return { insertId: 0, affectedRows: 1 };
    }

    if (lowerSql.includes('addresses set is_default = false')) {
      const uid = Number(params[0]);
      db.addresses.forEach(a => {
        if (Number(a.user_id) === uid) a.is_default = false;
      });
      saveDb();
      return { insertId: 0, affectedRows: 1 };
    }

    if (lowerSql.includes('delivery_pincodes set')) {
      const [locality_name, delivery_fee, min_order_amount, estimated_delivery_hours, is_active, pid] = params;
      const pin = db.delivery_pincodes.find(p => Number(p.id) === Number(pid));
      if (pin) {
        if (locality_name != null) pin.locality_name = locality_name;
        if (delivery_fee != null) pin.delivery_fee = parseFloat(delivery_fee);
        if (min_order_amount != null) pin.min_order_amount = parseFloat(min_order_amount);
        if (estimated_delivery_hours != null) pin.estimated_delivery_hours = parseInt(estimated_delivery_hours, 10);
        if (is_active != null) pin.is_active = Boolean(is_active);
        saveDb();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    return { insertId: 0, affectedRows: 0 };
  }

  // ==================== 4. DELETE QUERIES ====================
  if (lowerSql.startsWith('delete')) {
    if (lowerSql.includes('from cart_items where id = ?')) {
      const cid = Number(params[0]);
      const before = db.cart_items.length;
      db.cart_items = db.cart_items.filter(ci => Number(ci.id) !== cid);
      saveDb();
      return { insertId: 0, affectedRows: before - db.cart_items.length };
    }

    if (lowerSql.includes('from cart_items') && lowerSql.includes('where c.user_id = ?')) {
      const uid = params[0];
      const userCarts = new Set(db.carts.filter(c => c.user_id === uid).map(c => c.id));
      const before = db.cart_items.length;
      db.cart_items = db.cart_items.filter(ci => !userCarts.has(ci.cart_id));
      saveDb();
      return { insertId: 0, affectedRows: before - db.cart_items.length };
    }

    if (lowerSql.includes('from cart_items') && lowerSql.includes('where c.session_id = ?')) {
      const sid = params[0];
      const sessionCarts = new Set(db.carts.filter(c => c.session_id === sid && !c.user_id).map(c => c.id));
      const before = db.cart_items.length;
      db.cart_items = db.cart_items.filter(ci => !sessionCarts.has(ci.cart_id));
      saveDb();
      return { insertId: 0, affectedRows: before - db.cart_items.length };
    }

    if (lowerSql.includes('from product_images where id = ?')) {
      const imgId = Number(params[0]);
      const before = db.product_images.length;
      db.product_images = db.product_images.filter(img => Number(img.id) !== imgId);
      saveDb();
      return { insertId: 0, affectedRows: before - db.product_images.length };
    }

    if (lowerSql.includes('from products where id = ?')) {
      const pid = Number(params[0]);
      const before = db.products.length;
      db.products = db.products.filter(p => Number(p.id) !== pid);
      db.inventory = db.inventory.filter(i => Number(i.product_id) !== pid);
      db.product_images = db.product_images.filter(im => Number(im.product_id) !== pid);
      db.product_variants = db.product_variants.filter(v => Number(v.product_id) !== pid);
      db.cart_items = db.cart_items.filter(ci => Number(ci.product_id) !== pid);
      saveDb();
      return { insertId: 0, affectedRows: before - db.products.length };
    }

    if (lowerSql.includes('from categories where id = ?')) {
      const cid = Number(params[0]);
      const before = db.categories.length;
      db.categories = db.categories.filter(c => Number(c.id) !== cid);
      saveDb();
      return { insertId: 0, affectedRows: before - db.categories.length };
    }

    if (lowerSql.includes('from delivery_pincodes where id = ?')) {
      const pid = Number(params[0]);
      const before = db.delivery_pincodes.length;
      db.delivery_pincodes = db.delivery_pincodes.filter(p => Number(p.id) !== pid);
      saveDb();
      return { insertId: 0, affectedRows: before - db.delivery_pincodes.length };
    }

    if (lowerSql.includes('from addresses where id = ? and user_id = ?')) {
      const aid = Number(params[0]);
      const uid = Number(params[1]);
      const before = db.addresses.length;
      db.addresses = db.addresses.filter(a => !(Number(a.id) === aid && Number(a.user_id) === uid));
      saveDb();
      return { insertId: 0, affectedRows: before - db.addresses.length };
    }

    return { insertId: 0, affectedRows: 0 };
  }

  return [];
}

/**
 * Transaction interface with snapshot rollback for embedded database
 */
function createEmbeddedConnection() {
  let snapshot = null;
  return {
    beginTransaction: async () => {
      snapshot = JSON.stringify(loadDb());
    },
    commit: async () => {
      snapshot = null;
      saveDb();
    },
    rollback: async () => {
      if (snapshot) {
        memoryDb = normalizeDb(JSON.parse(snapshot));
        saveDb();
        snapshot = null;
      }
    },
    release: () => {},
    execute: async (sql, params = []) => {
      const rows = executeQuery(sql, params);
      return [rows];
    },
    query: async (sql, params = []) => {
      const rows = executeQuery(sql, params);
      return [rows];
    }
  };
}

module.exports = {
  executeQuery,
  createEmbeddedConnection,
  loadDb,
  saveDb
};
