from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate, jwt
from routes.auth import auth_bp
from routes.properties import property_bp
from routes.viewing_requests import viewing_bp
from routes.messages import message_bp
from routes.saved_properties import saved_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(property_bp, url_prefix='/api/properties')
    app.register_blueprint(viewing_bp, url_prefix='/api/viewing-requests')
    app.register_blueprint(message_bp, url_prefix='/api/messages')
    app.register_blueprint(saved_bp, url_prefix='/api/saved')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
