#!/usr/bin/env python3
import sys
sys.path.append('.')
from models import Medication
from database import engine
from sqlalchemy import inspect

# Check if medications table exists and its structure
inspector = inspect(engine)
if 'medications' in inspector.get_table_names():
    columns = inspector.get_columns('medications')
    print('Medications table columns:')
    for col in columns:
        print(f'  {col["name"]}: {col["type"]} - Nullable: {col["nullable"]}')
else:
    print('Medications table does not exist')
