from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all in dev
                                                       #CORS (Cross-Origin Resource Sharing) is a browser security mechanism 
                                                       #that controls which frontends are allowed to make requests to a backend API.
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.plan import plan_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth') #This is where routes are connected.So every route here automatically starts with: /api/auth
    app.register_blueprint(plan_bp, url_prefix='/api/plans') #Similary: /api/plans
    
    # Simple check route
    @app.route('/api/health')
    def health():
        return {"status": "healthy"}, 200
        
    return app
