from backend.api.orders import router as orders_router
from backend.api.products import router as products_router
from backend.api.users import router as users_router

all_routers = [
    users_router,
    products_router,
    orders_router,
]
