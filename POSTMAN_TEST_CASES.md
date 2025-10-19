# Postman Test Cases for Red Ball Cricket Academy API

## Base URL
```
http://localhost:8000
```

---

## 1. Authentication Tests

### 1.1 Register User
**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/register/`  
**Headers:**
```json
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User"
}
```
**Expected Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "is_staff": false
}
```

**Save the token!** You'll need it for authenticated requests.

---

### 1.2 Login User
**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/login/`  
**Headers:**
```json
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "username": "testuser",
  "password": "password123"
}
```
**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "is_staff": false
}
```

---

### 1.3 Register Admin User (via Django Admin or Shell)
First create an admin user via Django shell:
```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

Then login as admin:
**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/login/`  
**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## 2. Sports Management (Admin/User)

### 2.1 List All Sports
**Method:** `GET`  
**URL:** `http://localhost:8000/api/sports/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Cricket",
    "description": "Professional cricket training",
    "hourly_rate": "500.00",
    "is_active": true,
    "created_at": "2025-10-18T10:00:00Z"
  }
]
```

---

### 2.2 Create Sport (Admin Only)
**Method:** `POST`  
**URL:** `http://localhost:8000/api/sports/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "name": "Cricket",
  "description": "Professional cricket coaching and practice sessions",
  "hourly_rate": "500.00",
  "is_active": true
}
```
**Expected Response (201 Created):**
```json
{
  "id": 1,
  "name": "Cricket",
  "description": "Professional cricket coaching and practice sessions",
  "hourly_rate": "500.00",
  "is_active": true,
  "created_at": "2025-10-18T10:00:00Z"
}
```

---

### 2.3 Get Sport Details
**Method:** `GET`  
**URL:** `http://localhost:8000/api/sports/1/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```

---

### 2.4 Update Sport (Admin Only)
**Method:** `PUT` or `PATCH`  
**URL:** `http://localhost:8000/api/sports/1/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body:**
```json
{
  "name": "Cricket Training",
  "hourly_rate": "600.00"
}
```

---

### 2.5 Get Available Slots for Sport
**Method:** `GET`  
**URL:** `http://localhost:8000/api/sports/1/available_slots/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```

---

## 3. Slots Management

### 3.1 List All Slots
**Method:** `GET`  
**URL:** `http://localhost:8000/api/slots/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```

---

### 3.2 List Available Slots Only
**Method:** `GET`  
**URL:** `http://localhost:8000/api/slots/available/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```

---

### 3.3 Create Slot (Admin Only)
**Method:** `POST`  
**URL:** `http://localhost:8000/api/slots/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "sport": 1,
  "date": "2025-10-20",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "max_players": 10,
  "is_booked": false
}
```
**Expected Response (201 Created):**
```json
{
  "id": 1,
  "sport": 1,
  "sport_name": "Cricket",
  "date": "2025-10-20",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "max_players": 10,
  "current_players": 0,
  "is_booked": false,
  "is_available": true,
  "created_at": "2025-10-18T10:00:00Z"
}
```

---

### 3.4 Update Slot (Admin Only)
**Method:** `PATCH`  
**URL:** `http://localhost:8000/api/slots/1/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body:**
```json
{
  "max_players": 15
}
```

---

### 3.5 Delete Slot (Admin Only)
**Method:** `DELETE`  
**URL:** `http://localhost:8000/api/slots/1/`  
**Headers:**
```json
Authorization: Token ADMIN_TOKEN_HERE
```

---

## 4. Bookings Management

### 4.1 Create Booking
**Method:** `POST`  
**URL:** `http://localhost:8000/api/bookings/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "slot": 1,
  "players": [
    {
      "name": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    {
      "name": "Jane Smith",
      "mobile": "9876543211",
      "email": "jane@example.com"
    }
  ],
  "total_amount": "1000.00",
  "payment_method": "razorpay"
}
```
**Expected Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "slot": 1,
  "booking_date": "2025-10-18T10:30:00Z",
  "total_amount": "1000.00",
  "payment_status": "pending",
  "payment_method": "razorpay",
  "is_cancelled": false,
  "players": [
    {
      "id": 1,
      "name": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    }
  ]
}
```

---

### 4.2 Get My Bookings
**Method:** `GET`  
**URL:** `http://localhost:8000/api/bookings/my_bookings/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "slot": {
      "id": 1,
      "sport_name": "Cricket",
      "date": "2025-10-20",
      "start_time": "09:00:00",
      "end_time": "10:00:00"
    },
    "booking_date": "2025-10-18T10:30:00Z",
    "total_amount": "1000.00",
    "payment_status": "completed",
    "is_cancelled": false,
    "players_count": 2
  }
]
```

---

### 4.3 List All Bookings (Admin Only)
**Method:** `GET`  
**URL:** `http://localhost:8000/api/bookings/`  
**Headers:**
```json
Authorization: Token ADMIN_TOKEN_HERE
```

---

### 4.4 Cancel Booking
**Method:** `POST`  
**URL:** `http://localhost:8000/api/bookings/1/cancel/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully"
}
```

---

## 5. Player Management

