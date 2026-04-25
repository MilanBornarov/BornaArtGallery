# Borna Art

A bilingual online art gallery and studio website built for showcasing original artworks, telling the artist’s story, and managing the collection through a secure admin dashboard.

## Overview

Borna Art is a full-stack web app for an artist or gallery studio. Visitors can browse the collection, filter artworks by category, availability, dimensions, and orientation, explore the atelier and creative process, and save favorite pieces after signing in.

On the admin side, the app supports secure artwork management with image uploads, featured artwork controls, status updates, and bilingual content support.

## What The App Does

- Showcases featured and recent artworks on a polished gallery homepage
- Lets visitors browse the full collection with search and advanced filters
- Supports bilingual content in Macedonian and English
- Includes an artist/about page, atelier page, process section, and contact page
- Allows registered users to save favorite artworks
- Provides an admin dashboard for uploading, editing, featuring, and deleting artworks
- Stores artwork images in Cloudinary
- Uses a PostgreSQL database via Supabase
- Secures authentication with JWT access tokens and rotating refresh tokens

## Main Features

- Public gallery browsing
- Featured artworks carousel
- Artwork modal previews
- Favorites for signed-in users
- Login and registration
- Admin-only artwork management
- Artwork dimensions and orientation filtering
- Availability tracking (`AVAILABLE` / `SOLD`)
- Bilingual artwork titles and descriptions
- Automatic Macedonian-to-English translation support through an OpenAI-compatible provider
- Secure backend validation, upload checks, and rate limiting

## Tech Stack

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
- JWT authentication
- Bucket4j rate limiting

### Services
- Supabase PostgreSQL
- Cloudinary image hosting
- OpenAI-compatible translation endpoint
- Netlify frontend deployment
- Render backend deployment

## Project Structure

```text
frontend/   React app, pages, components, i18n, auth/favorites state
backend/    Spring Boot API, security, services, controllers, repositories
supabase/   SQL migrations and row-level-security policy files
schema.sql  Main database schema
render.yaml Render deployment config
