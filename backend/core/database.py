import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db_name: str = "insight_compass"

    @classmethod
    async def connect_db(cls):
        """Create database connection."""
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
           print("Warning: MONGO_URI not found in environment variables.")
           return

        try:
            cls.client = AsyncIOMotorClient(mongo_uri)
            # Ping to verify
            await cls.client.admin.command('ping')
            print("Successfully connected to MongoDB!")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            cls.client = None

    @classmethod
    async def close_db(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection closed.")

    @classmethod
    def get_db(cls):
        """Get database instance."""
        if cls.client is None:
             # Fallback or error handling if DB is strictly required
             return None
        return cls.client[cls.db_name]

# Helper to get collection
def get_collection(collection_name: str):
    db = Database.get_db()
    if db is not None:
        return db[collection_name]
    return None
