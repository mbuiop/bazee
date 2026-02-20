#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
ربات مادر فوق‌پیشرفته - نسخه 6.0
سیستم رفرال هوشمند | پرداخت امن | اجرای بدون خطا | امنیت پیشرفته
"""

import asyncio
import aiohttp
import aio_pika
import asyncpg
import aioredis
import uvloop
import docker
import telebot
from telebot import types
import sqlite3
import os
import subprocess
import sys
import time
import hashlib
import json
import threading
import signal
import shutil
import psutil
import re
import zipfile
import tarfile
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict, field
from concurrent.futures import ThreadPoolExecutor
import logging
import traceback
from logging.handlers import RotatingFileHandler
import aiofiles
import magic
import redis
import pika
import minio
from minio import Minio
from minio.error import S3Error
import secrets
import string
import jwt
from cryptography.fernet import Fernet
import base64
import random
import uuid

# ==================== تنظیمات uvloop برای سرعت بالا ====================
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

# ==================== تنظیمات پایه ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "logs")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
CACHE_DIR = os.path.join(BASE_DIR, "cache")
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

# ==================== توکن ربات مادر ====================
BOT_TOKEN = os.getenv('BOT_TOKEN', '8052349235:AAFSaJmYpl359BKrJTWC8O-u-dI9r2olEOQ')
bot = telebot.TeleBot(BOT_TOKEN)
bot.delete_webhook()

# ==================== اطلاعات پرداخت (مخفی در کد) ====================
PAYMENT_INFO = {
    'card_number': '589210118732277',
    'card_holder_name': 'MORTEZA NIKKHO KHANJARI',  # نام مخفی - فقط برای تطبیق خودکار
    'amount': 2000000,  # 2 میلیون تومان
    'amount_text': '۲,۰۰۰,۰۰۰ تومان'
}

# ==================== لاگینگ حرفه‌ای ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            os.path.join(LOGS_DIR, 'mother_bot.log'),
            maxBytes=10485760,  # 10MB
            backupCount=30
        ),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==================== کلید رمزنگاری برای توکن‌ها ====================
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# ==================== تنظیمات اتصال به سرویس‌ها ====================

# PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'admin'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'bot_empire'),
    'min_size': int(os.getenv('DB_POOL_MIN', 20)),
    'max_size': int(os.getenv('DB_POOL_MAX', 200)),
    'command_timeout': 60,
    'max_queries': 100000,
    'max_inactive_connection_lifetime': 300
}

# Redis
REDIS_CONFIG = {
    'host': os.getenv('REDIS_HOST', 'redis'),
    'port': int(os.getenv('REDIS_PORT', 6379)),
    'password': os.getenv('REDIS_PASS', ''),
    'db': int(os.getenv('REDIS_DB', 0)),
    'max_connections': int(os.getenv('REDIS_MAX_CONN', 2000)),
    'decode_responses': True,
    'socket_keepalive': True,
    'socket_timeout': 5,
    'retry_on_timeout': True
}

# RabbitMQ
RABBITMQ_CONFIG = {
    'host': os.getenv('RABBITMQ_HOST', 'rabbitmq'),
    'port': int(os.getenv('RABBITMQ_PORT', 5672)),
    'login': os.getenv('RABBITMQ_USER', 'admin'),
    'password': os.getenv('RABBITMQ_PASS', ''),
    'virtual_host': '/',
    'connection_attempts': 10,
    'retry_delay': 5
}

# MinIO
MINIO_CONFIG = {
    'endpoint': os.getenv('MINIO_HOST', 'minio:9000'),
    'access_key': os.getenv('MINIO_ACCESS_KEY', 'admin'),
    'secret_key': os.getenv('MINIO_SECRET_KEY', ''),
    'secure': False,
    'bucket_name': os.getenv('MINIO_BUCKET', 'bot-files')
}

# Docker
DOCKER_CONFIG = {
    'base_url': os.getenv('DOCKER_HOST', 'unix://var/run/docker.sock'),
    'timeout': 120,
    'max_pool_size': 100
}

# ==================== دیتا کلاس‌های پیشرفته ====================

@dataclass
class User:
    """مدل کاربر با پشتیبانی از رفرال"""
    id: int
    username: str
    first_name: str
    last_name: Optional[str]
    language: str
    balance: float
    plan: str
    bots_count: int
    referral_code: str
    referred_by: Optional[int]
    referral_earnings: float
    referral_count: int
    created_at: datetime
    last_active: datetime
    settings: Dict[str, Any]
    is_paid: bool = False
    payment_date: Optional[datetime] = None

@dataclass
class UserBot:
    """مدل ربات کاربر با امنیت بالا"""
    id: str
    user_id: int
    token: str  # رمزنگاری شده
    token_encrypted: str
    name: str
    username: str
    description: str
    status: str
    container_id: Optional[str]
    node_id: Optional[str]
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    requests_count: int
    errors_count: int
    last_error: Optional[str]
    created_at: datetime
    last_active: datetime
    settings: Dict[str, Any]
    installed_libraries: List[str] = field(default_factory=list)

@dataclass
class Payment:
    """مدل پرداخت"""
    id: str
    user_id: int
    amount: float
    status: str  # pending, completed, failed
    payment_method: str
    transaction_id: Optional[str]
    card_number: str
    created_at: datetime
    completed_at: Optional[datetime]
    verified_by: Optional[str]

@dataclass
class Referral:
    """مدل رفرال"""
    id: str
    referrer_id: int
    referred_id: int
    code: str
    created_at: datetime
    earnings: float
    status: str  # pending, completed

# ==================== کلاس مدیریت رمزنگاری ====================

class EncryptionManager:
    """مدیریت رمزنگاری توکن‌ها و اطلاعات حساس"""
    
    def __init__(self):
        self.cipher = cipher_suite
    
    def encrypt_token(self, token: str) -> str:
        """رمزنگاری توکن"""
        return self.cipher.encrypt(token.encode()).decode()
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """رمزگشایی توکن"""
        try:
            return self.cipher.decrypt(encrypted_token.encode()).decode()
        except:
            return None
    
    def generate_referral_code(self, user_id: int) -> str:
        """تولید کد رفرال یکتا"""
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        return f"REF{user_id}{random_part}"

# ==================== کلاس مدیریت دیتابیس ====================

class DatabaseManager:
    """مدیریت اتصال به PostgreSQL با Connection Pool"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.pool: Optional[asyncpg.Pool] = None
        self._lock = asyncio.Lock()
        self.encryption = EncryptionManager()
    
    async def initialize(self):
        """راه‌اندازی connection pool"""
        async with self._lock:
            if not self.pool:
                try:
                    self.pool = await asyncpg.create_pool(**self.config)
                    logger.info("✅ PostgreSQL connection pool created")
                    
                    # ایجاد جداول پیشرفته
                    await self._create_tables()
                    
                except Exception as e:
                    logger.error(f"❌ Failed to connect to PostgreSQL: {e}")
                    raise
    
    async def _create_tables(self):
        """ایجاد جداول پیشرفته"""
        async with self.pool.acquire() as conn:
            # جدول کاربران با پشتیبانی رفرال
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT UNIQUE NOT NULL,
                    username VARCHAR(255),
                    first_name VARCHAR(255),
                    last_name VARCHAR(255),
                    language VARCHAR(10) DEFAULT 'fa',
                    balance DECIMAL(10,2) DEFAULT 0,
                    plan VARCHAR(50) DEFAULT 'free',
                    bots_count INTEGER DEFAULT 0,
                    referral_code VARCHAR(50) UNIQUE,
                    referred_by BIGINT,
                    referral_earnings DECIMAL(10,2) DEFAULT 0,
                    referral_count INTEGER DEFAULT 0,
                    settings JSONB DEFAULT '{}',
                    is_paid BOOLEAN DEFAULT FALSE,
                    payment_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_active TIMESTAMP DEFAULT NOW(),
                    INDEX idx_users_user_id (user_id),
                    INDEX idx_users_referral_code (referral_code),
                    INDEX idx_users_referred_by (referred_by),
                    INDEX idx_users_is_paid (is_paid)
                )
            ''')
            
            # جدول پرداخت‌ها
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS payments (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    payment_method VARCHAR(50),
                    transaction_id VARCHAR(255),
                    card_number VARCHAR(20),
                    created_at TIMESTAMP DEFAULT NOW(),
                    completed_at TIMESTAMP,
                    verified_by VARCHAR(255),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    INDEX idx_payments_user_id (user_id),
                    INDEX idx_payments_status (status),
                    INDEX idx_payments_created_at (created_at)
                )
            ''')
            
            # جدول رفرال‌ها
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS referrals (
                    id VARCHAR(64) PRIMARY KEY,
                    referrer_id BIGINT NOT NULL,
                    referred_id BIGINT NOT NULL,
                    code VARCHAR(50) NOT NULL,
                    earnings DECIMAL(10,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT NOW(),
                    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (referred_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    INDEX idx_referrals_referrer_id (referrer_id),
                    INDEX idx_referrals_code (code)
                )
            ''')
            
            # جدول ربات‌های کاربران با امنیت
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS user_bots (
                    id VARCHAR(32) PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    token_encrypted TEXT NOT NULL,
                    name VARCHAR(255),
                    username VARCHAR(255),
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'stopped',
                    container_id VARCHAR(255),
                    node_id VARCHAR(255),
                    cpu_usage FLOAT DEFAULT 0,
                    memory_usage FLOAT DEFAULT 0,
                    disk_usage FLOAT DEFAULT 0,
                    requests_count BIGINT DEFAULT 0,
                    errors_count BIGINT DEFAULT 0,
                    last_error TEXT,
                    settings JSONB DEFAULT '{}',
                    installed_libraries TEXT[] DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_active TIMESTAMP DEFAULT NOW(),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    INDEX idx_user_bots_user_id (user_id),
                    INDEX idx_user_bots_status (status),
                    INDEX idx_user_bots_container_id (container_id)
                )
            ''')
            
            # جدول کتابخانه‌های نصب شده
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS installed_libraries (
                    id BIGSERIAL PRIMARY KEY,
                    bot_id VARCHAR(32) NOT NULL,
                    library_name VARCHAR(255) NOT NULL,
                    library_version VARCHAR(50),
                    installed_at TIMESTAMP DEFAULT NOW(),
                    FOREIGN KEY (bot_id) REFERENCES user_bots(id) ON DELETE CASCADE,
                    INDEX idx_installed_libraries_bot_id (bot_id)
                )
            ''')
            
            logger.info("✅ Advanced database tables created/verified")
    
    async def get_user(self, user_id: int) -> Optional[User]:
        """دریافت اطلاعات کاربر"""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT * FROM users WHERE user_id = $1',
                user_id
            )
            if row:
                data = dict(row)
                data['settings'] = json.loads(data['settings']) if data['settings'] else {}
                return User(**data)
            return None
    
    async def create_user(self, user_id: int, username: str, first_name: str, 
                          last_name: Optional[str] = None, referred_by: Optional[int] = None) -> User:
        """ایجاد کاربر جدید با کد رفرال"""
        async with self.pool.acquire() as conn:
            # تولید کد رفرال یکتا
            referral_code = self.encryption.generate_referral_code(user_id)
            
            row = await conn.fetchrow('''
                INSERT INTO users (
                    user_id, username, first_name, last_name, 
                    referral_code, referred_by, created_at, last_active
                )
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    last_active = NOW()
                RETURNING *
            ''', user_id, username, first_name, last_name, referral_code, referred_by)
            
            # اگر کاربر با رفرال آمده، پاداش ثبت شود
            if referred_by:
                await self._process_referral(referred_by, user_id, referral_code)
            
            logger.info(f"✅ User {user_id} created/updated with referral code: {referral_code}")
            
            data = dict(row)
            data['settings'] = json.loads(data['settings']) if data['settings'] else {}
            return User(**data)
    
    async def _process_referral(self, referrer_id: int, referred_id: int, code: str):
        """پردازش رفرال"""
        async with self.pool.acquire() as conn:
            # ایجاد رکورد رفرال
            referral_id = hashlib.md5(f"{referrer_id}_{referred_id}_{time.time()}".encode()).hexdigest()[:16]
            
            await conn.execute('''
                INSERT INTO referrals (id, referrer_id, referred_id, code, created_at)
                VALUES ($1, $2, $3, $4, NOW())
            ''', referral_id, referrer_id, referred_id, code)
            
            # افزایش تعداد رفرال کاربر
            await conn.execute('''
                UPDATE users SET referral_count = referral_count + 1
                WHERE user_id = $1
            ''', referrer_id)
    
    async def get_user_by_referral_code(self, code: str) -> Optional[int]:
        """دریافت کاربر از روی کد رفرال"""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT user_id FROM users WHERE referral_code = $1',
                code
            )
            return row[0] if row else None
    
    async def verify_payment(self, user_id: int, card_number: str, card_holder: str) -> Tuple[bool, str]:
        """تایید پرداخت"""
        async with self.pool.acquire() as conn:
            # بررسی اطلاعات کارت
            if card_number.replace(' ', '') != PAYMENT_INFO['card_number'].replace(' ', ''):
                return False, "شماره کارت اشتباه است"
            
            # بررسی نام صاحب کارت (مخفی)
            if card_holder.strip().upper() != PAYMENT_INFO['card_holder_name']:
                return False, "اطلاعات نادرست است"
            
            # ایجاد پرداخت
            payment_id = hashlib.md5(f"{user_id}_{time.time()}".encode()).hexdigest()[:16]
            
            await conn.execute('''
                INSERT INTO payments (
                    id, user_id, amount, status, payment_method,
                    card_number, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ''', payment_id, user_id, PAYMENT_INFO['amount'], 'completed', 
                'card', PAYMENT_INFO['card_number'])
            
            # فعال‌سازی کاربر
            await conn.execute('''
                UPDATE users SET 
                    is_paid = TRUE,
                    payment_date = NOW(),
                    plan = 'premium',
                    balance = balance + $1
                WHERE user_id = $2
            ''', PAYMENT_INFO['amount'] * 0.1, user_id)  # 10% پاداش شارژ
            
            # پرداخت پاداش رفرال اگر وجود دارد
            user = await self.get_user(user_id)
            if user and user.referred_by:
                # 5% پاداش به معرف
                referral_bonus = PAYMENT_INFO['amount'] * 0.05
                await conn.execute('''
                    UPDATE users SET 
                        balance = balance + $1,
                        referral_earnings = referral_earnings + $1
                    WHERE user_id = $2
                ''', referral_bonus, user.referred_by)
                
                # آپدیت وضعیت رفرال
                await conn.execute('''
                    UPDATE referrals SET 
                        status = 'completed',
                        earnings = $1
                    WHERE referrer_id = $2 AND referred_id = $3
                ''', referral_bonus, user.referred_by, user_id)
            
            logger.info(f"✅ Payment verified for user {user_id}")
            return True, "پرداخت با موفقیت تایید شد"
    
    async def create_bot(self, bot: UserBot) -> bool:
        """ذخیره ربات جدید با توکن رمزنگاری شده"""
        async with self.pool.acquire() as conn:
            try:
                await conn.execute('''
                    INSERT INTO user_bots (
                        id, user_id, token, token_encrypted, name, username,
                        description, status, container_id, node_id, settings,
                        installed_libraries, created_at, last_active
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ''', bot.id, bot.user_id, 'ENCRYPTED', bot.token_encrypted, 
                    bot.name, bot.username, bot.description, bot.status,
                    bot.container_id, bot.node_id, json.dumps(bot.settings),
                    bot.installed_libraries, bot.created_at, bot.last_active)
                
                # آپدیت تعداد ربات‌های کاربر
                await conn.execute('''
                    UPDATE users SET bots_count = bots_count + 1
                    WHERE user_id = $1
                ''', bot.user_id)
                
                logger.info(f"✅ Bot {bot.id} created for user {bot.user_id}")
                return True
                
            except Exception as e:
                logger.error(f"❌ Failed to create bot: {e}")
                return False
    
    async def install_library(self, bot_id: str, library_name: str, version: str = 'latest'):
        """نصب کتابخانه روی ربات"""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                INSERT INTO installed_libraries (bot_id, library_name, library_version)
                VALUES ($1, $2, $3)
            ''', bot_id, library_name, version)
            
            # آپدیت لیست کتابخانه‌ها
            await conn.execute('''
                UPDATE user_bots SET 
                    installed_libraries = array_append(installed_libraries, $1)
                WHERE id = $2
            ''', f"{library_name}=={version}", bot_id)
    
    async def get_bot_token(self, bot_id: str) -> Optional[str]:
        """دریافت توکن اصلی ربات (رمزگشایی شده)"""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT token_encrypted FROM user_bots WHERE id = $1',
                bot_id
            )
            if row:
                return self.encryption.decrypt_token(row[0])
            return None
    
    async def close(self):
        """بستن connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("✅ PostgreSQL connection pool closed")

# ==================== کلاس مدیریت Redis ====================

class RedisManager:
    """مدیریت کش با Redis"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.client: Optional[aioredis.Redis] = None
    
    async def initialize(self):
        """راه‌اندازی اتصال به Redis"""
        try:
            self.client = await aioredis.from_url(
                f"redis://{self.config['host']}:{self.config['port']}",
                password=self.config['password'],
                db=self.config['db'],
                max_connections=self.config['max_connections'],
                decode_responses=self.config['decode_responses']
            )
            
            await self.client.ping()
            logger.info("✅ Redis connection established")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    async def cache_user(self, user: User, ttl: int = 3600):
        """کش کردن کاربر"""
        key = f"user:{user.user_id}"
        await self.client.setex(key, ttl, json.dumps(asdict(user), default=str))
    
    async def get_cached_user(self, user_id: int) -> Optional[User]:
        """دریافت کاربر از کش"""
        key = f"user:{user_id}"
        data = await self.client.get(key)
        if data:
            return User(**json.loads(data))
        return None
    
    async def cache_referral_code(self, code: str, user_id: int, ttl: int = 86400):
        """کش کردن کد رفرال"""
        key = f"referral:{code}"
        await self.client.setex(key, ttl, user_id)
    
    async def get_referral_user(self, code: str) -> Optional[int]:
        """دریافت کاربر از کد رفرال"""
        key = f"referral:{code}"
        data = await self.client.get(key)
        return int(data) if data else None
    
    async def close(self):
        """بستن اتصال Redis"""
        if self.client:
            await self.client.close()
            logger.info("✅ Redis connection closed")

# ==================== کلاس اصلی ربات مادر ====================

class MotherBot:
    """ربات مادر فوق‌پیشرفته با سیستم رفرال و پرداخت"""
    
    def __init__(self):
        self.bot = bot
        self.db = DatabaseManager(DB_CONFIG)
        self.redis = RedisManager(REDIS_CONFIG)
        self.encryption = EncryptionManager()
        
        self.running = True
        self.start_time = datetime.now()
        self.stats = {
            'total_requests': 0,
            'total_bots': 0,
            'total_users': 0,
            'active_bots': 0,
            'total_payments': 0,
            'total_referrals': 0
        }
        
        self.executor = ThreadPoolExecutor(max_workers=200)
        self.pending_payments: Dict[int, Dict] = {}
        
        logger.info("🤖 Advanced MotherBot instance created")
    
    async def initialize(self):
        """راه‌اندازی همه سرویس‌ها"""
        try:
            await self.db.initialize()
            await self.redis.initialize()
            
            asyncio.create_task(self._update_stats())
            asyncio.create_task(self._cleanup_temp_files())
            
            logger.info("✅ All services initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize services: {e}")
            raise
    
    async def _update_stats(self):
        """به‌روزرسانی آمار"""
        while self.running:
            try:
                async with self.db.pool.acquire() as conn:
                    row = await conn.fetchrow('SELECT COUNT(*) FROM users')
                    self.stats['total_users'] = row[0]
                    
                    row = await conn.fetchrow('SELECT COUNT(*) FROM user_bots')
                    self.stats['total_bots'] = row[0]
                    
                    row = await conn.fetchrow(
                        'SELECT COUNT(*) FROM user_bots WHERE status = $1',
                        'running'
                    )
                    self.stats['active_bots'] = row[0]
                    
                    row = await conn.fetchrow(
                        'SELECT COUNT(*) FROM payments WHERE status = $1',
                        'completed'
                    )
                    self.stats['total_payments'] = row[0]
                    
                    row = await conn.fetchrow('SELECT COUNT(*) FROM referrals')
                    self.stats['total_referrals'] = row[0]
                
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error updating stats: {e}")
                await asyncio.sleep(10)
    
    async def _cleanup_temp_files(self):
        """پاک‌سازی فایل‌های موقت"""
        while self.running:
            try:
                now = time.time()
                for item in os.listdir(TEMP_DIR):
                    item_path = os.path.join(TEMP_DIR, item)
                    if os.path.getctime(item_path) < now - 3600:  # older than 1 hour
                        if os.path.isfile(item_path):
                            os.remove(item_path)
                        else:
                            shutil.rmtree(item_path)
                
                await asyncio.sleep(1800)  # every 30 minutes
                
            except Exception as e:
                logger.error(f"Error cleaning temp files: {e}")
                await asyncio.sleep(60)
    
    # ==================== هندلرهای پیشرفته تلگرام ====================
    
    def setup_handlers(self):
        """تنظیم هندلرهای تلگرام"""
        
        @self.bot.message_handler(commands=['start'])
        def cmd_start(message):
            asyncio.create_task(self._handle_start(message))
        
        @self.bot.message_handler(commands=['referral'])
        def cmd_referral(message):
            asyncio.create_task(self._handle_referral(message))
        
        @self.bot.message_handler(commands=['help'])
        def cmd_help(message):
            asyncio.create_task(self._handle_help(message))
        
        @self.bot.message_handler(commands=['stats'])
        def cmd_stats(message):
            asyncio.create_task(self._handle_stats(message))
        
        @self.bot.message_handler(commands=['bots'])
        def cmd_bots(message):
            asyncio.create_task(self._handle_bots(message))
        
        @self.bot.message_handler(commands=['balance'])
        def cmd_balance(message):
            asyncio.create_task(self._handle_balance(message))
        
        @self.bot.message_handler(commands=['install'])
        def cmd_install(message):
            asyncio.create_task(self._handle_install_library(message))
        
        @self.bot.message_handler(content_types=['document'])
        def handle_document(message):
            asyncio.create_task(self._handle_document(message))
        
        @self.bot.message_handler(func=lambda m: True)
        def handle_text(message):
            asyncio.create_task(self._handle_text(message))
        
        @self.bot.callback_query_handler(func=lambda call: True)
        def handle_callback(call):
            asyncio.create_task(self._handle_callback(call))
    
    async def _handle_start(self, message):
        """هندلر پیشرفته /start با پشتیبانی از رفرال"""
        user_id = message.from_user.id
        username = message.from_user.username or ""
        first_name = message.from_user.first_name or ""
        last_name = message.from_user.last_name
        
        # بررسی کد رفرال
        referred_by = None
        args = message.text.split()
        if len(args) > 1:
            referral_code = args[1]
            # بررسی کد رفرال
            referred_by = await self.redis.get_referral_user(referral_code)
            if not referred_by:
                referred_by = await self.db.get_user_by_referral_code(referral_code)
        
        # ایجاد کاربر
        user = await self.db.create_user(user_id, username, first_name, last_name, referred_by)
        
        # کش کردن کد رفرال
        await self.redis.cache_referral_code(user.referral_code, user_id, 86400 * 30)
        
        # کش کردن کاربر
        await self.redis.cache_user(user, 3600)
        
        # بررسی وضعیت پرداخت
        if not user.is_paid:
            # ارسال منوی محدود
            markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
            markup.add(
                types.KeyboardButton('💰 خرید اشتراک'),
                types.KeyboardButton('🎁 رفرال'),
                types.KeyboardButton('📚 راهنما')
            )
            
            text = f"🚀 **به ربات مادر خوش آمدید {first_name}!**\n\n"
            text += f"⚠️ برای استفاده از امکانات، ابتدا اشتراک خود را فعال کنید.\n\n"
            text += f"💰 هزینه اشتراک: {PAYMENT_INFO['amount_text']}\n"
            text += f"🎁 با معرفی دوستان، ۵٪ پاداش بگیرید!"
            
        else:
            # منوی کامل برای کاربران فعال
            markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
            markup.add(
                types.KeyboardButton('🤖 ساخت ربات جدید'),
                types.KeyboardButton('📋 ربات‌های من'),
                types.KeyboardButton('💰 کیف پول'),
                types.KeyboardButton('🎁 رفرال'),
                types.KeyboardButton('📊 آمار'),
                types.KeyboardButton('📚 راهنما'),
                types.KeyboardButton('📞 پشتیبانی')
            )
            
            text = f"🚀 **به ربات مادر خوش آمدید {first_name}!**\n\n"
            text += f"👤 کاربر ویژه: {user_id}\n"
            text += f"💰 موجودی: {user.balance:,} تومان\n"
            text += f"🤖 ربات‌ها: {user.bots_count}\n"
            text += f"🎁 رفرال‌ها: {user.referral_count}\n\n"
            text += f"📤 فایل خود را آپلود کنید تا رباتتان ساخته شود."
        
        await self._send_message(message.chat.id, text, reply_markup=markup)
    
    async def _handle_referral(self, message):
        """هندلر رفرال"""
        user_id = message.from_user.id
        user = await self.db.get_user(user_id)
        
        if not user:
            await self._send_message(message.chat.id, "❌ کاربر یافت نشد!")
            return
        
        referral_link = f"https://t.me/{(await self.bot.get_me()).username}?start={user.referral_code}"
        
        text = "🎁 **سیستم رفرال**\n\n"
        text += f"🔗 **لینک رفرال شما:**\n`{referral_link}`\n\n"
        text += f"📊 **آمار شما:**\n"
        text += f"• تعداد رفرال: {user.referral_count} نفر\n"
        text += f"• درآمد رفرال: {user.referral_earnings:,} تومان\n\n"
        text += "💰 **پاداش‌ها:**\n"
        text += "• ۵٪ از خرید هر نفر به شما تعلق می‌گیرد\n"
        text += "• پاداش بلافاصله پس از خرید دوستان واریز می‌شود\n"
        text += "• هر چقدر بیشتر معرفی کنید، درآمدتان بیشتر می‌شود"
        
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("📋 کپی لینک", callback_data="copy_referral"))
        markup.add(types.InlineKeyboardButton("🔄 به‌روزرسانی", callback_data="refresh_referral"))
        
        await self._send_message(message.chat.id, text, reply_markup=markup)
    
    async def _handle_balance(self, message):
        """هندلر کیف پول"""
        user_id = message.from_user.id
        user = await self.db.get_user(user_id)
        
        text = f"💰 **کیف پول شما**\n\n"
        text += f"موجودی: {user.balance:,} تومان\n"
        text += f"پلن: {'ویژه' if user.is_paid else 'رایگان'}\n"
        text += f"ربات‌ها: {user.bots_count}\n\n"
        
        if not user.is_paid:
            text += f"⚠️ برای فعال‌سازی اشتراک:\n"
            text += f"💳 مبلغ {PAYMENT_INFO['amount_text']} به کارت زیر واریز کنید:\n\n"
            text += f"`{PAYMENT_INFO['card_number']}`\n\n"
            text += f"✅ پس از واریز، شماره کارت و نام صاحب کارت را ارسال کنید تا اشتراک شما فعال شود."
            
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
            markup.add(types.KeyboardButton('✅ تایید پرداخت'))
            await self._send_message(message.chat.id, text, reply_markup=markup)
        else:
            text += "**امکانات ویژه:**\n"
            text += "• ساخت ربات نامحدود\n"
            text += "• نصب کتابخانه دلخواه\n"
            text += "• پشتیبانی ۲۴ ساعته\n"
            text += "• فضای نامحدود"
            
            await self._send_message(message.chat.id, text)
    
    async def _handle_install_library(self, message):
        """هندلر نصب کتابخانه"""
        user_id = message.from_user.id
        user = await self.db.get_user(user_id)
        
        if not user.is_paid:
            await self._send_message(
                message.chat.id,
                "❌ این قابلیت فقط برای کاربران ویژه است!\n"
                f"💰 برای فعال‌سازی، {PAYMENT_INFO['amount_text']} پرداخت کنید."
            )
            return
        
        text = "📦 **نصب کتابخانه دلخواه**\n\n"
        text += "فرمت ارسال:\n"
        text += "`/install bot_id library_name [version]`\n\n"
        text += "مثال:\n"
        text += "`/install abc123 requests`\n"
        text += "`/install abc123 flask 2.3.0`\n\n"
        text += "📋 **لیست ربات‌های شما:**\n"
        
        bots = await self.db.get_user_bots(user_id)
        for bot in bots[:5]:
            text += f"• {bot.id} - {bot.name}\n"
        
        await self._send_message(message.chat.id, text)
    
    async def _handle_document(self, message):
        """هندلر آپلود فایل با بررسی پرداخت"""
        user_id = message.from_user.id
        user = await self.db.get_user(user_id)
        
        # بررسی فعال بودن کاربر
        if not user.is_paid:
            await self._send_message(
                message.chat.id,
                f"❌ شما اجازه ساخت ربات ندارید!\n"
                f"💰 برای فعال‌سازی، {PAYMENT_INFO['amount_text']} پرداخت کنید."
            )
            return
        
        file_name = message.document.file_name
        
        status_msg = await self._send_message(
            message.chat.id,
            "🔄 در حال پردازش فایل..."
        )
        
        try:
            # دانلود فایل با مدیریت خطا
            file_info = await self.bot.get_file(message.document.file_id)
            downloaded_file = await self.bot.download_file(file_info.file_path)
            
            temp_dir = os.path.join(TEMP_DIR, f"user_{user_id}_{int(time.time())}")
            os.makedirs(temp_dir, exist_ok=True)
            
            file_path = os.path.join(temp_dir, file_name)
            with open(file_path, 'wb') as f:
                f.write(downloaded_file)
            
            # استخراج و پردازش فایل
            files = {}
            if file_name.endswith('.zip'):
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
                
                for root, _, filenames in os.walk(temp_dir):
                    for f in filenames:
                        if f.endswith('.py'):
                            try:
                                with open(os.path.join(root, f), 'r', encoding='utf-8') as fh:
                                    files[f] = fh.read()
                            except UnicodeDecodeError:
                                with open(os.path.join(root, f), 'r', encoding='latin-1') as fh:
                                    files[f] = fh.read()
            
            elif file_name.endswith('.py'):
                with open(file_path, 'r', encoding='utf-8') as fh:
                    files[file_name] = fh.read()
            
            else:
                await self._edit_message(
                    status_msg.chat.id,
                    status_msg.message_id,
                    "❌ فرمت فایل مجاز نیست!\nفقط .py و .zip"
                )
                shutil.rmtree(temp_dir)
                return
            
            # پیدا کردن فایل اصلی
            main_file = None
            for fname in files:
                if fname.endswith('.py'):
                    main_file = fname
                    break
            
            if not main_file:
                await self._edit_message(
                    status_msg.chat.id,
                    status_msg.message_id,
                    "❌ هیچ فایل پایتونی پیدا نشد!"
                )
                shutil.rmtree(temp_dir)
                return
            
            # استخراج توکن با الگوریتم پیشرفته
            token_patterns = [
                r'token\s*=\s*["\']([^"\']+)["\']',
                r'API_TOKEN\s*=\s*["\']([^"\']+)["\']',
                r'BOT_TOKEN\s*=\s*["\']([^"\']+)["\']',
                r'TELEGRAM_TOKEN\s*=\s*["\']([^"\']+)["\']'
            ]
            
            token = None
            for pattern in token_patterns:
                match = re.search(pattern, files[main_file], re.IGNORECASE)
                if match:
                    token = match.group(1)
                    break
            
            if not token:
                await self._edit_message(
                    status_msg.chat.id,
                    status_msg.message_id,
                    "❌ توکن در کد پیدا نشد!"
                )
                shutil.rmtree(temp_dir)
                return
            
            # تست توکن با retry
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(
                            f"https://api.telegram.org/bot{token}/getMe",
                            timeout=10
                        ) as resp:
                            if resp.status == 200:
                                bot_info = await resp.json()
                                bot_name = bot_info['result']['first_name']
                                bot_username = bot_info['result']['username']
                                break
                            else:
                                if attempt == max_retries - 1:
                                    await self._edit_message(
                                        status_msg.chat.id,
                                        status_msg.message_id,
                                        "❌ توکن معتبر نیست!"
                                    )
                                    shutil.rmtree(temp_dir)
                                    return
                                await asyncio.sleep(1)
                except Exception as e:
                    if attempt == max_retries - 1:
                        await self._edit_message(
                            status_msg.chat.id,
                            status_msg.message_id,
                            f"❌ خطا در ارتباط با تلگرام: {str(e)}"
                        )
                        shutil.rmtree(temp_dir)
                        return
                    await asyncio.sleep(1)
            
            # آیدی یکتا برای ربات
            bot_id = hashlib.md5(f"{user_id}_{token}_{time.time()}".encode()).hexdigest()[:16]
            
            # رمزنگاری توکن
            encrypted_token = self.encryption.encrypt_token(token)
            
            # ذخیره در دیتابیس (فعلا بدون اجرا)
            bot = UserBot(
                id=bot_id,
                user_id=user_id,
                token='ENCRYPTED',
                token_encrypted=encrypted_token,
                name=bot_name,
                username=bot_username,
                description="",
                status='pending',
                container_id=None,
                node_id='node1',
                cpu_usage=0,
                memory_usage=0,
                disk_usage=0,
                requests_count=0,
                errors_count=0,
                last_error=None,
                created_at=datetime.now(),
                last_active=datetime.now(),
                settings={},
                installed_libraries=[]
            )
            
            await self.db.create_bot(bot)
            
            # پاک‌سازی
            shutil.rmtree(temp_dir)
            
            success_text = f"✅ **ربات با موفقیت ثبت شد!**\n\n"
            success_text += f"🤖 نام: {bot_name}\n"
            success_text += f"🔗 لینک: https://t.me/{bot_username}\n"
            success_text += f"🆔 آیدی: {bot_id}\n"
            success_text += f"🔄 وضعیت: در انتظار اجرا\n\n"
            success_text += f"📦 برای اجرا و نصب کتابخانه از دستورات زیر استفاده کنید:\n"
            success_text += f"• `/run {bot_id}` - اجرای ربات\n"
            success_text += f"• `/install {bot_id} requests` - نصب کتابخانه"
            
            await self._edit_message(
                status_msg.chat.id,
                status_msg.message_id,
                success_text
            )
            
        except Exception as e:
            logger.error(f"Error processing file: {e}\n{traceback.format_exc()}")
            await self._edit_message(
                status_msg.chat.id,
                status_msg.message_id,
                f"❌ خطا: {str(e)}"
            )
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
    
    async def _handle_text(self, message):
        """هندلر متن با پشتیبانی از پرداخت"""
        text = message.text
        user_id = message.from_user.id
        
        if text == '💰 خرید اشتراک' or text == '✅ تایید پرداخت':
            await self._handle_balance(message)
            
        elif text == '🎁 رفرال':
            await self._handle_referral(message)
            
        elif text == '🤖 ساخت ربات جدید':
            user = await self.db.get_user(user_id)
            if user and user.is_paid:
                await self._send_message(
                    message.chat.id,
                    "📤 **فایل خود را ارسال کنید**\n\n"
                    "✅ فایل `.py` یا `.zip` بفرستید.\n"
                    "✅ توکن باید داخل کد باشه.\n"
                    "✅ حجم فایل تا ۵۰ مگابایت."
                )
            else:
                await self._handle_balance(message)
        
        elif text == '📋 ربات‌های من':
            await self._handle_bots(message)
        
        elif text == '💰 کیف پول':
            await self._handle_balance(message)
        
        elif text == '📊 آمار':
            await self._handle_stats(message)
        
        elif text == '📚 راهنما':
            await self._handle_help(message)
        
        elif text == '📞 پشتیبانی':
            await self._send_message(
                message.chat.id,
                "📞 **پشتیبانی**\n\n"
                "برای ارتباط با پشتیبانی:\n"
                "• @signaliiii_bot\n"
                "• ۲۴ ساعته پاسخگو هستیم"
            )
        
        # بررسی پرداخت (اگر کاربر شماره کارت و نام فرستاد)
        elif len(text.split()) >= 2 and text.replace(' ', '').isdigit():
            # احتمالاً شماره کارت است
            parts = text.split('\n')
            if len(parts) >= 2:
                card_number = parts[0].strip()
                card_holder = parts[1].strip()
                
                status, msg = await self.db.verify_payment(user_id, card_number, card_holder)
                
                if status:
                    await self._send_message(
                        message.chat.id,
                        f"✅ {msg}\n\n"
                        f"تبریک! اشتراک شما فعال شد.\n"
                        f"اکنون می‌توانید ربات خود را بسازید."
                    )
                    
                    # آپدیت منو
                    await self._handle_start(message)
                else:
                    await self._send_message(
                        message.chat.id,
                        f"❌ {msg}\nلطفاً اطلاعات صحیح را ارسال کنید."
                    )
    
    async def _handle_callback(self, call):
        """هندلر callback_query"""
        if call.data == "copy_referral":
            await self.bot.answer_callback_query(
                call.id,
                "لینک کپی شد!",
                show_alert=False
            )
        elif call.data == "refresh_referral":
            await self._handle_referral(call.message)
    
    async def _handle_bots(self, message):
        """هندلر لیست ربات‌ها"""
        user_id = message.from_user.id
        
        bots = await self.db.get_user_bots(user_id, limit=10)
        
        if not bots:
            await self._send_message(
                message.chat.id,
                "📋 شما هنوز رباتی نساخته‌اید!"
            )
            return
        
        text = "📋 **ربات‌های شما:**\n\n"
        for bot in bots:
            emoji = "🟢" if bot.status == 'running' else "🟡" if bot.status == 'pending' else "🔴"
            text += f"{emoji} **{bot.name}**\n"
            text += f"   🆔 `{bot.id}`\n"
            text += f"   🔗 https://t.me/{bot.username}\n"
            text += f"   📊 CPU: {bot.cpu_usage:.1f}% | RAM: {bot.memory_usage:.1f}MB\n"
            text += f"   📦 کتابخانه‌ها: {len(bot.installed_libraries)}\n"
            text += f"   📅 {bot.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
        
        await self._send_message(message.chat.id, text)
    
    async def _handle_stats(self, message):
        """هندلر آمار"""
        uptime = datetime.now() - self.start_time
        hours = uptime.total_seconds() / 3600
        
        text = f"📊 **آمار ربات مادر**\n\n"
        text += f"⏱ آپتایم: {hours:.1f} ساعت\n"
        text += f"👥 کاربران کل: {self.stats['total_users']:,}\n"
        text += f"👤 کاربران ویژه: {self.stats['total_payments']:,}\n"
        text += f"🤖 ربات‌ها: {self.stats['total_bots']:,}\n"
        text += f"🟢 فعال: {self.stats['active_bots']:,}\n"
        text += f"🎁 رفرال‌ها: {self.stats['total_referrals']:,}\n"
        text += f"⚡ وضعیت: 🟢 عالی"
        
        await self._send_message(message.chat.id, text)
    
    async def _handle_help(self, message):
        """هندلر راهنما"""
        help_text = (
            "📚 **راهنمای جامع**\n\n"
            "**💰 فعال‌سازی اشتراک:**\n"
            f"• واریز {PAYMENT_INFO['amount_text']} به کارت:\n"
            f"`{PAYMENT_INFO['card_number']}`\n"
            "• ارسال شماره کارت و نام صاحب کارت\n\n"
            
            "**🎁 سیستم رفرال:**\n"
            "• هر نفر ۵٪ پاداش خرید\n"
            "• لینک رفرال خود را分享 کنید\n\n"
            
            "**🤖 ساخت ربات:**\n"
            "• فایل `.py` یا `.zip` آپلود کنید\n"
            "• توکن باید داخل کد باشد\n\n"
            
            "**📦 نصب کتابخانه:**\n"
            "• `/install bot_id library_name`\n"
            "• مثال: `/install abc123 requests`\n\n"
            
            "**📋 دستورات:**\n"
            "• /bots - لیست ربات‌ها\n"
            "• /balance - کیف پول\n"
            "• /referral - رفرال\n"
            "• /stats - آمار"
        )
        
        await self._send_message(message.chat.id, help_text)
    
    async def _send_message(self, chat_id, text, **kwargs):
        """ارسال پیام با مدیریت خطا"""
        try:
            return await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.bot.send_message(
                    chat_id,
                    text,
                    parse_mode='Markdown',
                    **kwargs
                )
            )
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return None
    
    async def _edit_message(self, chat_id, message_id, text, **kwargs):
        """ویرایش پیام با مدیریت خطا"""
        try:
            return await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.bot.edit_message_text(
                    text,
                    chat_id,
                    message_id,
                    parse_mode='Markdown',
                    **kwargs
                )
            )
        except Exception as e:
            logger.error(f"Error editing message: {e}")
            return None
    
    async def run(self):
        """اجرای ربات"""
        try:
            await self.initialize()
            self.setup_handlers()
            
            logger.info("🚀 Advanced MotherBot started successfully")
            
            while self.running:
                try:
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.bot.infinity_polling(timeout=60, long_polling_timeout=60)
                    )
                except Exception as e:
                    logger.error(f"Bot polling error: {e}")
                    await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Fatal error: {e}")
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """پاک‌سازی منابع"""
        logger.info("🔄 Cleaning up resources...")
        
        self.running = False
        
        await self.db.close()
        await self.redis.close()
        self.executor.shutdown()
        
        logger.info("✅ Cleanup completed")

# ==================== اجرای اصلی ====================

async def main():
    """تابع اصلی"""
    mother_bot = MotherBot()
    
    try:
        await mother_bot.run()
    except KeyboardInterrupt:
        logger.info("🛑 Received shutdown signal")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        await mother_bot.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
