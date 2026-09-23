from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Clerk user ID
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    brand_niche = Column(String, nullable=True)
    brand_voice = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    social_accounts = relationship("SocialAccount", back_populates="user")
    posts = relationship("Post", back_populates="user")

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    platform = Column(String) # 'linkedin' or 'instagram'
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    profile_url = Column(String, nullable=True)
    
    user = relationship("User", back_populates="social_accounts")

class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    popularity_score = Column(Float)
    growth_percentage = Column(Float)
    engagement_score = Column(Float)
    reason_trending = Column(JSON) # e.g. ["Strong curiosity hook", "Storytelling"]
    suggested_angle = Column(String)
    source = Column(String) # 'linkedin', 'instagram', 'third_party'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ContentPlan(Base):
    __tablename__ = "content_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    trend_id = Column(Integer, ForeignKey("trends.id"))
    plan_details = Column(JSON) # angle, key_points, format
    status = Column(String, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    content_plan_id = Column(Integer, ForeignKey("content_plans.id"))
    platform = Column(String) # 'linkedin' or 'instagram'
    content = Column(Text)
    image_prompt = Column(Text, nullable=True)
    status = Column(String, default="draft") # draft, scheduled, published
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    published_time = Column(DateTime(timezone=True), nullable=True)
    metrics = Column(JSON, nullable=True) # views, likes, shares, comments
    
    user = relationship("User", back_populates="posts")
