import { Link } from "react-router-dom";
import { X, ShoppingBag, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "../../hooks/cart/useCartTan";
import useAuthStore from "../../store/authStore";
import useGuestCartStore from "../../store/guestCartStore";
import { toast } from "react-toastify";
import { getProductImageUrl } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

const EmptyCartIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 132 132"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="111.467"
      y="14.6665"
      width="5.86667"
      height="5.86667"
      rx="2.93333"
      fill="#0D9488"
    />
    <rect x="11" y="29.3333" width="4.4" height="4.4" rx="2.2" fill="#0D9488" />
    <rect
      x="121"
      y="91.6663"
      width="3.66667"
      height="3.66667"
      rx="1.83333"
      fill="#0D9488"
    />
    <mask id="path-4-inside-1_905_2877" fill="white">
      <path d="M36.6667 36.6671C36.6667 20.4667 49.7997 7.33374 66.0001 7.33374V7.33374C82.2004 7.33374 95.3334 20.4667 95.3334 36.6671V44.0004H36.6667V36.6671Z" />
    </mask>
    <path
      d="M32.2667 36.6671C32.2667 18.0367 47.3697 2.93374 66.0001 2.93374H66.0001C84.6305 2.93374 99.7334 18.0367 99.7334 36.6671L90.9334 36.6671C90.9334 22.8968 79.7704 11.7337 66.0001 11.7337H66.0001C52.2298 11.7337 41.0667 22.8968 41.0667 36.6671L32.2667 36.6671ZM95.3334 44.0004H36.6667H95.3334ZM32.2667 44.0004V36.6671C32.2667 18.0367 47.3697 2.93374 66.0001 2.93374L66.0001 11.7337C52.2298 11.7337 41.0667 22.8968 41.0667 36.6671V44.0004H32.2667ZM66.0001 2.93374C84.6305 2.93374 99.7334 18.0367 99.7334 36.6671V44.0004H90.9334V36.6671C90.9334 22.8968 79.7704 11.7337 66.0001 11.7337L66.0001 2.93374Z"
      fill="#E5E7EB"
      mask="url(#path-4-inside-1_905_2877)"
    />
    <g clipPath="url(#clip0_905_2877)">
      <path
        d="M14.6667 52.7998C14.6667 47.9397 18.6066 43.9998 23.4667 43.9998H108.533C113.394 43.9998 117.333 47.9397 117.333 52.7998V102.666C117.333 110.767 110.767 117.333 102.667 117.333H29.3334C21.2332 117.333 14.6667 110.767 14.6667 102.666V52.7998Z"
        fill="url(#paint0_linear_905_2877)"
      />
      <path
        d="M14.6667 52.7995C14.6667 47.9394 18.6066 43.9995 23.4667 43.9995H108.533C113.394 43.9995 117.333 47.9394 117.333 52.7995V58.6662H14.6667V52.7995Z"
        fill="url(#paint1_linear_905_2877)"
      />
    </g>
    <rect
      x="29.3333"
      y="114.4"
      width="17.6"
      height="17.6"
      rx="8.8"
      fill="#E5E7EB"
    />
    <rect
      x="34.4666"
      y="119.533"
      width="7.33333"
      height="7.33333"
      rx="3.66667"
      fill="white"
    />
    <rect
      x="85.0667"
      y="114.4"
      width="17.6"
      height="17.6"
      rx="8.8"
      fill="#E5E7EB"
    />
    <rect
      x="90.2"
      y="119.533"
      width="7.33333"
      height="7.33333"
      rx="3.66667"
      fill="white"
    />
    <defs>
      <linearGradient
        id="paint0_linear_905_2877"
        x1="22.0001"
        y1="36.6664"
        x2="110"
        y2="124.666"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F9FAFB" />
        <stop offset="1" stopColor="#F3F4F6" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_905_2877"
        x1="36.6667"
        y1="21.9995"
        x2="95.3334"
        y2="80.6662"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F3F4F6" />
        <stop offset="1" stopColor="#E5E7EB" />
      </linearGradient>
      <clipPath id="clip0_905_2877">
        <path
          d="M14.6667 52.7998C14.6667 47.9397 18.6066 43.9998 23.4667 43.9998H108.533C113.394 43.9998 117.333 47.9397 117.333 52.7998V102.666C117.333 110.767 110.767 117.333 102.667 117.333H29.3334C21.2332 117.333 14.6667 110.767 14.6667 102.666V52.7998Z"
          fill="white"
        />
      </clipPath>
    </defs>
  </svg>
);

