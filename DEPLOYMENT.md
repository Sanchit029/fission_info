# Environment Variables Setup Guide

## 🚀 Vercel (Frontend) - Environment Variables

Add these in your Vercel project settings (Settings > Environment Variables):

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

**Important**: Replace `your-render-backend-url` with your actual Render backend URL after deployment.

---

## 🚀 Render (Backend) - Environment Variables

Add these in your Render Web Service settings (Environment tab):

### Required Variables:

```
NODE_ENV=production
```

```
PORT=5001
```

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eventify?retryWrites=true&w=majority
```
**Get from**: [MongoDB Atlas](https://cloud.mongodb.com)
- Create free cluster
- Database > Connect > Drivers
- Replace `<username>`, `<password>`, and cluster URL

```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
**Generate**: Use a strong random string (32+ characters)
Example: `eventify-production-jwt-secret-2024-ab34cd56ef78gh90`

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
```
**Get from**: [Cloudinary Dashboard](https://console.cloudinary.com)

```
CLOUDINARY_API_KEY=123456789012345
```
**Get from**: Cloudinary Dashboard

```
CLOUDINARY_API_SECRET=your-api-secret
```
**Get from**: Cloudinary Dashboard

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```
**Important**: Replace with your Vercel deployment URL

### Optional (for AI features - FREE):

```
GEMINI_API_KEY=your-gemini-api-key
```
**Get from**: [Google AI Studio](https://aistudio.google.com/app/apikey)
**Note**: FREE with generous limits! No payment required.

---

## 📝 Quick Setup Checklist

### 1. MongoDB Atlas (Free)
- [x] Sign up at https://cloud.mongodb.com
- [x] Create a free M0 cluster
- [x] Create database user (Database Access)
- [x] Whitelist all IPs: `0.0.0.0/0` (Network Access)
- [x] Get connection string (Database > Connect > Drivers)

### 2. Cloudinary (Free)
- [x] Sign up at https://cloudinary.com
- [x] Get credentials from Dashboard
- [x] Note: Cloud name, API key, API secret

### 3. Google Gemini (Optional - FREE)
- [x] Go to https://aistudio.google.com/app/apikey
- [x] Sign in with Google account
- [x] Click "Get API Key"
- [x] Note: Completely FREE with generous rate limits!

---

## 🔄 Deployment Order

1. **Deploy Backend to Render first**
   - Get the Render URL (e.g., `https://eventify-api-xxx.onrender.com`)
   
2. **Update Vercel Frontend**
   - Set `VITE_API_URL` to your Render backend URL + `/api`
   
3. **Update Render Backend**
   - Set `FRONTEND_URL` to your Vercel frontend URL

4. **Redeploy both** if needed for CORS to work properly

---

## ⚠️ Common Issues

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your exact Vercel URL
- No trailing slash in URLs

### Database Connection Failed
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify username/password in connection string
- Make sure special characters in password are URL-encoded

### Images Not Uploading
- Verify all 3 Cloudinary variables are correct
- Check Cloudinary account is active

### AI Not Working
- Gemini API key is valid (get from https://aistudio.google.com/app/apikey)
- Check API key has no extra spaces
- If no API key, AI features will show error but app works fine

---

## 📧 Need Help?

Check the main README.md for detailed deployment instructions or raise an issue on GitHub.
