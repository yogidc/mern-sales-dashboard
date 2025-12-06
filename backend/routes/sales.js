const express = require('express');
const Sale = require('../models/Sale');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all sales (protected)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, region, startDate, endDate } = req.query;
    const query = {};

    if (region) query.region = region;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload sales data (any authenticated user)
router.post('/upload', auth, async (req, res) => {
  try {
    console.log('CSV upload request received from user:', req.user.email, 'Role:', req.user.role);
    const { sales } = req.body;

    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ error: 'Sales data array is required' });
    }

    // Validate and format sales data
    const formattedSales = sales.map(sale => ({
      product: sale.product || sale.Product,
      amount: parseFloat(sale.amount || sale.Amount || sale.amount || 0),
      date: sale.date ? new Date(sale.date) : new Date(),
      region: sale.region || sale.Region,
      customer: sale.customer || sale.Customer
    })).filter(sale => sale.product && sale.region && sale.customer);

    if (formattedSales.length === 0) {
      return res.status(400).json({ error: 'No valid sales data found' });
    }

    await Sale.insertMany(formattedSales);
    res.json({ 
      message: `${formattedSales.length} sales records uploaded successfully`,
      count: formattedSales.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create single sale (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sale (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sale (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monthly analytics
router.get('/analytics/monthly', auth, async (req, res) => {
  try {
    const monthly = await Sale.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = monthly.map(item => ({
      month: monthNames[item._id - 1],
      monthNumber: item._id,
      total: item.total,
      count: item.count
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regional analytics
router.get('/analytics/regional', auth, async (req, res) => {
  try {
    const regional = await Sale.aggregate([
      {
        $group: {
          _id: '$region',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(regional);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product analytics
router.get('/analytics/products', auth, async (req, res) => {
  try {
    const products = await Sale.aggregate([
      {
        $group: {
          _id: '$product',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Overall stats
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageSale: { $avg: '$amount' },
          minSale: { $min: '$amount' },
          maxSale: { $max: '$amount' }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

