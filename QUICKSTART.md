# Quick Start Guide

## Prerequisites
- Node.js installed (v14+)
- MongoDB running locally or MongoDB Atlas account

## Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/salesdb
JWT_SECRET=your_secret_key_change_in_production
PORT=5000
```

Start backend:
```bash
npm start
```

Backend runs on: http://localhost:5000

## Step 2: Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm start
```

Frontend runs on: http://localhost:3000

## Step 3: First Use

1. Open http://localhost:3000
2. Click "Don't have an account? Register"
3. Register a new account
4. Login with your credentials
5. To make yourself admin, update the database:
   ```javascript
   // In MongoDB shell or Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
6. Upload the sample CSV file (`sample-sales.csv`) from the root directory

## Testing the Application

1. **Login/Register**: Test user authentication
2. **View Dashboard**: See analytics (empty initially)
3. **Upload CSV** (Admin only): Use `sample-sales.csv` provided
4. **View Charts**: After uploading data, see visualizations

## Sample CSV Format

The CSV should have these columns:
- product
- amount
- date (YYYY-MM-DD format)
- region
- customer

Example:
```csv
product,amount,date,region,customer
Laptop,1200,2024-01-15,North,John Doe
Mouse,25,2024-01-16,South,Jane Smith
```

## Troubleshooting

- **Port 5000 already in use**: Change PORT in backend `.env`
- **MongoDB connection error**: Ensure MongoDB is running
- **CORS errors**: Check backend is running on port 5000
- **Module not found**: Run `npm install` in both directories

