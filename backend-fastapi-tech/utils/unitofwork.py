from abc import ABC, abstractmethod
from typing import Type

from db.db import async_session_maker
from repositories.order_items import OrderItemsRepository
from repositories.orders import OrdersRepository
from repositories.products import ProductsRepository
from repositories.users import UsersRepository


class IUnitOfWork(ABC):
    users: Type[UsersRepository]
    products: Type[ProductsRepository]
    orders: Type[OrdersRepository]
    order_items: Type[OrderItemsRepository]

    @abstractmethod
    def __init__(self):
        ...

    @abstractmethod
    async def __aenter__(self):
        ...

    @abstractmethod
    async def __aexit__(self, *args):
        ...

    @abstractmethod
    async def commit(self):
        ...

    @abstractmethod
    async def rollback(self):
        ...


class UnitOfWork:
    def __init__(self):
        self.session_factory = async_session_maker

    async def __aenter__(self):
        self.session = self.session_factory()

        self.users = UsersRepository(self.session)
        self.products = ProductsRepository(self.session)
        self.orders = OrdersRepository(self.session)
        self.order_items = OrderItemsRepository(self.session)
        return self

    async def __aexit__(self, *args):
        exc_type = args[0] if args else None
        if exc_type:
            await self.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
