# 🎨 Borna Art

A bilingual online art gallery and studio platform built to showcase original artworks, tell the artist's story, and manage the collection through a secure admin dashboard.

---

## 🧩 Overview

**Borna Art** is a full-stack web application designed for a single artist or gallery studio.

Visitors can:
- Browse artworks
- Filter by various criteria
- Explore the creative process and atelier
- Save favorite pieces (after signing in)

Admins can:
- Manage artworks securely
- Upload and update images
- Control featured content
- Maintain bilingual content

---

## 🚀 What The App Does

- Displays featured and recent artworks on a polished homepage
- Provides advanced filtering and search functionality
- Supports bilingual content (Macedonian 🇲🇰 / English 🇬🇧)
- Includes:
  - Artist/About page
  - Atelier page
  - Process section
  - Contact page
- Allows users to save favorite artworks
- Includes a secure admin dashboard for full artwork management

---

## ✨ Main Features

### Public Features
- Gallery browsing
- Featured artworks carousel
- Artwork modal previews
- Advanced filtering (category, dimensions, orientation, availability)
- Bilingual artwork titles and descriptions

### User Features
- Registration & login
- Save and manage favorite artworks

### Admin Features
- Upload artworks with images
- Edit artwork details
- Replace images
- Mark artworks as featured
- Update availability (AVAILABLE / SOLD)
- Delete artworks securely

### Smart Features
- Automatic Macedonian → English translation (OpenAI-compatible provider)
- Server-side validation and upload checks
- Rate limiting for sensitive endpoints

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- i18next

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Bucket4j (Rate Limiting)

### Services
- Supabase (PostgreSQL)
- Cloudinary (Image Hosting)
- OpenAI-compatible Translation API
- Netlify (Frontend Deployment)
- Render (Backend Deployment)

---

## 📁 Project Structure

```
frontend/   → React app (pages, components, i18n, auth/favorites state)
backend/    → Spring Boot API (security, services, controllers, repositories)
supabase/   → SQL migrations & RLS policies
schema.sql  → Main database schema
render.yaml → Render deployment configuration
```

---

## 🔄 Core User Flows

### 👤 Visitor
1. Open homepage  
2. Browse featured and recent artworks  
3. Search and filter gallery  
4. Explore artist and atelier  
5. Contact the studio  

### 🔐 Registered User
1. Sign up / log in  
2. Save artworks to favorites  
3. Revisit saved artworks  

### 🛠 Admin
1. Log in with admin privileges  
2. Upload new artwork (image, dimensions, category, status)  
3. Edit artwork details  
4. Replace images  
5. Mark artworks as featured  
6. Update availability  
7. Delete artworks securely  

---

## 🔒 Security Notes

- Short-lived JWT access tokens
- Refresh tokens stored in **HttpOnly cookies**
- Refresh token rotation with database tracking
- Explicit CORS allowlist
- Backend-enforced admin permissions
- Server-side image validation
- Rate limiting on:
  - Authentication
  - Favorites
  - Uploads
  - Admin actions
- Generic error responses for production safety

---

## ⚙️ Running Locally

### Prerequisites
- Node.js
- Java 17
- Maven
- PostgreSQL or Supabase project
- Cloudinary account

---

### ▶️ Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### ▶️ Backend

```bash
cd backend
mvn spring-boot:run
```

---

## 🔧 Environment Setup

Configure environment variables for:

- Database connection
- JWT secrets
- Cloudinary credentials
- Allowed frontend origins
- Auth cookie settings
- Translation API key
- Public contact links

---

## 🗄 Database Setup

- Run `schema.sql`  
**OR**
- Apply migrations from:

```
supabase/migrations/
```

---

## 🚀 Deployment

- **Frontend:** Netlify  
- **Backend:** Render  
- **Database:** Supabase PostgreSQL  
- **Media Storage:** Cloudinary  

---

## 📌 Status

This project is **production-oriented** and includes:

- Full deployment setup
- Secure authentication system
- Media management
- Bilingual content support
- Security hardening

---

## 🧠 Notes

- Designed for a **single artist workflow**
- Focused on performance, security, and clean UI/UX
- Easily extendable for future features

---

## 📬 Contact

Use the in-app contact links to reach the artist directly.
