# Restart Backend Server

The backend server needs to be restarted to apply the changes that allow anyone to upload CSV files.

## Steps to Restart:

1. **Stop the current backend server:**
   - Go to the terminal where the backend is running
   - Press `Ctrl + C` to stop it

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Start the server again:**
   ```bash
   npm start
   ```
   
   Or if you're using nodemon:
   ```bash
   npm run dev
   ```

4. **Verify it's running:**
   - You should see: "Server running on port 5000"
   - You should see: "MongoDB connected"

5. **Try uploading CSV again:**
   - Go to the dashboard
   - Upload your CSV file
   - It should work now without admin access!

## Quick Check:

After restarting, the upload route should work for any authenticated user. If you still get "Admin access required", make sure:
- The backend server was actually restarted
- You're using the correct endpoint: `/api/sales/upload`
- You're logged in (have a valid token)

