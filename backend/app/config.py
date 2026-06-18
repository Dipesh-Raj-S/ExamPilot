import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'exampilot-super-secret-key-12345')
    
    # Database configuration - fall back to SQLite for easy local dev if Postgres isn't configured
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    )
    # Fix database URL prefix if using postgres:// which sqlalchemy no longer supports (replaced by postgresql://)
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'exampilot-jwt-secret-key-67890')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
