# Player Features - Quick Start Guide

## 🎯 What's Implemented

### ✅ Part 1: Automatic Player Account Creation

When an organizer books a slot and adds players:
1. **Backend automatically creates accounts** for each player
2. **Default password**: `redball` (hardcoded as requested)
3. **Welcome email sent** with:
   - Login credentials (email + password)
   - Booking details (sport, date, time)
   - Instructions to change password

### ✅ Part 2: Player Login & Booking Details

Players can:
1. **Login** using email + password `redball`
2. **View bookings** with complete details:
   - Sport name
   - Date and time
   - Organizer information
   - Booking ID
   - Check-in status
3. **Access QR code** for check-in/out
4. **Change password** for security

---

## 📱 Frontend Screens Created

### 1. **Player Dashboard** (`src/screens/player/PlayerDashboardScreen.tsx`)
- Shows player name, email, and ID
- Displays current check-in status (In/Out)
- Shows booking details (sport, date, time, organizer)
- Large QR code display for check-in
- Buttons: Refresh Status, Toggle Check In/Out
- Usage instructions

### 2. **Player Bookings** (`src/screens/player/PlayerBookingsScreen.tsx`)
- Lists all bookings for the player
- Shows sport, date, time for each booking
- Displays organizer information
- Status badges (Checked In/Out/Registered)
- "TODAY" badge for current bookings
- View QR code button
- Pull-to-refresh

### 3. **Navigation Updated** (`src/navigation/index.tsx`)
- Added Player Tab Navigator with 2 tabs:
  - Dashboard (home with QR)
  - My Bookings (list view)
- Auto-routes players to PlayerTab after login

---

## 🔧 Backend APIs Used

### Player Authentication
```
POST /api/auth/jwt_login/
Body: {"email": "player@example.com", "password": "redball"}
Response: {access: "token", user: {...}, user_type: "player"}
```

### Get Player Bookings
```
GET /api/players/me/
Headers: Authorization: Bearer {token}
Response: {
  id, name, email, booking, qr_code_url,
  booking_details: {sport, slot_date, start_time, end_time}
}
```

### Add Players to Booking
```
POST /api/bookings/{id}/add_players/
Body: {players: [{name, email, phone}, ...]}
Response: {success: true, message: "...", players: [...]}
```

---

## 🚀 How to Test

### 1. Create a Player Account (via Organizer)

1. **Login as user/organizer**:
   ```
   Email: your-user@example.com
   Password: your-password
   ```

2. **Book a slot**:
   - Select sport
   - Choose time slot
   - Make payment

3. **Add players**:
   - Go to "My Bookings"
   - Select the booking
   - Click "Add Players"
   - Fill form:
     - Name: Test Player
     - Email: testplayer@example.com
     - Phone: 1234567890
   - Submit

4. **Backend automatically**:
   - Creates account with email `testplayer@example.com`
   - Sets password to `redball`
   - Sends welcome email
   - Generates QR code

### 2. Login as Player

1. **Logout from organizer account**

2. **Login with player credentials**:
   ```
   Email: testplayer@example.com
   Password: redball
   ```

3. **App routes to Player Dashboard**

### 3. View Player Features

1. **Dashboard Tab**:
   - See welcome message
   - Check status (Registered/Checked In/Out)
   - View booking details
   - See QR code
   - Try "Refresh Status"

2. **My Bookings Tab**:
   - See list of all bookings
   - Check dates and times
   - View organizer email
   - Pull down to refresh

### 4. Change Password

1. Go to Settings/Profile
2. Click "Change Password"
3. Enter:
   - Current: `redball`
   - New: `yourNewPassword123`
4. Save

---

## 📋 File Structure