export default function CartSlider({ isOpen, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useCart({ enabled: isAuthenticated });
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();

  const {
    items: guestCartItems,
    updateItemQuantity: updateGuestCartQuantity,
    removeItem: removeGuestCartItem,
    getCartTotals: getGuestCartTotals,
  } = useGuestCartStore();

  const cart = data?.data?.cart;
  const cartItems = isAuthenticated ? cart?.items || [] : guestCartItems;
  const guestTotals = getGuestCartTotals();
  const totalItems = isAuthenticated
    ? cart?.totalItems || 0
    : guestTotals.itemCount;
  const subtotal = isAuthenticated ? cart?.subtotal || 0 : guestTotals.subtotal;

  const getImageUrl = (product) => getProductImageUrl(product);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    if (!isAuthenticated) {
      updateGuestCartQuantity(itemId, newQuantity);
      return;
    }

    updateCartItem(
      { itemId, quantity: newQuantity },
      {
        onError: (err) => toast.error(formatError(err, "Failed to update quantity")),
      }
    );
  };

  const handleRemoveItem = (itemId) => {
    if (!isAuthenticated) {
      removeGuestCartItem(itemId);
      toast.success("Item removed from cart");
      return;
    }

    removeFromCart(itemId, {
      onSuccess: () => toast.success("Item removed from cart"),
      onError: (err) => toast.error(formatError(err, "Failed to remove item")),
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:max-w-[400px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col font-dm-sans ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <ShoppingBag size={16} className="text-teal-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold text-neutral-900">
                Your Cart
              </span>
              <span className="text-sm text-neutral-400">
                ({totalItems}) items
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isAuthenticated && isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={28} className="text-teal-600 animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <EmptyCartIllustration />
              <h3 className="text-lg font-semibold text-neutral-900 mt-6">
                Your Cart is <span className="text-teal-600">Empty</span>
              </h3>
              <p className="text-sm text-neutral-500 mt-2 max-w-[280px] leading-relaxed">
                Looks like you haven't added any items to your cart yet. Start
                exploring our collection to find something you'll love.
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    className="flex gap-4 p-3 bg-neutral-50/70 rounded-xl"
                  >
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      onClick={onClose}
                      className="w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden bg-white"
                    >
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      {product.category?.name && (
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide mb-0.5">
                          {product.category.name}
                        </p>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.slug || product._id}`}
                          onClick={onClose}
                          className="flex-1 min-w-0"
                        >
                          <h4 className="text-sm font-medium text-neutral-800 leading-tight hover:text-teal-700 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isRemoving}
                          className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs font-medium text-neutral-800 border-x border-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-teal-700">
                          NRs.{" "}
                          {(product.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 p-5 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-600">
              Subtotal
            </span>
            <span className="text-lg font-bold text-neutral-900">
              NRs. {subtotal.toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-neutral-400 mb-5">
            Shipping and taxes calculated at checkout
          </p>

          {cartItems.length > 0 ? (
            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <button
              onClick={() => {
                toast.error(
                  "Your cart is empty. Add items to proceed to checkout."
                );
                onClose();
              }}
              className="w-full flex items-center justify-center py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Proceed to Checkout
            </button>
          )}

          <Link
            to="/shop"
            onClick={onClose}
            className="w-full flex items-center justify-center mt-3 py-2.5 text-sm text-neutral-600 font-medium underline underline-offset-2 hover:text-neutral-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
