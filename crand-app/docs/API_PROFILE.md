# Profile API Documentation

## Overview
The Profile API allows authenticated users to retrieve and update their own profile information. It supports role-based data integration, merging data from the generic `users` collection and role-specific collections (e.g., `teachers` for staff/employees).

## Endpoints

### 1. GET /api/auth/profile

Retrieves the current user's profile data.

**Authentication:** Required (Session Cookie)

**Response:**
- `200 OK`: Returns the profile object.
- `401 Unauthorized`: If not logged in.
- `404 Not Found`: If user record does not exist.

**Response Body Example:**
```json
{
  "_id": "65abcdef1234567890abcdef",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "manager",
  "phone_number": "08123456789",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-06-01T00:00:00.000Z",
  "address": "Jl. Sudirman No. 1",
  "start_work_date": "2023-02-01T00:00:00.000Z",
  "position": "Manager Operasional",
  "department": "Operasional",
  "nip": "1234567890",
  "profile_picture": "data:image/jpeg;base64,..."
}
```

### 2. PUT /api/auth/profile

Updates the current user's profile data.

**Authentication:** Required (Session Cookie)

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.new@example.com",
  "phone_number": "08123456789",
  "address": "Jl. Thamrin No. 10",
  "profile_picture": "data:image/jpeg;base64,...",
  "nip": "1234567890"
}
```
*Note: `nip` update is supported but typically restricted in UI for non-admins, though the API allows it if needed.*

**Response:**
- `200 OK`: `{ "message": "Profile updated successfully" }`
- `401 Unauthorized`: If not logged in.
- `404 Not Found`: If user record does not exist.
- `500 Internal Server Error`: If database update fails.

## Data Synchronization
When updating the profile:
1. Basic info (`name`, `email`, `phone_number`, `profile_picture`) is updated in the `users` collection.
2. If the user has an associated employee record in the `teachers` collection (based on `user_id`), the following fields are also synchronized to `teachers`:
   - `address`
   - `email`
   - `photo_base64` (from `profile_picture`)
   - `nip`
3. If no employee record exists (e.g., pure `admin` or `adminhrd`), `address` is stored directly in `users` collection.
