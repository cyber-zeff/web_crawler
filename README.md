# Web Crawler

A modern, full-stack web crawler application built as a **Computer Networks semester project**. This application crawls websites, extracts content, and provides a beautiful interface to search and manage crawl jobs.

## 🌟 Features

- **Asynchronous Web Crawling** - BFS-based crawler with configurable depth, page limits, and politeness delays
- **Robots.txt Compliance** - Respects website crawling rules with caching for performance
- **Real-time Job Tracking** - Monitor crawl progress with live status updates (polls every 5 seconds)
- **Full-Text Search** - Search across all crawled content with job-specific filtering
- **Content Extraction** - Extracts titles, text content, and link relationships from crawled pages
- **JSON Export** - Download crawl job data including all pages and links
- **Modern UI** - Clean, responsive interface built with Next.js 16 and Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│    Frontend     │         │     Backend     │
│   Next.js 16    │◄───────►│   FastAPI 0.135 │
│   TypeScript    │  REST   │   Python 3.12+  │
│   Tailwind CSS  │   API   │   Async Crawler │
│   (Port 3000)   │         │   (Port 8000)   │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │    Database     │
                            │    Supabase     │
                            │  (PostgreSQL)   │
                            └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling |
| Supabase JS | ^2.99.1 | Database client |
| Recharts | ^3.8.0 | Data visualization |
| Lucide React | ^0.577.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.135.1 | Web framework |
| Uvicorn | 0.41.0 | ASGI server |
| aiohttp | 3.13.3 | Async HTTP client |
| BeautifulSoup4 | 4.14.3 | HTML parsing |
| Supabase | 2.28.2 | Database client |
| python-dotenv | 1.2.2 | Environment management |

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and **pnpm** (recommended) or npm
- **Python** 3.12+
- **Supabase** account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/cyber-zeff/web_crawler
cd web-crawler
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and fill in your values
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment variables
# Create .env.local with required variables
```

## ⚙️ Configuration

### Backend Environment Variables (`.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
CRAWLER_MAX_DEPTH=3
CRAWLER_DELAY=1.0
CRAWLER_MAX_PAGES=100
```

### Frontend Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Usage

### 1. Start the Backend
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
pnpm dev
```

### 3. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/crawl` | Start a new crawl job |
| `GET` | `/api/jobs` | Get all crawl jobs |
| `GET` | `/api/jobs/{job_id}` | Get job status |
| `GET` | `/api/jobs/{job_id}/pages` | Get crawled pages (paginated) |
| `GET` | `/api/search` | Full-text search |
| `GET` | `/api/jobs/{job_id}/export` | Export job as JSON |
| `DELETE` | `/api/jobs/{job_id}` | Delete a job |

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with three tables:

### `crawl_jobs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| seed_url | TEXT | Starting URL for the crawl |
| max_depth | INTEGER | Maximum crawl depth |
| max_pages | INTEGER | Page limit |
| delay | FLOAT | Request delay in seconds |
| status | TEXT | pending/running/completed/failed |
| pages_crawled | INTEGER | Progress counter |
| created_at | TIMESTAMP | Job creation time |
| updated_at | TIMESTAMP | Last update time |

### `pages`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | Foreign key to crawl_jobs |
| url | TEXT | Page URL |
| title | TEXT | Page title |
| content | TEXT | Extracted text content |
| status_code | INTEGER | HTTP response code |
| depth | INTEGER | Crawl depth level |
| word_count | INTEGER | Number of words |
| crawled_at | TIMESTAMP | Crawl timestamp |

### `links`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | Foreign key to crawl_jobs |
| source_url | TEXT | Source page URL |
| target_url | TEXT | Linked page URL |
| anchor_text | TEXT | Link text |

## 📸 Screenshots

### Dashboard
The main dashboard displays all crawl jobs with real-time status updates, search functionality, and the ability to start new crawls.

### Job Details
Click on any job to view detailed information including all crawled pages, extracted content, and export options.

## 🎓 Project Context

This project was developed as a **semester-end project for Computer Networks** (Semester 4). It demonstrates understanding of:

- HTTP protocol and web scraping
- RESTful API design
- Asynchronous programming
- Database design and management
- Full-stack web development
- Network politeness (robots.txt, rate limiting)

## 📁 Project Structure

```
web-crawler/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application entry
│   │   ├── api/
│   │   │   └── routes.py     # API endpoints
│   │   ├── crawler/
│   │   │   ├── engine.py     # Core crawling logic
│   │   │   ├── parser.py     # HTML parsing
│   │   │   └── robots.py     # Robots.txt handling
│   │   └── db/
│   │       └── supabase.py   # Database client
│   ├── .env                  # Environment variables
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Home dashboard
│   │   ├── jobs/[id]/page.tsx # Job detail page
│   │   ├── components/       # React components
│   │   └── lib/              # API client, utilities
│   ├── package.json
│   └── .env.local            # Environment variables
└── README.md
```

## 🔧 Development

### Running Tests
```bash
# Backend tests (if available)
cd backend
pytest

# Frontend linting
cd frontend
pnpm lint
```

### Building for Production
```bash
# Frontend build
cd frontend
pnpm build
pnpm start
```

## 🤝 Contributing

This is a semester project. Feel free to fork and experiment!

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Computer Networks Semester Project - Semester 4
