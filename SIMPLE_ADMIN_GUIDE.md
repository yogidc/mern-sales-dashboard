# Simple Guide: How to Become Admin

## Method 1: Use the Dashboard Button (Easiest!)

1. **Login to the dashboard**
2. **Scroll to the "Upload CSV File" section**
3. **Click the button: "Make Me Admin (If No Admin Exists)"**
4. **Enter your email and password when prompted**
5. **Logout and login again**

This only works if no admin exists yet. If an admin already exists, use Method 2 or 3.

## Method 2: Use the Script

1. **Open terminal/command prompt**
2. **Navigate to project root:**
   ```bash
   cd C:\Users\LENOVO\Downloads\fiml
   ```
3. **Run the script with your email:**
   ```bash
   node make-admin.js your-email@example.com
   ```
   Replace `your-email@example.com` with your actual registered email.

4. **Logout and login again**

## Method 3: Using MongoDB Compass (Visual)

1. **Download MongoDB Compass:** https://www.mongodb.com/products/compass
2. **Install and open it**
3. **Connect to your database:**
   - Connection string: `mongodb://localhost:27017/salesdb`
   - Click "Connect"
4. **Navigate to `salesdb` database**
5. **Click on `users` collection**
6. **Find your user document** (look for your email)
7. **Click the edit/pencil icon**
8. **Find the `role` field and change it from `"viewer"` to `"admin"`**
9. **Click "Update"**
10. **Logout and login again in the app**

## Method 4: Using MongoDB Shell

1. **Open terminal/command prompt**
2. **Connect to MongoDB:**
   ```bash
   mongosh mongodb://localhost:27017/salesdb
   ```
3. **Run this command** (replace with your email):
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
4. **You should see:** `{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }`
5. **Logout and login again**

## Method 5: Register as First User (Automatic Admin)

If you haven't registered yet:
1. **Register a new account** - the first user is automatically made admin!
2. **You're done!** Just login and you'll have admin access.

## Verify You're Admin

After making yourself admin:
1. **Logout** from the dashboard
2. **Login again** (this refreshes your role)
3. **Check the top right** - it should say "Role: admin"
4. **The CSV upload section** should now be fully enabled

## Troubleshooting

### "An admin already exists"
- Someone else is already admin
- Ask them to make you admin, or
- Use MongoDB to manually change your role

### Script says "User not found"
- Check your email spelling
- Make sure you've registered first
- The script will show all available users

### Still shows "viewer" after making admin
- Make sure you **logout and login again**
- Clear browser cache if needed
- Check MongoDB that the role was actually updated

### Can't connect to MongoDB
- Make sure MongoDB is running
- Check connection string is correct
- For MongoDB Atlas, use your Atlas connection string

