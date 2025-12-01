from abc import ABC, abstractmethod
from typing import Any, Iterable

from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession


class AbstractRepository(ABC):
    @abstractmethod
    async def add_one(self, data: dict) -> Any:
        raise NotImplementedError

    @abstractmethod
    async def find_all(self) -> Iterable[Any]:
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_one(self, data: dict):
        stmt = insert(self.model).values(**data).returning(self.model.id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def edit_one(self, id: Any, data: dict):
        stmt = (
            update(self.model)
            .values(**data)
            .filter_by(id=id)
            .returning(self.model.id)
        )
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def find_all(self):
        stmt = select(self.model)
        res = await self.session.execute(stmt)
        return [row[0].to_read_model() for row in res.all()]

    async def find_one(self, **filter_by):
        stmt = select(self.model).filter_by(**filter_by)
        res = await self.session.execute(stmt)
        row = res.scalar_one_or_none()
        return row.to_read_model() if row else None
