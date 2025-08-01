# Plus Vans API

FastAPI backend for the Plus Vans van conversion booking system.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Plus-Vans-Api.git
cd Plus-Vans-Api
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

5. Run database migrations:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `db/migrations/000001_create_system_health.sql`
- Execute the SQL script

6. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative API docs (ReDoc): `http://localhost:8000/redoc`

## Project Structure

```
Plus-Vans-Api/
├── app/
│   ├── routes/          # API route handlers
│   ├── utils/           # Utility functions
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic schemas
│   ├── supabase.py      # Supabase client setup
│   └── main.py         # FastAPI application setup
├── db/
│   └── migrations/      # Database migrations
├── tests/              # Test files
├── requirements.txt    # Python dependencies
└── README.md          # Project documentation
```

## Development

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Format code with Black
- Sort imports with isort

### Testing
```bash
pytest
```

### Contributing
1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## Deployment

The API is deployed on a cloud platform and accessible at:
- Production: https://api.plusvans.co.uk
- Staging: https://staging-api.plusvans.co.uk

## License

Proprietary - All rights reserved