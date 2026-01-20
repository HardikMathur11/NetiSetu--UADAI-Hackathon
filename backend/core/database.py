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
            # Set a 5-second timeout so app doesn't hang if DB is unreachable (e.g. whitelist issues)
            cls.client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
            
            # Ping to verify
            await cls.client.admin.command('ping')
            print("Successfully connected to MongoDB!")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            print("App will continue in 'Offline Mode' (In-Memory Storage).")
            cls.client = None

    @classmethod
    async def close_db(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection closed.")

    @classmethod
    def get_db(cls):
        """Get database instance. Lazily connects if not connected."""
        if cls.client is None:
             # Lazy Reconnect: Attempt to create client if missing (e.g. startup failed or never ran)
             # Motor client creation is synchronous, only network ops are async
             mongo_uri = os.getenv("MONGO_URI")
             if mongo_uri:
                 try:
                     print("Attemping Lazy DB Reconnection...")
                     cls.client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
                     print("Lazy Reconnection: Client created.")
                 except Exception as e:
                     print(f"Lazy Reconnection failed: {e}")
                     return None
             else:
                 return None

        return cls.client[cls.db_name]

# Helper to get collection
def get_collection(collection_name: str):
    db = Database.get_db()
    if db is not None:
        return db[collection_name]
    return None