```
frontend/src/
├── screens/
│   ├── player/
│   │   ├── PlayerDashboardScreen.tsx       ✅ NEW
│   │   ├── PlayerBookingsScreen.tsx        ✅ NEW
│   │   └── PlayerQRScreen.tsx             (existing)
│   ├── user/
│   │   ├── AddPlayersScreen.tsx           (existing - uses AddPlayersForm)
│   │   └── MyBookingsScreen.tsx           (existing)
│   └── LoginScreen.tsx                     ✅ UPDATED (routes players)
├── components/
│   └── AddPlayersForm.tsx                  ✅ UPDATED (triggers account creation)
├── navigation/
│   └── index.tsx                           ✅ UPDATED (added PlayerTab)
└── services/
    ├── auth.service.ts                     (existing - handles login)
    └── api.service.ts                      (existing - API calls)

backend/core/
├── models.py                               ✅ SIGNAL (auto-creates accounts)
├── views.py                                ✅ ENDPOINTS (player APIs)
└── serializers.py                          (serializes data)
```

---

## 🎓 Usage Examples

### Example 1: Cricket Team Booking

**Scenario**: John books cricket for his team

1. **John (Organizer)**:
   - Logs in
   - Books cricket slot for tomorrow 9-11 AM
   - Adds 5 players with emails
   
2. **Backend**:
   - Creates 5 player accounts
   - Password: `redball` for all
   - Sends 5 welcome emails
   - Generates 5 QR codes

3. **Players (Mike, Sarah, Tom, Lisa, Emma)**:
   - Each receives email
   - Login with their email + `redball`
   - See tomorrow's cricket booking
   - View John's email as organizer
   - Have QR codes ready

4. **Tomorrow at Academy**:
   - Players show QR codes
   - Admin scans each for check-in
   - Status updates to "Checked In"
   - When leaving, scan again for check-out

### Example 2: Tennis Doubles

**Scenario**: Lisa books tennis doubles

1. **Lisa**:
   - Books tennis court for Friday 2-3 PM
   - Adds 3 players (herself + 3 partners)

2. **Backend**:
   - Creates 3 accounts (Lisa already has one)
   - Emails credentials to new players

3. **All 4 Players**:
   - Login to app
   - See Friday's tennis booking
   - Check organizer is Lisa
   - QR codes ready for Friday

---

## 🐛 Troubleshooting

### Player Can't Login
**Issue**: Email/password not working

**Check**:
1. Was player added to a booking?
2. Check backend logs for account creation
3. Verify email sent successfully
4. Try exact email from database
5. Password is `redball` (lowercase)

**Solution**:
```python
# Django shell
python manage.py shell
from core.models import Player, CustomUser
player = Player.objects.filter(email='player@example.com').first()
print(f"Player: {player}")
print(f"User: {player.user}")
print(f"User email: {player.user.email}")
# Reset password
player.user.set_password('redball')
player.user.save()
```

### Player Sees No Bookings
**Issue**: My Bookings tab is empty

**Check**:
1. Was player actually added to a booking?
2. Is backend running?
3. Check API endpoint `/players/me/`
4. Check authentication token

**Solution**:
- Pull down to refresh
- Logout and login again
- Check Metro bundler console for errors
- Verify JWT token in AsyncStorage

### QR Code Not Displaying
**Issue**: QR code shows error or blank

**Check**:
1. Was QR code generated on backend?
2. Check `player.qr_code` field
3. Check media files serving
4. Try toggling QR display mode

**Solution**:
- Use "Use Generated QR" toggle
- Refresh the dashboard
- Check backend media settings
- Regenerate QR via admin

---

## 📞 Support Files

1. **PLAYER_GUIDE.md** - Complete user guide for players
2. **AUTOMATIC_PLAYER_ACCOUNT_CREATION.md** - Technical docs
3. **PLAYER_SYSTEM_IMPLEMENTATION.md** - Full implementation summary

---

## ✅ Checklist

- [x] Backend signal creates accounts automatically
- [x] Default password set to "redball"
- [x] Welcome emails sent with credentials
- [x] Player login works
- [x] Player Dashboard shows booking details
- [x] Player Bookings list displays all bookings
- [x] QR codes visible and working
- [x] Organizer info displayed
- [x] Status tracking (In/Out)
- [x] Navigation updated for players
- [x] Pull-to-refresh works
- [x] Password change available

---

**Everything is ready! Start the emulator and test the player features! 🚀**

### Quick Test Command:
```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run android
```

Then:
1. Login as user → Book slot → Add players
2. Logout → Login as player with "redball"
3. Enjoy the player features! 🏏
