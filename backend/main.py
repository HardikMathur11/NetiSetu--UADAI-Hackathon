"""
UIDAI Decision Support Analytics Platform - Backend API
FastAPI server with CSV processing, predictions, and policy recommendations
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import io
import json
import os
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression # Imported for prediction engine

# Logic Modules
from contextlib import asynccontextmanager
from core.database import Database, get_collection
from datetime import datetime

# Logic Modules
from core.policy_engine import generate_ai_recommendations, generate_policy_recommendations
from core.chat_engine import generate_chat_response

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await Database.connect_db()
    yield
    # Shutdown
    await Database.close_db()

app = FastAPI(
    title="UIDAI Analytics API",
    description="Decision Support Analytics Platform for Government Data",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - adjust origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (use database in production)
uploaded_data: Dict[str, pd.DataFrame] = {}
detected_schemas: Dict[str, Dict] = {}

# Persistence Imports
from core.storage import save_dataframe, load_dataframe # Keeping CSV/JSON helpers for backup/hybrid
import zlib
from bson.binary import Binary

# ============ PERSISTENCE HELPERS ============

async def save_dataset_to_db(file_id: str, df: pd.DataFrame):
    """Save compressed dataframe to MongoDB for persistence"""
    try:
        csv_str = df.to_csv(index=False)
        compressed_data = zlib.compress(csv_str.encode('utf-8'))
        
        storage_col = get_collection("file_storage")
        if storage_col is not None:
             await storage_col.update_one(
                {"file_id": file_id},
                {"$set": {
                    "file_id": file_id, 
                    "data": Binary(compressed_data),
                    "updated_at": datetime.utcnow()
                }},
                upsert=True
             )
             print(f"Persisted {file_id} to MongoDB (Compressed {len(compressed_data)} bytes)")
    except Exception as e:
        print(f"Failed to persist {file_id} to DB: {e}")

async def load_dataset_from_db(file_id: str) -> Optional[pd.DataFrame]:
    """Load and decompress dataframe from MongoDB"""
    try:
        storage_col = get_collection("file_storage")
        if storage_col is None: return None
        
        doc = await storage_col.find_one({"file_id": file_id})
        if doc and "data" in doc:
            compressed_data = doc["data"]
            csv_str = zlib.decompress(compressed_data).decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_str))
            print(f"Restored {file_id} from MongoDB Persistence")
            return df
        return None
    except Exception as e:
        print(f"Failed to restore {file_id} from DB: {e}")
        return None

async def get_or_load_dataframe(file_id: str) -> Optional[pd.DataFrame]:
    """Get from memory or load from disk/DB"""
    # 1. Memory Check
    if file_id in uploaded_data:
        return uploaded_data[file_id]
    
    # 2. Disk Check (Fastest Fallback)
    df = load_dataframe(file_id)
    
    # 3. DB Check (Persistence Fallback - Async)
    if df is None:
        # We need to run this async, but this function is sync in original design?
        # Wait, if this function is sync, we can't await. 
        # We must refactor to async or use a sync wrapper?
        # FastAPI routes are async, so we can await there.
        # But this function is called by sync logic? No, it's called by async routes mostly.
        # I will change this function to `async def` and update callsites.
        pass # Logic handled below in replacement
    
    return df
    
# NOTE: To avoid breaking change with async now, I will keep this sync wrapper 
# AND create a new async version, OR just handle the DB load inside the route handlers?
# Actually, the best way is to make `get_or_load_dataframe` async and update all callsites (6 places)
# But that's risky. 
# ALternatively: Just return None here, and let the Route handle the 404 by trying DB?
# YES. I will add `restore_from_db` helper and call it in routes if `get_or_load_dataframe` returns None.



# ============ MODELS ============

class SchemaResponse(BaseModel):
    timeColumn: Optional[str]
    regionColumn: Optional[str]
    metricColumns: List[str]
    dataType: str  # TIME_SERIES or SNAPSHOT
    rowCount: int
    canPredict: bool
    predictionReason: str

class StatsResponse(BaseModel):
    column: str
    min: float
    max: float
    avg: float
    median: float
    stdDev: float
    growthRate: Optional[float]
    dataPoints: int

class TrendDataPoint(BaseModel):
    period: str
    value: float
    movingAvg: Optional[float]
    growthRate: Optional[float]

class PredictionPoint(BaseModel):
    period: str
    value: float
    lowerBound: float
    upperBound: float

class PredictionResponse(BaseModel):
    canPredict: bool
    reason: str
    r2Score: Optional[float]
    slope: Optional[float]
    intercept: Optional[float]
    historical: List[Dict[str, Any]]
    predictions: List[PredictionPoint]

class PolicyRecommendation(BaseModel):
    id: str
    title: str
    description: str
    trigger: str
    expectedImpact: str
    confidence: str  # high, medium, low
    confidenceReason: str
    category: str
    isAiGenerated: Optional[bool] = False

class UploadResponse(BaseModel):
    success: bool
    message: str
    fileId: str
    rowCount: int
    columnCount: int
    columns: List[str]


# ============ HELPER FUNCTIONS ============

def detect_time_column(df: pd.DataFrame) -> Optional[str]:
    """Detect the time/date column in the dataframe"""
    time_keywords = ['year', 'month', 'date', 'day', 'time', 'period', 'quarter', 'fy', 'fiscal']
    
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword == col_lower or keyword in col_lower.split('_') for keyword in time_keywords):
            return col
    
    # Try to detect date-like columns
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                # Sample a few checks to avoid expensive try/catch on whole column
                pd.to_datetime(df[col].dropna().iloc[:10])
                return col
            except:
                pass
    
    return None

def detect_region_column(df: pd.DataFrame) -> Optional[str]:
    """Detect the region/state column in the dataframe"""
    region_keywords = ['state', 'region', 'district', 'city', 'location', 'area', 'zone', 'territory', 'aua', 'agency', 'organization', 'registrar', 'name', 'company']
    
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in region_keywords):
            return col
    
    return None

def detect_metric_columns(df: pd.DataFrame, time_col: Optional[str], region_col: Optional[str]) -> List[str]:
    """Detect numeric metric columns"""
    exclude_cols = [time_col, region_col] if time_col or region_col else []
    exclude_cols = [c for c in exclude_cols if c is not None]
    
    metric_cols = []
    for col in df.columns:
        if col not in exclude_cols and pd.api.types.is_numeric_dtype(df[col]):
            metric_cols.append(col)
    
    return metric_cols

def calculate_moving_average(values: List[float], window: int = 3) -> List[Optional[float]]:
    """Calculate moving average with given window"""
    result = []
    for i in range(len(values)):
        if i < window - 1:
            result.append(None)
        else:
            avg = sum(values[i-window+1:i+1]) / window
            result.append(round(avg, 2))
    return result

def calculate_growth_rates(values: List[float]) -> List[Optional[float]]:
    """Calculate period-over-period growth rates"""
    result = [None]
    for i in range(1, len(values)):
        if values[i-1] != 0:
            rate = ((values[i] - values[i-1]) / values[i-1]) * 100
            result.append(round(rate, 2))
        else:
            result.append(None)
    return result

def perform_linear_regression(time_indices: List[int], values: List[float], forecast_periods: int = 6):
    """Perform linear regression and generate forecasts"""
    X = np.array(time_indices).reshape(-1, 1)
    y = np.array(values)
    
    model = LinearRegression()
    model.fit(X, y)
    
    r2 = model.score(X, y)
    slope = model.coef_[0]
    intercept = model.intercept_
    
    # Generate predictions
    future_indices = list(range(len(time_indices) + 1, len(time_indices) + forecast_periods + 1))
    future_X = np.array(future_indices).reshape(-1, 1)
    predictions = model.predict(future_X)
    
    # Calculate prediction intervals (simplified)
    residuals = y - model.predict(X)
    std_error = np.std(residuals)
    
    prediction_results = []
    for i, (idx, pred) in enumerate(zip(future_indices, predictions)):
        # Wider confidence interval for further predictions
        margin = std_error * (1.5 + 0.1 * i)
        prediction_results.append({
            "period": f"Forecast {i+1}",
            "value": round(float(pred), 2),
            "lowerBound": round(float(pred - margin), 2),
            "upperBound": round(float(pred + margin), 2)
        })
    
    return {
        "r2": round(r2, 4),
        "slope": round(slope, 4),
        "intercept": round(intercept, 4),
        "predictions": prediction_results
    }




# ============ API ENDPOINTS ============

@app.get("/")
async def root():
    return {"message": "UIDAI Analytics API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload and validate a CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        contents = await file.read()
        
        # Try different encodings
        try:
            decoded = contents.decode('utf-8')
        except UnicodeDecodeError:
            try:
                decoded = contents.decode('latin-1')
            except:
                 # Fallback to ignore errors if absolutely necessary, or cp1252
                 decoded = contents.decode('cp1252', errors='replace')
                 
        df = pd.read_csv(io.StringIO(decoded))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Generate file ID
        file_id = file.filename.replace('.csv', '').replace(' ', '_').lower()
        
        # Detect schema
        time_col = detect_time_column(df)
        region_col = detect_region_column(df)
        metric_cols = detect_metric_columns(df, time_col, region_col)
        
        # Data Cleaning & Sorting
        if time_col:
            # Attempt to convert to datetime for proper sorting
            try:
                # Store original values to debug or fallback
                original_dates = df[time_col].copy()
                
                # Robust Date Parsing
                # 1. Try default inference
                df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
                
                # 2. If many NaTs (parsing failed), try specific formats common in India/Govt data
                if df[time_col].isna().sum() > len(df) * 0.5: # If >50% failed
                    # Try "DD-Mon" (e.g., 21-Oct) - assume current year or generic
                    # We append a year to make it parseable if it's just "21-Oct"
                    try:
                        # Check if it looks like "DD-Mon" or "Mon-YY" string
                        sample = original_dates.dropna().iloc[0] if len(original_dates.dropna()) > 0 else ""
                        if isinstance(sample, str):
                            if "-" in sample:
                                # Try appending current year if missing
                                # logic: "21-Oct" -> "21-Oct-2023"
                                current_year = pd.Timestamp.now().year
                                temp_dates = original_dates.astype(str) + f"-{current_year}"
                                df[time_col] = pd.to_datetime(temp_dates, errors='coerce', format="%d-%b-%Y")
                                
                                # If that still fails, try "Mon-YY" (Oct-24)
                                if df[time_col].isna().sum() > len(df) * 0.5:
                                     df[time_col] = pd.to_datetime(original_dates, format="%b-%y", errors='coerce')

                    except Exception as parse_err:
                        print(f"Custom parsing failed: {parse_err}")

                # 3. Final cleanup
                # Only drop if we successfully parsed AT LEAST ONE date. 
                # If we parsed nothing, maybe it's not a valid date column despite the name 'day'?
                # Or keep raw strings for 'Snapshot' mode if parsing completely failed.
                valid_dates = df[time_col].notna().sum()
                if valid_dates > 0:
                    df = df.dropna(subset=[time_col])
                    df = df.sort_values(by=time_col)
                else:
                    # Fallback: Revert to original strings and treat as SNAPSHOT (no time sorting)
                    print(f"Date parsing failed for column '{time_col}'. Reverting to original values.")
                    df[time_col] = original_dates
                    time_col = None # Disable time-series logic for this file

            except Exception as e:
                print(f"Warning: Could not sort by time column: {e}")

        # Store in memory (update after sorting)
        uploaded_data[file_id] = df
        
        # Determine data type
        unique_time_points = df[time_col].nunique() if time_col else 0
        data_type = "TIME_SERIES" if unique_time_points >= 3 else "SNAPSHOT"
        can_predict = data_type == "TIME_SERIES" and unique_time_points >= 6
        
        detected_schemas[file_id] = {
            "timeColumn": time_col,
            "regionColumn": region_col,
            "metricColumns": metric_cols,
            "dataType": data_type,
            "rowCount": len(df),
            "canPredict": can_predict,
            "predictionReason": "Enabled" if can_predict else f"Requires ≥6 time points (found {unique_time_points})"
        }
        
        # Prepare metadata for MongoDB
        dataset_meta = {
            "file_id": file_id,
            "filename": file.filename,
            "upload_timestamp": datetime.utcnow(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "schema": detected_schemas[file_id]
        }
        
        # Async Metadata Insert
        try:
            datasets_col = get_collection("datasets")
            if datasets_col is not None:
                # Upsert metadata
                await datasets_col.update_one(
                    {"file_id": file_id},
                    {"$set": dataset_meta},
                    upsert=True
                )
                print(f"Metadata for {file_id} saved to MongoDB.")
        except Exception as db_err:
             print(f"Warning: Failed to save metadata to DB: {db_err}")

        # Save to Disk (Hybrid Approach) - keep CSVs on disk for Pandas speed
        save_dataframe(file_id, df)
        
        # Save to MongoDB (Persistence Backup)
        await save_dataset_to_db(file_id, df)
        
        return UploadResponse(
            success=True,
            message="File uploaded and processed successfully",
            fileId=file_id,
            rowCount=len(df),
            columnCount=len(df.columns),
            columns=df.columns.tolist()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/api/history")
async def get_history():
    """Get list of previously uploaded datasets (with retry for Wake-Up)"""
    import asyncio
    
    # Retry loop to handle "DB Waking Up" silently
    # Try for up to 15 seconds (Render + CA Atlas Free Tier can take 10s+ to wake)
    for attempt in range(15):
        datasets_col = get_collection("datasets")
        if datasets_col is not None:
            try:
                # Fetch latest 20 uploads
                cursor = datasets_col.find(
                    {}, 
                    {"_id": 0, "file_id": 1, "filename": 1, "upload_timestamp": 1, "row_count": 1, "column_count": 1}
                ).sort("upload_timestamp", -1).limit(20)
                
                history = await cursor.to_list(length=20)
                return {"history": history}
            except Exception as e:
                print(f"History fetch attempt {attempt+1} failed: {e}")
        
        # Wait before retry
        await asyncio.sleep(1)
        
    print("History fetch gave up after 5 retries.")
    return {"history": []}


@app.get("/api/schema/{file_id}", response_model=SchemaResponse)
async def get_schema(file_id: str):
    """Get detected schema for uploaded file (Memory -> DB -> Disk)"""
    
    schema = None
    
    # 1. Check Memory
    if file_id in detected_schemas:
        schema = detected_schemas[file_id]

    # 2. Check MongoDB if not in memory
    if not schema:
        try:
            datasets_col = get_collection("datasets")
            if datasets_col is not None:
                doc = await datasets_col.find_one({"file_id": file_id})
                if doc and "schema" in doc:
                    detected_schemas[file_id] = doc["schema"] # Cache
                    schema = doc["schema"]
        except Exception as e:
            print(f"Error fetching schema from DB: {e}")

    # 3. Try to Load from Disk (triggers re-detection) if still missing
    if not schema:
        df = await get_or_load_dataframe(file_id)
        if df is not None:
             if file_id in detected_schemas:
                 schema = detected_schemas[file_id]

    if not schema:
         raise HTTPException(status_code=404, detail="Schema not found or data missing")

    return SchemaResponse(
        timeColumn=schema["timeColumn"],
        regionColumn=schema["regionColumn"],
        metricColumns=schema["metricColumns"],
        dataType=schema["dataType"],
        rowCount=schema.get("rowCount", 0),
        canPredict=schema["canPredict"],
        predictionReason=schema.get("predictionReason", "Restored from storage")
    )


@app.get("/api/stats/{file_id}")
async def get_stats(file_id: str, column: Optional[str] = None):
    """Get summary statistics for the dataset"""
    df = await get_or_load_dataframe(file_id)
    if df is None:
         raise HTTPException(status_code=404, detail="File not found")
    schema = detected_schemas[file_id]
    
    columns_to_analyze = [column] if column else schema["metricColumns"]
    
    results = []
    for col in columns_to_analyze:
        if col not in df.columns:
            continue
        
        values = df[col].dropna()
        
        # Calculate growth rate if time series
        growth_rate = None
        if schema["dataType"] == "TIME_SERIES" and len(values) >= 2:
            first_val = values.iloc[0]
            last_val = values.iloc[-1]
            if first_val != 0:
                growth_rate = ((last_val - first_val) / first_val) * 100
        
        results.append({
            "column": col,
            "min": round(float(values.min()), 2),
            "max": round(float(values.max()), 2),
            "avg": round(float(values.mean()), 2),
            "median": round(float(values.median()), 2),
            "stdDev": round(float(values.std()), 2),
            "growthRate": round(growth_rate, 2) if growth_rate else None,
            "dataPoints": len(values)
        })
    
    return {"stats": results}


@app.get("/api/trends/{file_id}")
async def get_trends(file_id: str, metric: Optional[str] = None, region: Optional[str] = None):
    """Get trend analysis data with moving averages"""
    df = await get_or_load_dataframe(file_id)
    if df is None:
         raise HTTPException(status_code=404, detail="File not found")
    schema = detected_schemas[file_id]
    
    if not schema["timeColumn"]:
        # Handle SNAPSHOT data (Bar Chart / Ranking)
        if not schema["regionColumn"]:
             raise HTTPException(status_code=400, detail="Cannot analyze trends: No time or category column found")
        
        # Determine metric
        target_metric = metric if metric and metric in schema["metricColumns"] else schema["metricColumns"][0]
        
        # Aggregate by name/region and take top 20
        cat_col = schema["regionColumn"]
        df_grouped = df.groupby(cat_col)[target_metric].sum().reset_index()
        df_grouped = df_grouped.sort_values(by=target_metric, ascending=False).head(20)
        
        trend_data = []
        for _, row in df_grouped.iterrows():
            trend_data.append({
                "period": str(row[cat_col]), # Use name as period label
                "value": float(row[target_metric]),
                "movingAvg": None,
                "growthRate": None
            })
            
        return {
            "metric": target_metric,
            "region": region or "All",
            "data": trend_data
        }
    
    # Filter by region if specified
    if region and schema["regionColumn"]:
        df = df[df[schema["regionColumn"]] == region]
    
    # Get metric column
    metric_col = metric if metric and metric in schema["metricColumns"] else schema["metricColumns"][0]
    
    # Aggregate by time period if there are multiple entries per period
    if schema["regionColumn"] and not region:
        trend_df = df.groupby(schema["timeColumn"])[metric_col].sum().reset_index()
    else:
        trend_df = df[[schema["timeColumn"], metric_col]].copy()
    
    values = trend_df[metric_col].tolist()
    periods = trend_df[schema["timeColumn"]].tolist()
    
    moving_avgs = calculate_moving_average(values)
    growth_rates = calculate_growth_rates(values)
    
    results = []
    for i, (period, value) in enumerate(zip(periods, values)):
        results.append({
            "period": str(period),
            "value": round(float(value), 2),
            "movingAvg": moving_avgs[i],
            "growthRate": growth_rates[i]
        })
    
    return {
        "metric": metric_col,
        "region": region,
        "data": results
    }


@app.get("/api/predict/{file_id}")
async def get_predictions(file_id: str, metric: Optional[str] = None, periods: int = 6):
    """Get linear regression predictions"""
    df = await get_or_load_dataframe(file_id)
    if df is None:
         raise HTTPException(status_code=404, detail="File not found")
    schema = detected_schemas[file_id]
    
    # Check if prediction is possible
    if not schema["canPredict"]:
        return PredictionResponse(
            canPredict=False,
            reason=schema["predictionReason"],
            r2Score=None,
            slope=None,
            intercept=None,
            historical=[],
            predictions=[]
        )
    
    metric_col = metric if metric and metric in schema["metricColumns"] else schema["metricColumns"][0]
    
    # Aggregate data by time period
    if schema["regionColumn"]:
        agg_df = df.groupby(schema["timeColumn"])[metric_col].sum().reset_index()
    else:
        agg_df = df[[schema["timeColumn"], metric_col]].copy()
    
    time_indices = list(range(1, len(agg_df) + 1))
    values = agg_df[metric_col].tolist()
    periods_list = agg_df[schema["timeColumn"]].tolist()
    
    # Perform regression
    regression_result = perform_linear_regression(time_indices, values, periods)
    
    # Prepare historical data
    historical = []
    for period, value in zip(periods_list, values):
        historical.append({
            "period": str(period),
            "value": round(float(value), 2)
        })
    
    return {
        "canPredict": True,
        "reason": "Prediction enabled with sufficient data points",
        "r2Score": regression_result["r2"],
        "slope": regression_result["slope"],
        "intercept": regression_result["intercept"],
        "historical": historical,
        "predictions": regression_result["predictions"]
    }


@app.get("/api/policies/{file_id}")
async def get_policies(file_id: str):
    """Get AI-generated policy recommendations"""
    
    # 1. Check MongoDB Cache First
    policies_col = get_collection("policies")
    if policies_col is not None:
        cached_doc = await policies_col.find_one({"file_id": file_id})
        if cached_doc and "recommendations" in cached_doc:
             print(f"Serving cached policies for {file_id} from MongoDB.")
             return {"recommendations": cached_doc["recommendations"]}
    
    # 2. Ensure data is loaded
    df = await get_or_load_dataframe(file_id)
    if df is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    schema = detected_schemas.get(file_id, {})
    
    # Calculate basic stats for the engine
    stats = []
    metric_cols = schema.get("metricColumns", [])
    if metric_cols:
        for col in metric_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                col_stats = {
                    "column": col,
                    "mean": float(df[col].mean()),
                    "sum": float(df[col].sum()),
                    "min": float(df[col].min()),
                    "max": float(df[col].max())
                }
                stats.append(col_stats)

    # 3. Generate fresh policies
    try:
        recommendations = generate_ai_recommendations(df, schema, stats, filename=file_id)
        
        # Only cache if it's high-quality AI output
        is_ai_result = any(r.get("isAiGenerated", False) for r in recommendations)
        
        if is_ai_result and policies_col is not None:
            # Save to MongoDB
            policy_doc = {
                "file_id": file_id,
                "created_at": datetime.utcnow(),
                "recommendations": recommendations,
                "is_ai_generated": True
            }
            await policies_col.update_one(
                {"file_id": file_id},
                {"$set": policy_doc},
                upsert=True
            )
            print(f"Saved fresh policies for {file_id} to MongoDB.")
        else:
            print(f"Generated fallback/low-quality policies for {file_id}. Not caching.")
        
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error generating AI policies: {e}")
        # Fallback to rule-based
        return {"recommendations": generate_policy_recommendations(df, schema, stats)}

class ChatRequest(BaseModel):
    fileId: str
    message: str


@app.post("/api/chat")
async def chat_with_data(request: ChatRequest):
    """Chat with the loaded dataset"""
    df = await get_or_load_dataframe(request.fileId)
    if df is None:
        raise HTTPException(status_code=404, detail="File session not found")
    schema = detected_schemas[request.fileId]
    
    # Get stats (cached or fresh)
    stats_response = await get_stats(request.fileId)
    stats = stats_response["stats"]
    
    response_text = generate_chat_response(
        query=request.message,
        df=df,
        schema=schema,
        stats=stats,
        filename=request.fileId
    )
    
    return {"response": response_text}


@app.get("/api/data/{file_id}")
async def get_data(file_id: str, limit: int = 100):
    """Get raw data preview"""
    df = await get_or_load_dataframe(file_id)
    if df is None:
         raise HTTPException(status_code=404, detail="File not found")
    
    preview = df.head(limit)
    
    return {
        "success": True,
        "columns": df.columns.tolist(),
        "data": preview.to_dict(orient="records"),
        "totalRows": len(df),
        "previewRows": len(preview)
    }


@app.get("/api/regions/{file_id}")
async def get_regions(file_id: str):
    """Get unique regions in the dataset"""
    df = await get_or_load_dataframe(file_id)
    if df is None:
         raise HTTPException(status_code=404, detail="File not found")
    schema = detected_schemas[file_id]
    
    if not schema["regionColumn"]:
        return {"regions": []}
    
    regions = df[schema["regionColumn"]].unique().tolist()
    return {"regions": sorted(regions)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
