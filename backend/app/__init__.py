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

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import auth_bp
    from app.routes.plan import plan_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(plan_bp, url_prefix='/api/plans')

    from app import models

    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health():
        return {"status": "healthy"}, 200

    return app