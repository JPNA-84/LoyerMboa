# 🏠 LoyerMboa – Trouvez votre chez-vous / Find your home

**Bilingual (FR/EN) rental marketplace for Cameroon.**

---

## Project Structure

```
loyermboa/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── config/       # DB & JWT config
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, RBAC, validation
│   │   ├── models/       # Mongoose/DB models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helpers
│   └── package.json
├── frontend/         # React.js SPA (bilingual)
│   ├── src/
│   │   ├── components/   # Reusable UI
│   │   ├── pages/        # Route pages
│   │   ├── context/      # App state & i18n
│   │   ├── locales/      # FR & EN translations
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # API client, helpers
│   └── package.json
└── package.json      # Root monorepo scripts
```

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally OR set `MONGO_URI` in `.env`

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Run (both frontend + backend)
```bash
npm run dev
```

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (tenant or landlord) |
| POST | `/api/auth/login` | Login → JWT token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/profile` | Get own profile |
| PUT | `/api/auth/profile` | Update profile |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | All verified properties |
| GET | `/api/properties/search` | Search + filter |
| GET | `/api/properties/:id` | Single property |
| POST | `/api/properties` | Create (landlord only) |
| PUT | `/api/properties/:id` | Edit own listing |
| DELETE | `/api/properties/:id` | Delete own listing |
| GET | `/api/properties/my-properties` | Own listings |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | My favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/:id` | Remove favorite |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/:propertyId` | Property reviews |
| POST | `/api/reviews/:propertyId` | Leave review |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact/:propertyId` | Send message to landlord |
| GET | `/api/messages` | My messages |

---

## Language Support

Switch language via the 🇫🇷/🇬🇧 button in the top navigation bar. All UI text, labels, and error messages are available in:
- **Français** (default)
- **English**

The language preference is saved in localStorage.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Context API |
| Styling | Tailwind-inspired custom CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + BCrypt |
| Real-time | Socket.io (notifications) |
| Maps | OpenStreetMap (Leaflet.js) |
| File uploads | Multer |

---

*Made with ❤️ in Cameroon 🇨🇲*
