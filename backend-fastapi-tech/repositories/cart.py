from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models.cart import Cart, CartItem
from typing import Optional, List


class CartRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_cart_by_user_id(self, user_id: int) -> Optional[Cart]:
        result = await self.db.execute(
            select(Cart)
            .execution_options(populate_existing=True)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.user_id == user_id)
        )
        return result.scalars().first()

    async def get_or_create_cart(self, user_id: int) -> Cart:
        cart = await self.get_cart_by_user_id(user_id)
        if cart:
            return cart
        self.db.add(Cart(user_id=user_id))
        await self.db.commit()
        return await self.get_cart_by_user_id(user_id)

    async def _get_item(self, cart: Cart, product_id: int) -> Optional[CartItem]:
        result = await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        )
        return result.scalars().first()

    async def add_item(self, cart: Cart, product_id: int, quantity: int = 1) -> CartItem:
        item = await self._get_item(cart, product_id)
        if item:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            self.db.add(item)
        await self.db.commit()
        return item

    async def remove_item(self, cart: Cart, product_id: int):
        item = await self._get_item(cart, product_id)
        if item:
            await self.db.delete(item)
            await self.db.commit()

    async def update_quantity(self, cart: Cart, product_id: int, quantity: int):
        item = await self._get_item(cart, product_id)
        if not item:
            return None
        if quantity <= 0:
            await self.db.delete(item)
        else:
            item.quantity = quantity
        await self.db.commit()
        return item

    async def clear_cart(self, cart: Cart):
        result = await self.db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
        for item in result.scalars().all():
            await self.db.delete(item)
        await self.db.commit()

    async def list_cart_items(self, cart: Cart) -> List[CartItem]:
        result = await self.db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
        return result.scalars().all()
