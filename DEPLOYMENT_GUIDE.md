# Red Ball Cricket Academy - Deployment Guide

## 🚀 Backend Deployment (Django)

### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. **Push your code to GitHub:**
   ```bash
   cd backend
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account:**
   - Go to https://render.com and sign up
   - Connect your GitHub account

3. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `redball-cricket-db`
   - Choose Free plan
   - Click "Create Database"
   - Copy the "Internal Database URL" (starts with `postgresql://`)

4. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder (or root if backend is at root)
   - Settings:
     - Name: `redball-cricket-backend`
     - Environment: `Python 3`
     - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
     - Start Command: `gunicorn redball_academy.wsgi:application`
     - Choose Free plan

5. **Add Environment Variables:**
   Go to "Environment" tab and add:
   ```
   SECRET_KEY=your-random-secret-key-generate-new-one
   DEBUG=False
   ALLOWED_HOSTS=.onrender.com
   DATABASE_URL=<paste-internal-database-url-from-step-3>
   RAZORPAY_KEY_ID=rzp_test_wP9SAvAW48CSjE
   RAZORPAY_KEY_SECRET=xBjIFw9mg7hDNUeBsCwNZ74i
   EMAIL_HOST_USER=indaish2716@gmail.com
   EMAIL_HOST_PASSWORD=pewgknkvtlttfddl
   DEFAULT_FROM_EMAIL=indaish2716@gmail.com
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend will be live at: `https://your-app-name.onrender.com`

7. **Create Superuser (Admin):**
   - Go to Render dashboard → Shell
   - Run: `python manage.py createsuperuser`
   - Follow prompts to create admin account

### Option 2: Deploy to Railway

1. **Push to GitHub** (same as above)

2. **Deploy:**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Django and create PostgreSQL

3. **Environment Variables:**
   Add the same variables as Render (Railway auto-provides DATABASE_URL)

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create redball-cricket-academy

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set RAZORPAY_KEY_ID=rzp_test_wP9SAvAW48CSjE
heroku config:set RAZORPAY_KEY_SECRET=xBjIFw9mg7hDNUeBsCwNZ74i

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

---

## 📱 Frontend Deployment (React Native)

### Update Production URL

1. **Edit `frontend/src/config/api.ts`:**
   - Update `PROD_URL` to your backend URL:
   ```typescript
   const PROD_URL = 'https://your-backend-url.onrender.com';
   ```

### Build Android APK

1. **Update version in `android/app/build.gradle`:**
   ```gradle
   versionCode 1
   versionName "1.0.0"
   ```

2. **Generate release keystore:**
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configure signing in `android/gradle.properties`:**
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-password
   ```

4. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

5. **Build AAB (for Play Store):**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Deploy to Google Play Store

1. Create Google Play Developer account ($25 one-time fee)
2. Create new app in Play Console
3. Upload AAB file
4. Fill in app details, screenshots, privacy policy
5. Submit for review

---

## ✅ Post-Deployment Checklist

### Backend
- [ ] Database migrations completed
- [ ] Static files collected
- [ ] Admin superuser created
- [ ] Test admin login at `/admin`
- [ ] Test API endpoints
- [ ] CORS configured correctly
- [ ] Environment variables set

### Frontend
- [ ] Production URL updated
- [ ] APK/AAB built successfully
- [ ] Razorpay payment tested in production
- [ ] App connects to production backend
- [ ] QR code generation working

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
- Check DATABASE_URL format: `postgresql://user:password@host:5432/dbname`
- Ensure PostgreSQL is running on hosting platform

**Static Files Not Loading:**
- Run: `python manage.py collectstatic --no-input`
- Check STATIC_ROOT and STATIC_URL in settings.py

**500 Internal Server Error:**
- Check logs: `heroku logs --tail` or Render logs
- Ensure DEBUG=False and SECRET_KEY is set

### Frontend Issues

**Cannot Connect to Backend:**
- Check PROD_URL in `api.ts`
- Ensure backend CORS allows your frontend domain
- Check network connectivity

**Razorpay Not Working:**
- Verify Razorpay keys are correct
- Check if you're using test or live keys
- Ensure `react-native-razorpay` is properly linked

---

## 📊 Monitoring

### Backend Monitoring
- Render: Built-in metrics and logs
- Railway: Dashboard metrics
- Heroku: `heroku logs --tail`

### Database Backups
- Render: Manual backups in dashboard
- Railway: Automatic backups
- Heroku: `heroku pg:backups:capture`

---

## 🔐 Security Recommendations

1. **Change SECRET_KEY** for production
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** (Render/Railway/Heroku do this automatically)
4. **Regular backups** of PostgreSQL database
5. **Monitor error logs** regularly
6. **Update dependencies** periodically
7. **Use strong passwords** for admin accounts

---

## 📝 Notes

- Free tier on Render: App sleeps after 15 min inactivity (spins up in ~30 seconds)
- PostgreSQL free tier: 1GB storage
- For production, consider upgrading to paid tier for better performance
- Test payment gateway thoroughly before going live
- Have a rollback plan if deployment fails

---

**Your backend is already configured for production deployment!**
Just follow the steps above and you'll be live in minutes.
