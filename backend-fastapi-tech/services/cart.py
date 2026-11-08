from repositories.cart import CartRepository
from models.cart import Cart, CartItem
from typing import List


class CartService:
    def __init__(self, repo: CartRepository):
        self.repo = repo

    async def get_cart(self, user_id: int) -> Cart:
        return await self.repo.get_or_create_cart(user_id)

    async def add_item(self, cart: Cart, product_id: int, quantity: int = 1) -> CartItem:
        return await self.repo.add_item(cart, product_id, quantity)

    async def remove_item(self, cart: Cart, product_id: int):
        await self.repo.remove_item(cart, product_id)

    async def update_quantity(self, cart: Cart, product_id: int, quantity: int):
        return await self.repo.update_quantity(cart, product_id, quantity)

    async def clear_cart(self, cart: Cart):
        await self.repo.clear_cart(cart)

    async def list_cart_items(self, cart: Cart) -> List[CartItem]:
        return await self.repo.list_cart_items(cart)
