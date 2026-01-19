import pandas as pd
import json
import os
from typing import Optional, Dict, List, Any
import logging

# Configure storage directory
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data_storage")
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

logger = logging.getLogger(__name__)

def save_dataframe(file_id: str, df: pd.DataFrame) -> bool:
    """Save DataFrame to CSV on disk"""
    try:
        path = os.path.join(STORAGE_DIR, f"{file_id}.csv")
        df.to_csv(path, index=False)
        return True
    except Exception as e:
        logger.error(f"Failed to save DataFrame: {e}")
        return False

def load_dataframe(file_id: str) -> Optional[pd.DataFrame]:
    """Load DataFrame from CSV on disk"""
    try:
        path = os.path.join(STORAGE_DIR, f"{file_id}.csv")
        if os.path.exists(path):
            return pd.read_csv(path)
        return None
    except Exception as e:
        logger.error(f"Failed to load DataFrame: {e}")
        return None

def save_json(file_id: str, suffix: str, data: Any) -> bool:
    """Save serializable data to JSON"""
    try:
        path = os.path.join(STORAGE_DIR, f"{file_id}_{suffix}.json")
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Failed to save JSON: {e}")
        return False

def load_json(file_id: str, suffix: str) -> Optional[Any]:
    """Load data from JSON"""
    try:
        path = os.path.join(STORAGE_DIR, f"{file_id}_{suffix}.json")
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        return None
    except Exception as e:
        logger.error(f"Failed to load JSON: {e}")
        return None