### 5.1 Get My Player Profile
**Method:** `GET`  
**URL:** `http://localhost:8000/api/players/my_profile/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "qr_code": "PLAYER_1_2025_10_20",
  "created_at": "2025-10-18T10:30:00Z"
}
```

---

### 5.2 Get QR Code
**Method:** `GET`  
**URL:** `http://localhost:8000/api/players/qr_code/`  
**Headers:**
```json
Authorization: Token YOUR_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
{
  "qr_code": "PLAYER_1_2025_10_20",
  "booking": {
    "id": 1,
    "date": "2025-10-20",
    "slot": "09:00 AM - 10:00 AM",
    "sport": "Cricket"
  }
}
```

---

### 5.3 List All Players (Admin Only)
**Method:** `GET`  
**URL:** `http://localhost:8000/api/players/`  
**Headers:**
```json
Authorization: Token ADMIN_TOKEN_HERE
```

---

## 6. QR Code Scanning (Admin Only)

### 6.1 Scan QR Code for Check-In
**Method:** `POST`  
**URL:** `http://localhost:8000/api/scan-qr/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "qr_code": "PLAYER_1_2025_10_20",
  "action": "check_in"
}
```
**Expected Response (200 OK):**
```json
{
  "message": "Check-in successful",
  "player": "John Doe",
  "time": "2025-10-20T09:05:00Z"
}
```

---

### 6.2 Scan QR Code for Check-Out
**Method:** `POST`  
**URL:** `http://localhost:8000/api/scan-qr/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token ADMIN_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "qr_code": "PLAYER_1_2025_10_20",
  "action": "check_out"
}
```

---

## 7. Dashboard Statistics (Admin Only)

### 7.1 Get Dashboard Stats
**Method:** `GET`  
**URL:** `http://localhost:8000/api/dashboard-stats/`  
**Headers:**
```json
Authorization: Token ADMIN_TOKEN_HERE
```
**Expected Response (200 OK):**
```json
{
  "total_bookings": 25,
  "today_bookings": 5,
  "total_revenue": "50000.00",
  "active_sports": 3,
  "total_players": 50,
  "upcoming_slots": 10
}
```

---

## 8. Payment Integration (Razorpay)

### 8.1 Create Payment Order
**Method:** `POST`  
**URL:** `http://localhost:8000/api/bookings/1/create_payment/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "amount": "1000.00"
}
```
**Expected Response (200 OK):**
```json
{
  "order_id": "order_xyz123",
  "amount": "1000.00",
  "currency": "INR",
  "razorpay_key": "rzp_test_xxxxx"
}
```

---

### 8.2 Verify Payment
**Method:** `POST`  
**URL:** `http://localhost:8000/api/bookings/1/verify_payment/`  
**Headers:**
```json
Content-Type: application/json
Authorization: Token YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "razorpay_payment_id": "pay_xyz123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_xyz"
}
```

---

## Quick Test Sequence

### Setup Sequence:
1. **Register User** → Get token
2. **Create Admin** (via Django shell)
3. **Login as Admin** → Get admin token
4. **Create Sport** (as admin)
5. **Create Slots** (as admin)

### User Flow:
1. **Login** → Get token
2. **List Sports** → See available sports
3. **Get Available Slots** → Find slots for a sport
4. **Create Booking** → Book a slot with players
5. **Get My Bookings** → Verify booking created

### Player Flow:
1. **Get My Profile** → Player details
2. **Get QR Code** → QR code for today's booking

### Admin Flow:
1. **Scan QR Code** → Check-in player
2. **Get Dashboard Stats** → View statistics
3. **List All Bookings** → Monitor all bookings

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Username, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Postman Collection JSON

You can import this into Postman to have all tests ready:

Save as `red_ball_cricket_academy.postman_collection.json`:

```json
{
  "info": {
    "name": "Red Ball Cricket Academy API",
    "description": "API endpoints for Red Ball Cricket Academy",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "admin_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"testuser@example.com\",\n  \"password\": \"password123\",\n  \"first_name\": \"Test\",\n  \"last_name\": \"User\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register/",
              "host": ["{{base_url}}"],
              "path": ["auth", "register", ""]
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login/",
              "host": ["{{base_url}}"],
              "path": ["auth", "login", ""]
            }
          }
        }
      ]
    },
    {
      "name": "Sports",
      "item": [
        {
          "name": "List Sports",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Token {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/sports/",
              "host": ["{{base_url}}"],
              "path": ["sports", ""]
            }
          }
        },
        {
          "name": "Create Sport",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Token {{admin_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Cricket\",\n  \"description\": \"Professional cricket coaching\",\n  \"hourly_rate\": \"500.00\",\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "{{base_url}}/sports/",
              "host": ["{{base_url}}"],
              "path": ["sports", ""]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Tips for Testing

1. **Save Tokens**: After login/register, copy the token and use it in subsequent requests
2. **Test in Order**: Follow the setup sequence first
3. **Check Response Status**: 200/201 = success, 400/401/403/404 = errors
4. **Use Variables**: In Postman, create environment variables for `base_url`, `token`, `admin_token`
5. **Watch Backend Logs**: Keep Django terminal open to see request logs

---

Let me know if you need any specific test case explained!
