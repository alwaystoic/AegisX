from pymongo import MongoClient

from app.core.config import settings

client = MongoClient(settings.MONGODB_URI)

mongodb = client[settings.MONGODB_DATABASE]