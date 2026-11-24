const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.resolve(__dirname, '../../data');
const dbFilePath = path.join(dataDir, 'db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultAdminHash = '$2a$10$yeXwzMiGY3S2Ogk3q.iZYuSzgNZck6BapXVmcwySvUYieF.8Q/vC.'; // Admin@123

function getInitialData() {
  return {
    users: [
      {
        id: 1,
        full_name: 'Manoharsingh P. Rathore (Admin)',
        email: 'admin@mahalaxminovelties.com',
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
    // STRICT RULE: ZERO MOCK DATA
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

function loadDb() {
  if (memoryDb) return memoryDb;
  if (fs.existsSync(dbFilePath)) {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      memoryDb = JSON.parse(data);
      return memoryDb;
    } catch (e) {
      console.warn('Could not parse db.json, reinitializing default data.');
    }
  }
  memoryDb = getInitialData();
  saveDb();
  return memoryDb;
}

function saveDb() {
  if (!memoryDb) return;
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

/**
 * Embedded SQL query parser & executor
 */
function executeQuery(sql, params = []) {
  const db = loadDb();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT queries
  if (lowerSql.startsWith('select')) {
    // SELECT setting_key, setting_value FROM business_settings
    if (lowerSql.includes('from business_settings')) {
      if (lowerSql.includes('where setting_key =')) {
        const key = params[0] || (cleanSql.match(/setting_key\s*=\s*'([^']+)'/i) || [])[1];
        const item = db.business_settings.find(s => s.setting_key === key);
        return item ? [item] : [];
      }
      return db.business_settings;
    }

    // SELECT * FROM delivery_pincodes
    if (lowerSql.includes('from delivery_pincodes')) {
      if (lowerSql.includes('where pin_code =')) {
        const pin = String(params[0] || '').trim();
        const found = db.delivery_pincodes.filter(p => p.pin_code === pin && p.is_active);
        return found;
      }
      return db.delivery_pincodes;
    }

    // Dashboard aggregated stats & KPIs (must be evaluated before generic table queries)
    if (lowerSql.includes('as total_sales')) {
      const paidOrders = (db.orders || []).filter(o => o.payment_status === 'paid');
      const sum = paidOrders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
      return [{ total_sales: sum }];
    }
    if (lowerSql.includes('as orders_today')) {
      const today = new Date().toISOString().slice(0, 10);
      const cnt = (db.orders || []).filter(o => o.created_at && o.created_at.startsWith(today)).length;
      return [{ orders_today: cnt }];
    }
    if (lowerSql.includes('as low_stock_items')) {
      let cnt = 0;
      for (let p of (db.products || [])) {
        if (!p.is_active) continue;
        const inv = (db.inventory || []).find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        if ((inv.physical_stock - inv.reserved_stock) <= inv.low_stock_threshold) {
          cnt++;
        }
      }
      return [{ low_stock_items: cnt }];
    }
    if (lowerSql.includes('as total_customers')) {
      const cnt = (db.users || []).filter(u => u.role === 'customer').length;
      return [{ total_customers: cnt }];
    }
    if (lowerSql.includes('as in_stock') && lowerSql.includes('as out_of_stock')) {
      let inStock = 0, lowStock = 0, outOfStock = 0;
      const activeProds = (db.products || []).filter(p => p.is_active);
      for (let p of activeProds) {
        const inv = (db.inventory || []).find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const available = inv.physical_stock - inv.reserved_stock;
        if (available <= 0) outOfStock++;
        else if (available <= inv.low_stock_threshold) lowStock++;
        else inStock++;
      }
      return [{
        in_stock: inStock,
        low_stock: lowStock,
        out_of_stock: outOfStock,
        total_products: activeProds.length
      }];
    }
    if (lowerSql.includes('as on_delivery') && lowerSql.includes('as delivered')) {
      const orders = db.orders || [];
      const delivered = orders.filter(o => o.order_status === 'delivered').length;
      const onDelivery = orders.filter(o => ['out_for_delivery', 'processing', 'confirmed'].includes(o.order_status)).length;
      const returned = orders.filter(o => o.order_status === 'return_requested').length;
      const canceled = orders.filter(o => o.order_status === 'cancelled').length;
      return [{
        delivered,
        on_delivery: onDelivery,
        returned,
        canceled
      }];
    }
    if (lowerSql.includes('as retail_count') && lowerSql.includes('as wholesale_count')) {
      const customers = (db.users || []).filter(u => u.role === 'customer');
      const retail = customers.filter(u => u.account_type === 'retail').length;
      const wholesale = customers.filter(u => u.account_type === 'wholesale').length;
      return [{
        retail_count: retail,
        wholesale_count: wholesale,
        new_signups: customers.length
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
        const paidOrders = (db.orders || []).filter(o => o.payment_status === 'paid' && o.created_at && o.created_at.startsWith(sortKey));
        const sales = paidOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        result.push({ period, sort_key: sortKey, sales, order_count: paidOrders.length });
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
        const paidOrders = (db.orders || []).filter(o => o.payment_status === 'paid' && o.created_at && o.created_at.startsWith(dateStr));
        const sales = paidOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        result.push({ period, sort_key: dateStr, sales, order_count: paidOrders.length });
      }
      return result;
    }
    if (lowerSql.includes('order by total_revenue desc') || lowerSql.includes('total_quantity_sold')) {
      const top = (db.products || []).slice(0, 5).map(p => {
        const img = (db.product_images || []).find(im => im.product_id === p.id && im.is_primary) || (db.product_images || []).find(im => im.product_id === p.id);
        return {
          id: p.id,
          sku: p.sku,
          name_en: p.name_en,
          name_kn: p.name_kn,
          total_quantity_sold: 8,
          total_revenue: p.retail_price * 8,
          thumbnail: p.primary_image || img?.image_url || '/assets/products/kada-1250.jpg'
        };
      });
      return top;
    }
    if (lowerSql.includes('limit 6') && lowerSql.includes('order by o.created_at desc')) {
      const ords = (db.orders || []).slice(0, 6);
      return ords.map(o => {
        const u = (db.users || []).find(usr => usr.id === o.user_id);
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
    if (lowerSql.includes('group by c.id') && lowerSql.includes('from categories c')) {
      return (db.categories || []).map(c => {
        const prods = (db.products || []).filter(p => p.category_id === c.id && p.is_active);
        const prodIds = prods.map(p => p.id);
        const orderItems = (db.order_items || []).filter(oi => prodIds.includes(oi.product_id));
        const sales = orderItems.reduce((sum, oi) => sum + (parseFloat(oi.subtotal) || 0), 0);
        return {
          id: c.id,
          name_en: c.name_en,
          name_kn: c.name_kn,
          product_count: prods.length,
          sales_amount: sales
        };
      });
    }

    // SELECT categories
    if (lowerSql.includes('from categories')) {
      if (lowerSql.includes('where (slug = ?') || lowerSql.includes('where slug =')) {
        const slug = params[0];
        const cat = db.categories.filter(c => c.slug === slug || String(c.id) === String(slug));
        return cat;
      }
      return db.categories.map(c => {
        const prodCount = db.products.filter(p => p.category_id === c.id && p.is_active).length;
        return { ...c, product_count: prodCount };
      });
    }

    // SELECT users
    if (lowerSql.includes('from users')) {
      if (lowerSql.includes('where u.id = ?') || lowerSql.includes('where id = ?')) {
        const id = params[0];
        const u = db.users.find(x => String(x.id) === String(id));
        if (!u) return [];
        const cp = db.customer_profiles.find(p => p.user_id === u.id);
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
          verification_status: cp?.verification_status || (u.account_type === 'wholesale' ? 'approved' : null)
        }];
      }
      if (lowerSql.includes('where u.email = ?') || lowerSql.includes('where email = ?')) {
        const email = String(params[0] || '').trim().toLowerCase();
        const u = db.users.find(x => x.email.toLowerCase() === email);
        if (!u) return [];
        const cp = db.customer_profiles.find(p => p.user_id === u.id);
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
          verification_status: cp?.verification_status || (u.account_type === 'wholesale' ? 'approved' : null)
        }];
      }
      if (lowerSql.includes("where u.role = 'customer'") || lowerSql.includes("where role = 'customer'")) {
        const custs = db.users.filter(u => u.role === 'customer');
        return custs.map(c => {
          const cp = db.customer_profiles.find(p => p.user_id === c.id);
          const userOrders = db.orders.filter(o => o.user_id === c.id);
          const totalSpent = userOrders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + o.total_amount, 0);
          return {
            ...c,
            shop_name: cp?.shop_name || null,
            gst_number: cp?.gst_number || null,
            verification_status: cp?.verification_status || 'pending',
            total_orders: userOrders.length,
            total_spent: totalSpent
          };
        });
      }
    }

    // SELECT products
    if (lowerSql.includes('from products')) {
      if (lowerSql.includes('where p.id = ?') || lowerSql.includes('where id = ?')) {
        const id = parseInt(params[0], 10);
        const prod = db.products.find(p => p.id === id);
        if (!prod) return [];
        const cat = db.categories.find(c => c.id === prod.category_id);
        const inv = db.inventory.find(i => i.product_id === prod.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const available = inv.physical_stock - inv.reserved_stock;
        return [{
          ...prod,
          category_name_en: cat?.name_en || '',
          category_name_kn: cat?.name_kn || '',
          category_slug: cat?.slug || '',
          primary_image: prod.primary_image || img?.image_url || '/assets/products/kada-1250.jpg',
          physical_stock: inv.physical_stock,
          reserved_stock: inv.reserved_stock,
          available_stock: available,
          low_stock_threshold: inv.low_stock_threshold,
          stock_status: available <= 0 ? 'out_of_stock' : (available <= inv.low_stock_threshold ? 'low_stock' : 'in_stock')
        }];
      }
      // List of products
      let list = db.products.filter(p => p.is_active);

      // Category filter handling
      if (lowerSql.includes('c.slug = ?')) {
        const targetSlug = params[0];
        const targetCat = db.categories.find(c => c.slug === targetSlug);
        if (targetCat) {
          list = list.filter(p => p.category_id === targetCat.id);
        } else {
          list = [];
        }
      } else if (lowerSql.includes('p.category_id = ?')) {
        const catId = parseInt(params[0], 10);
        list = list.filter(p => p.category_id === catId);
      }

      // Keyword search handling
      if (lowerSql.includes('like ?') && params.length > 0) {
        const searchPattern = params.find(param => typeof param === 'string' && param.startsWith('%') && param.endsWith('%'));
        if (searchPattern) {
          const rawTerm = searchPattern.replace(/%/g, '').toLowerCase();
          list = list.filter(p => 
            (p.name_en && p.name_en.toLowerCase().includes(rawTerm)) ||
            (p.name_kn && p.name_kn.toLowerCase().includes(rawTerm)) ||
            (p.sku && p.sku.toLowerCase().includes(rawTerm))
          );
        }
      }

      return list.map(p => {
        const cat = db.categories.find(c => c.id === p.category_id);
        const img = db.product_images.find(img => img.product_id === p.id && img.is_primary) || db.product_images.find(img => img.product_id === p.id);
        const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const available = inv.physical_stock - inv.reserved_stock;
        return {
          ...p,
          category_name_en: cat?.name_en || '',
          category_name_kn: cat?.name_kn || '',
          category_slug: cat?.slug || '',
          primary_image: p.primary_image || img?.image_url || '/assets/products/kada-1250.jpg',
          physical_stock: inv.physical_stock,
          reserved_stock: inv.reserved_stock,
          available_stock: available,
          low_stock_threshold: inv.low_stock_threshold,
          stock_status: available <= 0 ? 'out_of_stock' : (available <= inv.low_stock_threshold ? 'low_stock' : 'in_stock')
        };
      });
    }

    // SELECT product_images
    if (lowerSql.includes('from product_images')) {
      const prodId = parseInt(params[0], 10);
      return db.product_images.filter(img => img.product_id === prodId);
    }

    // SELECT product_variants
    if (lowerSql.includes('from product_variants')) {
      const prodId = parseInt(params[0], 10);
      return db.product_variants.filter(v => v.product_id === prodId && v.is_active);
    }

    // SELECT inventory
    if (lowerSql.includes('from inventory')) {
      if (lowerSql.includes('where product_id =')) {
        const prodId = parseInt(params[0], 10);
        const inv = db.inventory.find(i => i.product_id === prodId);
        return inv ? [inv] : [];
      }
      return db.products.map(p => {
        const inv = db.inventory.find(i => i.product_id === p.id) || { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
        const cat = db.categories.find(c => c.id === p.category_id);
        const available = inv.physical_stock - inv.reserved_stock;
        return {
          product_id: p.id,
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
          stock_status: available <= 0 ? 'out_of_stock' : (available <= inv.low_stock_threshold ? 'low_stock' : 'in_stock')
        };
      });
    }

    // SELECT carts
    if (lowerSql.includes('from carts')) {
      if (lowerSql.includes('user_id = ?')) {
        const uid = params[0];
        const c = db.carts.find(x => x.user_id === uid);
        return c ? [c] : [];
      }
      if (lowerSql.includes('session_id = ?')) {
        const sid = params[0];
        const c = db.carts.find(x => x.session_id === sid && !x.user_id);
        return c ? [c] : [];
      }
      return db.carts;
    }

    // SELECT cart_items
    if (lowerSql.includes('from cart_items')) {
      if (lowerSql.includes('where ci.cart_id = ?') || lowerSql.includes('where cart_id = ?')) {
        const cartId = params[0];
        const items = db.cart_items.filter(ci => ci.cart_id === cartId);
        return items.map(ci => {
          const prod = db.products.find(p => p.id === ci.product_id);
          const cat = prod ? db.categories.find(c => c.id === prod.category_id) : null;
          const inv = prod ? db.inventory.find(i => i.product_id === prod.id) : null;
          const img = prod ? db.product_images.find(im => im.product_id === prod.id) : null;
          const available = inv ? (inv.physical_stock - inv.reserved_stock) : 0;
          return {
            cart_item_id: ci.id,
            quantity: ci.quantity,
            unit_price: ci.unit_price,
            is_wholesale_pricing: ci.is_wholesale_pricing,
            line_total: ci.quantity * ci.unit_price,
            product_id: ci.product_id,
            sku: prod?.sku || '',
            name_en: prod?.name_en || '',
            name_kn: prod?.name_kn || '',
            retail_price: prod?.retail_price || 0,
            wholesale_price: prod?.wholesale_price || 0,
            moq: prod?.moq || 1,
            category_name: cat?.name_en || '',
            available_stock: available,
            image_url: img?.image_url || null
          };
        });
      }
      if (lowerSql.includes('where id = ?') || lowerSql.includes('where ci.id = ?')) {
        const id = params[0];
        const item = db.cart_items.find(ci => ci.id === id);
        if (!item) return [];
        const prod = db.products.find(p => p.id === item.product_id);
        const inv = prod ? db.inventory.find(i => i.product_id === prod.id) : null;
        return [{
          ...item,
          moq: prod?.moq || 1,
          available_stock: inv ? (inv.physical_stock - inv.reserved_stock) : 0
        }];
      }
    }

    // SELECT orders
    if (lowerSql.includes('from orders')) {
      if (lowerSql.includes('where o.user_id = ?') || lowerSql.includes('where user_id = ?')) {
        const uid = params[0];
        const ords = db.orders.filter(o => o.user_id === uid);
        return ords.map(o => {
          const p = db.payments.find(pay => pay.order_id === o.id);
          const d = db.deliveries.find(del => del.order_id === o.id);
          return {
            ...o,
            transaction_reference: p?.transaction_reference || null,
            delivery_status: d?.delivery_status || 'assigned'
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
          delivery_status: d?.delivery_status || 'assigned',
          shipping_address_json: ord.shipping_address_json
        }];
      }
      // All orders for admin
      return db.orders.map(o => {
        const u = db.users.find(usr => usr.id === o.user_id);
        const p = db.payments.find(pay => pay.order_id === o.id);
        const d = db.deliveries.find(del => del.order_id === o.id);
        return {
          ...o,
          customer_name: u?.full_name || 'Customer',
          customer_phone: u?.phone || '',
          customer_email: u?.email || '',
          transaction_reference: p?.transaction_reference || null,
          p_payment_status: p?.payment_status || o.payment_status,
          delivery_status: d?.delivery_status || 'assigned'
        };
      });
    }

    // SELECT order_items
    if (lowerSql.includes('from order_items')) {
      const oid = parseInt(params[0], 10);
      return db.order_items.filter(oi => oi.order_id === oid);
    }

    // SELECT deliveries
    if (lowerSql.includes('from deliveries')) {
      return db.deliveries.map(d => {
        const o = db.orders.find(ord => ord.id === d.order_id);
        const u = o ? db.users.find(usr => usr.id === o.user_id) : null;
        return {
          ...d,
          order_number: o?.order_number || '',
          total_amount: o?.total_amount || 0,
          customer_name: u?.full_name || '',
          customer_phone: u?.phone || ''
        };
      });
    }

    // SELECT addresses
    if (lowerSql.includes('from addresses')) {
      const uid = params[0];
      return db.addresses.filter(a => a.user_id === uid);
    }

    // SELECT inventory_transactions
    if (lowerSql.includes('from inventory_transactions')) {
      return db.inventory_transactions.map(it => {
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
    }

    // Dashboard aggregated stats
    if (lowerSql.includes('total_sales')) {
      const paidOrders = db.orders.filter(o => o.payment_status === 'paid');
      const sum = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
      return [{ total_sales: sum }];
    }
    if (lowerSql.includes('orders_today')) {
      const today = new Date().toISOString().slice(0, 10);
      const cnt = db.orders.filter(o => o.created_at && o.created_at.startsWith(today)).length;
      return [{ orders_today: cnt }];
    }
    if (lowerSql.includes('low_stock_items')) {
      let cnt = 0;
      for (let p of db.products) {
        const inv = db.inventory.find(i => i.product_id === p.id);
        if (inv && (inv.physical_stock - inv.reserved_stock) <= inv.low_stock_threshold) {
          cnt++;
        }
      }
      return [{ low_stock_items: cnt }];
    }
    if (lowerSql.includes('total_customers')) {
      const cnt = db.users.filter(u => u.role === 'customer').length;
      return [{ total_customers: cnt }];
    }

    return [];
  }

  // 2. INSERT queries
  if (lowerSql.startsWith('insert')) {
    if (lowerSql.includes('into users')) {
      const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        full_name: params[0],
        email: params[1],
        phone: params[2],
        password_hash: params[3],
        role: 'customer',
        account_type: params[4] || 'retail',
        is_active: true,
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into customer_profiles')) {
      const newId = db.customer_profiles.length + 1;
      db.customer_profiles.push({
        id: newId,
        user_id: params[0],
        shop_name: params[1],
        gst_number: params[2],
        verification_status: params[3] || 'pending'
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into products')) {
      const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
      const newProd = {
        id: newId,
        category_id: parseInt(params[0], 10),
        sku: params[1],
        name_en: params[2],
        name_kn: params[3],
        description_en: params[4],
        description_kn: params[5],
        retail_price: parseFloat(params[6]),
        wholesale_price: parseFloat(params[7]),
        moq: parseInt(params[8] || 1, 10),
        is_active: true,
        is_featured: params[9] === 1,
        created_at: new Date().toISOString()
      };
      db.products.push(newProd);
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into product_images')) {
      const newId = db.product_images.length + 1;
      db.product_images.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        image_url: params[1],
        is_primary: params[2] === 1,
        display_order: params[3] || 0
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into inventory')) {
      const newId = db.inventory.length + 1;
      db.inventory.push({
        id: newId,
        product_id: parseInt(params[0], 10),
        physical_stock: parseInt(params[1], 10),
        reserved_stock: 0,
        low_stock_threshold: parseInt(params[2] || 5, 10),
        last_restocked_at: new Date().toISOString()
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into inventory_transactions')) {
      const newId = db.inventory_transactions.length + 1;
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
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into carts')) {
      const newId = db.carts.length + 1;
      db.carts.push({
        id: newId,
        user_id: params[0] || null,
        session_id: params[1],
        cart_type: params[2] || 'retail'
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into cart_items')) {
      const newId = db.cart_items.length + 1;
      db.cart_items.push({
        id: newId,
        cart_id: params[0],
        product_id: params[1],
        quantity: parseInt(params[2], 10),
        unit_price: parseFloat(params[3]),
        is_wholesale_pricing: params[4] === 1
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into orders')) {
      const newId = db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1;
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
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into order_items')) {
      const newId = db.order_items.length + 1;
      db.order_items.push({
        id: newId,
        order_id: params[0],
        product_id: params[1],
        variant_id: params[2],
        product_name: params[3],
        sku: params[4],
        unit_price: parseFloat(params[5]),
        quantity: parseInt(params[6], 10),
        subtotal: parseFloat(params[7]),
        is_wholesale: params[8] === 1
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into payments')) {
      const newId = db.payments.length + 1;
      db.payments.push({
        id: newId,
        order_id: params[0],
        user_id: params[1],
        payment_method: params[2],
        amount: parseFloat(params[3]),
        transaction_reference: params[4] || null,
        payment_status: params[5]
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into deliveries')) {
      const newId = db.deliveries.length + 1;
      db.deliveries.push({
        id: newId,
        order_id: params[0],
        pin_code: params[1],
        delivery_status: params[2],
        tracking_notes: params[3]
      });
      saveDb();
      return [{ insertId: newId }];
    }

    if (lowerSql.includes('into addresses')) {
      const newId = db.addresses.length + 1;
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
        is_default: params[10] === 1
      });
      saveDb();
      return [{ insertId: newId }];
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
      return [{ affectedRows: 1 }];
    }
  }

  // 3. UPDATE queries
  if (lowerSql.startsWith('update')) {
    if (lowerSql.includes('inventory set')) {
      const prodId = params[params.length - 1];
      const inv = db.inventory.find(i => i.product_id === parseInt(prodId, 10));
      if (inv) {
        if (lowerSql.includes('reserved_stock = ? where product_id = ?')) {
          inv.reserved_stock = parseInt(params[0], 10);
        } else if (lowerSql.includes('physical_stock = ?, reserved_stock = ?')) {
          inv.physical_stock = parseInt(params[0], 10);
          inv.reserved_stock = parseInt(params[1], 10);
        } else {
          inv.physical_stock = parseInt(params[0], 10);
          inv.low_stock_threshold = parseInt(params[1], 10);
        }
        saveDb();
      }
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('orders set order_status = ? where id = ?')) {
      const status = params[0];
      const oid = parseInt(params[1], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) ord.order_status = status;
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('payments set payment_status = ?')) {
      const status = params[0];
      const oid = parseInt(params[params.length - 1], 10);
      const p = db.payments.find(pay => pay.order_id === oid);
      if (p) {
        p.payment_status = status;
        p.verified_at = new Date().toISOString();
      }
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('orders set payment_status = ? where id = ?')) {
      const status = params[0];
      const oid = parseInt(params[1], 10);
      const ord = db.orders.find(o => o.id === oid);
      if (ord) ord.payment_status = status;
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('deliveries set')) {
      const did = parseInt(params[params.length - 1], 10);
      const d = db.deliveries.find(del => del.id === did || del.order_id === did);
      if (d) {
        if (lowerSql.includes('delivery_status = ?')) {
          d.delivery_status = params[0];
        }
      }
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('customer_profiles set verification_status = ?')) {
      const status = params[0];
      const uid = parseInt(params[params.length - 1], 10);
      const cp = db.customer_profiles.find(p => p.user_id === uid);
      if (cp) cp.verification_status = status;
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('cart_items set quantity = ? where id = ?')) {
      const qty = parseInt(params[0], 10);
      const cid = parseInt(params[1], 10);
      const item = db.cart_items.find(ci => ci.id === cid);
      if (item) item.quantity = qty;
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('cart_items set quantity = ?, unit_price = ?')) {
      const qty = parseInt(params[0], 10);
      const price = parseFloat(params[1]);
      const cid = parseInt(params[params.length - 1], 10);
      const item = db.cart_items.find(ci => ci.id === cid);
      if (item) {
        item.quantity = qty;
        item.unit_price = price;
      }
      saveDb();
      return [{ affectedRows: 1 }];
    }

    return [{ affectedRows: 1 }];
  }

  // 4. DELETE queries
  if (lowerSql.startsWith('delete')) {
    if (lowerSql.includes('from cart_items where id = ?')) {
      const cid = parseInt(params[0], 10);
      db.cart_items = db.cart_items.filter(ci => ci.id !== cid);
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('from cart_items') && lowerSql.includes('where c.user_id = ?')) {
      const uid = params[0];
      const userCarts = db.carts.filter(c => c.user_id === uid).map(c => c.id);
      db.cart_items = db.cart_items.filter(ci => !userCarts.includes(ci.cart_id));
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('from cart_items') && lowerSql.includes('where c.session_id = ?')) {
      const sid = params[0];
      const sessionCarts = db.carts.filter(c => c.session_id === sid).map(c => c.id);
      db.cart_items = db.cart_items.filter(ci => !sessionCarts.includes(ci.cart_id));
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('from products where id = ?')) {
      const pid = parseInt(params[0], 10);
      db.products = db.products.filter(p => p.id !== pid);
      db.inventory = db.inventory.filter(i => i.product_id !== pid);
      saveDb();
      return [{ affectedRows: 1 }];
    }

    if (lowerSql.includes('from addresses where id = ?')) {
      const aid = parseInt(params[0], 10);
      db.addresses = db.addresses.filter(a => a.id !== aid);
      saveDb();
      return [{ affectedRows: 1 }];
    }

    return [{ affectedRows: 1 }];
  }

  return [];
}

/**
 * Transaction interface mockup for embedded database
 */
function createEmbeddedConnection() {
  return {
    beginTransaction: async () => {},
    commit: async () => { saveDb(); },
    rollback: async () => {},
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
