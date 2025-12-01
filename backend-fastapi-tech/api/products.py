from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from schemas.products import ProductCreate, ProductRead, ProductUpdate
from schemas.users import UserRead
from services.products import ProductsService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductRead])
async def list_products(uow: UOWDep):
    return await ProductsService().list_products(uow)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, uow: UOWDep):
    return await ProductsService().get_product(uow, product_id)


@router.post("", response_model=dict)
async def create_product(
    payload: ProductCreate,
    uow: UOWDep,
    current_user: UserRead = Depends(get_current_user),
):
    product_id = await ProductsService().create_product(uow, payload)
    return {"product_id": product_id}


@router.patch("/{product_id}", response_model=dict)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    uow: UOWDep,
    current_user: UserRead = Depends(get_current_user),
):
    await ProductsService().update_product(uow, product_id, payload)
    return {"ok": True}
