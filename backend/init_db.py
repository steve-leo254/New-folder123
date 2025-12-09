"""
Database initialization script.
Drops all tables and recreates them with the current schema.
"""

import logging
from database import engine
from models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database by dropping all tables and recreating them."""
    try:
        logger.info("Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        logger.info("Creating all tables with new schema...")
        Base.metadata.create_all(bind=engine)
        
        logger.info("✓ Database initialized successfully!")
        return True
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    init_database()
