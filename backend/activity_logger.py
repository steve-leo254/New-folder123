import logging
from datetime import datetime
from models import ActivityLog
from database import get_db

logger = logging.getLogger(__name__)

def create_activity_log(
    user_id: int,
    action: str,
    device: str = None,
    location: str = None,
    ip_address: str = None,
    db = None
):
    """Create an activity log entry for user actions."""
    try:
        if db is None:
            db = next(get_db())
        
        activity_log = ActivityLog(
            user_id=user_id,
            action=action,
            device=device,
            location=location,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        
        db.add(activity_log)
        db.commit()
        
        logger.info(f"Activity log created: User {user_id} - {action}")
        
    except Exception as e:
        logger.error(f"Failed to create activity log: {e}")
        if db:
            db.rollback()
        # Don't raise exception - logging failures shouldn't break main functionality
