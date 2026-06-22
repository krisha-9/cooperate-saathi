import sys
import os

# Forwarding file to load app from backend/main.py
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
from main import app
