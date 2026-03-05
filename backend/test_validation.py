#!/usr/bin/env python3
import sys
sys.path.append('.')
from decimal import Decimal
from pydantic_models import MedicationCreateRequest

# Test the medication creation with different price formats
print("Testing MedicationCreateRequest validation...")

# Test 1: String price (what frontend sends)
try:
    med1 = MedicationCreateRequest(
        name="Test Medication",
        category="Antibiotics",
        price="100.50",  # String format
        stock=50
    )
    print(f"✓ String price works: {med1.price} (type: {type(med1.price)})")
except Exception as e:
    print(f"✗ String price failed: {e}")

# Test 2: Float price
try:
    med2 = MedicationCreateRequest(
        name="Test Medication 2",
        category="Pain Relief",
        price=99.99,  # Float format
        stock=25
    )
    print(f"✓ Float price works: {med2.price} (type: {type(med2.price)})")
except Exception as e:
    print(f"✗ Float price failed: {e}")

# Test 3: Decimal price
try:
    med3 = MedicationCreateRequest(
        name="Test Medication 3",
        category="Vitamins",
        price=Decimal("75.25"),  # Decimal format
        stock=100
    )
    print(f"✓ Decimal price works: {med3.price} (type: {type(med3.price)})")
except Exception as e:
    print(f"✗ Decimal price failed: {e}")

print("Validation tests completed!")
