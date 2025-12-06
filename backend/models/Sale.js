const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: { 
    type: String, 
    required: true,
    trim: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  region: { 
    type: String, 
    required: true,
    trim: true
  },
  customer: { 
    type: String, 
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
saleSchema.index({ date: 1 });
saleSchema.index({ region: 1 });

module.exports = mongoose.model('Sale', saleSchema);

