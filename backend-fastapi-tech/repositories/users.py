from sqlalchemy import select

from models.users import User
from utils.repository import SQLAlchemyRepository


class UsersRepository(SQLAlchemyRepository):
    model = User

    async def find_by_email(self, email: str):
        return await self.find_one(email=email)

    async def get_db_user(self, email: str) -> User | None:
        stmt = select(User).filter_by(email=email)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
