import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_async_session
from repositories.product import ProductRepository
from repositories.cart import CartRepository
from api.deps import get_current_user_id

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-intent")
async def create_payment_intent(
    request: Request,
    db: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user_id),
):
    # Only accept cart_id or list of items (not amount)
    cart_repo = CartRepository(db)
    cart = await cart_repo.get_cart_by_user_id(user_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="No items in cart")
    # Securely compute total from products/prices
    total = 0
    for item in cart.items:
        if not item.product or item.product.price is None:
            raise HTTPException(status_code=400, detail="Invalid product in cart")
        total += int(item.product.price * 100) * item.quantity  # price (in cents)
    try:
        intent = stripe.PaymentIntent.create(
            amount=total,
            currency="usd",
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None, convert_underscores=False)):
    payload = await request.body()
    sig_header = stripe_signature or request.headers.get('stripe-signature')
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": f"Webhook error: {e}"})
    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        # TODO: Mark order as paid/fulfilled in your DB here
        print("PaymentIntent was successful:", payment_intent.id)
    return {"status": "success"}
