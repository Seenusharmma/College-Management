# College Academic Content Management System

A scalable, secure, and high-performance web application that replaces WhatsApp-based academic communication in colleges.

## Features

- **Role-Based Access Control**: Students, Teachers, and Super Admins
- **Content Management**: Upload and manage notes, assignments, PYQs, events, and jobs
- **Advanced Search**: Full-text search with filters by branch, semester, subject, and content type
- **Secure Authentication**: Clerk-based authentication with JWT
- **File Storage**: Cloudinary integration for file uploads
- **Real-time Updates**: Socket.io for notifications
- **Responsive Design**: Mobile-first UI with Tailwind CSS and ShadCN

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + ShadCN UI
- Framer Motion
- React Query / TanStack Query
- Zustand (state management)
- Clerk (authentication)

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Cloudinary (file uploads)
- Zod (validation)
- Helmet + Rate Limiting (security)

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Clerk account
- Cloudinary account

### Installation

1. Clone the repository
2. Copy environment files:
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

3. Install dependencies:
```bash
cd frontend && npm install
cd backend && npm install
```

4. Configure environment variables in `.env` files

5. Start MongoDB:
```bash
docker run -d -p 27017:27017 mongo:7
```

6. Run development servers:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Using Docker

```bash
docker-compose up
```

## Project Structure

```
root/
├── apps/
│   ├── web/ (Next.js frontend)
│   └── server/ (API backend)
├── packages/
│   ├── ui/ (shared UI components)
│   └── types/ (shared types)
├── frontend/ (Next.js app)
├── backend/ (Express API)
├── docker-compose.yml
└── Dockerfile
```

## API Endpoints

### Content
- `GET /api/content` - List all content
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create content (Teacher/Admin)
- `PATCH /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Users
- `GET /api/users` - List users (Admin)
- `PATCH /api/users/:id/role` - Update user role (Admin)

### Categories
- `GET /api/categories` - List branches
- `GET /api/categories/semesters` - List semesters
- `GET /api/categories/types` - List content types

## Security Features

- Clerk authentication
- JWT validation
- RBAC middleware
- Rate limiting
- Helmet.js headers
- CORS configuration
- Input validation (Zod)
- File type/size validation
- Secure cookies

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend && vercel
```

### Backend (Railway/Render)
```bash
cd backend && railway up
```

## License

MIT
