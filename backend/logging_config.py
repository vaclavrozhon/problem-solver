"""
Logging configuration for the Automatic Researcher backend.

This module sets up structured logging with different levels and formats
for development and production environments.
"""

import logging
import sys
import os
from datetime import datetime
from typing import Dict, Any
import json


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'endpoint'):
            log_entry['endpoint'] = record.endpoint
        if hasattr(record, 'method'):
            log_entry['method'] = record.method
        if hasattr(record, 'status_code'):
            log_entry['status_code'] = record.status_code
        if hasattr(record, 'response_time'):
            log_entry['response_time'] = record.response_time
        if hasattr(record, 'error_type'):
            log_entry['error_type'] = record.error_type
        if hasattr(record, 'error_details'):
            log_entry['error_details'] = record.error_details
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)


def setup_logging() -> logging.Logger:
    """
    Set up logging configuration for the application.
    
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger("automatic_researcher")
    logger.setLevel(logging.DEBUG)
    
    # Remove existing handlers to avoid duplicates
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    # Set formatter based on environment
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        # Use JSON formatting for production
        formatter = JSONFormatter()
    else:
        # Use human-readable formatting for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Add file handler for persistent logging
    log_file = os.getenv("LOG_FILE", "backend.log")
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Set specific loggers to appropriate levels
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    
    return logger


def get_logger(name: str = None) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (defaults to 'automatic_researcher')
        
    Returns:
        Logger instance
    """
    if name:
        return logging.getLogger(f"automatic_researcher.{name}")
    return logging.getLogger("automatic_researcher")


# Initialize logging
main_logger = setup_logging()
