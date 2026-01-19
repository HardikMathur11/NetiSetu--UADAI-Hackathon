# UIDAI Decision Support Analytics Platform - Backend API

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
 python -m uvicorn main:app 
```

### 3. API Documentation
Once running, visit: `http://localhost:8000/docs` for interactive Swagger documentation.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload CSV file |
| `/api/schema/{file_id}` | GET | Get detected schema |
| `/api/stats/{file_id}` | GET | Get summary statistics |
| `/api/trends/{file_id}` | GET | Get trend analysis |
| `/api/predict/{file_id}` | GET | Get predictions |
| `/api/policies/{file_id}` | GET | Get policy recommendations |
| `/api/data/{file_id}` | GET | Get data preview |
| `/api/regions/{file_id}` | GET | Get unique regions |

---

## Connecting to Frontend

1. Update the frontend to point to your backend URL
2. In the frontend Dashboard, toggle OFF "Demo Mode" 
3. Use the API URL: `http://localhost:8000` (or your deployed URL)

---

## Deployment Options

### Render.com (Free Tier)
1. Push backend folder to GitHub
2. Create new "Web Service" on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Railway.app
1. Connect GitHub repo
2. Railway auto-detects Python
3. Deploy automatically

### Local Demo
Just run `python main.py` - works for hackathon demos!

---

## Key Features

- **Schema Auto-Detection**: Automatically identifies time, region, and metric columns
- **Prediction Guardrail**: Only enables prediction with ≥6 time points
- **Policy Engine**: Rule-based recommendations with confidence levels
- **CORS Enabled**: Works with any frontend URL

---

## Sample Test with cURL

```bash
# Upload a CSV
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@your_data.csv"

# Get schema
curl "http://localhost:8000/api/schema/your_data"

# Get predictions
curl "http://localhost:8000/api/predict/your_data"

# Get policy recommendations
curl "http://localhost:8000/api/policies/your_data"
```
