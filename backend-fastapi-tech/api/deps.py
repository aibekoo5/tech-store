import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from models.user import User

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")

bearer = HTTPBearer(auto_error=False)


async def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    """Extracts the user id from the 'Authorization: Bearer <jwt>' header."""
    if creds is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["id"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_current_admin(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_session),
) -> User:
    """Allows the request only for users with is_admin=True (checked in the DB on every call,
    so revoking admin rights takes effect immediately)."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
