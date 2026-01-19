import asyncio
import os
import sys

# Ensure we can import from backend dir
sys.path.append(os.getcwd())

from main import get_history, get_schema, detected_schemas
from core.database import Database

# Mock FastAPI dependencies? 
# We just need to run the async functions.

async def run_tests():
    print("--- STARTING DEBUG ---")
    
    # 1. Initialize DB
    print("1. Connecting to DB...")
    await Database.connect_db()
    print("   Connected.")
    
    # 2. Get History
    print("\n2. Fetching History...")
    try:
        history_res = await get_history()
        history = history_res["history"]
        print(f"   Found {len(history)} items.")
        if history:
            print(f"   Latest: {history[0]['file_id']} ({history[0]['filename']})")
    except Exception as e:
        print(f"   ERROR: {e}")
        return

    if not history:
        print("   No history found. Cannot test schema restore.")
        return

    # 3. Test Schema Restore for 'authotp' (or first item)
    target_id = "authotp" # Explicitly test the one user mentioned
    # if target_id not in [h['file_id'] for h in history]:
    #     target_id = history[0]['file_id']
    
    print(f"\n3. Testing Schema Restore for '{target_id}'...")
    
    # Clear memory cache to force disk load
    if target_id in detected_schemas:
        del detected_schemas[target_id]
        print("   (Cleared memory cache)")

    try:
        schema = await get_schema(target_id)
        print("   SUCCESS! Schema detected:")
        print(f"   Type: {schema.dataType}")
        print(f"   Rows: {schema.rowCount}")
    except Exception as e:
        print(f"   CRASHED: {e}")
        import traceback
        traceback.print_exc()

    print("\n--- DEBUG COMPLETE ---")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_tests())
