import { Link } from "react-router-dom";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "../../hooks/useCartTan";
import useAuthStore from "../../store/authStore";
import { toast } from "../ui/Toast";

// Empty Cart SVG Illustration
const EmptyCartIllustration = () => (
  <svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="111.467" y="14.6665" width="5.86667" height="5.86667" rx="2.93333" fill="#0F766E"/>
    <rect x="11" y="29.3333" width="4.4" height="4.4" rx="2.2" fill="#0F766E"/>
    <rect x="121" y="91.6663" width="3.66667" height="3.66667" rx="1.83333" fill="#0F766E"/>
    <mask id="path-4-inside-1_905_2877" fill="white">
      <path d="M36.6667 36.6671C36.6667 20.4667 49.7997 7.33374 66.0001 7.33374V7.33374C82.2004 7.33374 95.3334 20.4667 95.3334 36.6671V44.0004H36.6667V36.6671Z"/>
    </mask>
    <path d="M32.2667 36.6671C32.2667 18.0367 47.3697 2.93374 66.0001 2.93374H66.0001C84.6305 2.93374 99.7334 18.0367 99.7334 36.6671L90.9334 36.6671C90.9334 22.8968 79.7704 11.7337 66.0001 11.7337H66.0001C52.2298 11.7337 41.0667 22.8968 41.0667 36.6671L32.2667 36.6671ZM95.3334 44.0004H36.6667H95.3334ZM32.2667 44.0004V36.6671C32.2667 18.0367 47.3697 2.93374 66.0001 2.93374L66.0001 11.7337C52.2298 11.7337 41.0667 22.8968 41.0667 36.6671V44.0004H32.2667ZM66.0001 2.93374C84.6305 2.93374 99.7334 18.0367 99.7334 36.6671V44.0004H90.9334V36.6671C90.9334 22.8968 79.7704 11.7337 66.0001 11.7337L66.0001 2.93374Z" fill="#D1D5DB" mask="url(#path-4-inside-1_905_2877)"/>
    <g clipPath="url(#clip0_905_2877)">
      <path d="M14.6667 52.7998C14.6667 47.9397 18.6066 43.9998 23.4667 43.9998H108.533C113.394 43.9998 117.333 47.9397 117.333 52.7998V102.666C117.333 110.767 110.767 117.333 102.667 117.333H29.3334C21.2332 117.333 14.6667 110.767 14.6667 102.666V52.7998Z" fill="url(#paint0_linear_905_2877)"/>
      <path d="M14.6667 52.7995C14.6667 47.9394 18.6066 43.9995 23.4667 43.9995H108.533C113.394 43.9995 117.333 47.9394 117.333 52.7995V58.6662H14.6667V52.7995Z" fill="url(#paint1_linear_905_2877)"/>
    </g>
    <rect x="29.3333" y="114.4" width="17.6" height="17.6" rx="8.8" fill="#D1D5DB"/>
    <rect x="34.4666" y="119.533" width="7.33333" height="7.33333" rx="3.66667" fill="white"/>
    <rect x="85.0667" y="114.4" width="17.6" height="17.6" rx="8.8" fill="#D1D5DB"/>
    <rect x="90.2" y="119.533" width="7.33333" height="7.33333" rx="3.66667" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear_905_2877" x1="22.0001" y1="36.6664" x2="110" y2="124.666" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F3F4F6"/>
        <stop offset="1" stopColor="#E5E7EB"/>
      </linearGradient>
      <linearGradient id="paint1_linear_905_2877" x1="36.6667" y1="21.9995" x2="95.3334" y2="80.6662" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E5E7EB"/>
        <stop offset="1" stopColor="#D1D5DB"/>
      </linearGradient>
      <clipPath id="clip0_905_2877">
        <path d="M14.6667 52.7998C14.6667 47.9397 18.6066 43.9998 23.4667 43.9998H108.533C113.394 43.9998 117.333 47.9397 117.333 52.7998V102.666C117.333 110.767 110.767 117.333 102.667 117.333H29.3334C21.2332 117.333 14.6667 110.767 14.6667 102.666V52.7998Z" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default function CartSlider({ isOpen, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useCart({ enabled: isAuthenticated });
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();

  const cart = data?.data?.cart;
  const cartItems = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const subtotal = cart?.subtotal || 0;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

  const getImageUrl = (product) => {
    const primaryImage = product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url;
    if (!primaryImage) {
      return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";
    }
    if (primaryImage.startsWith("http")) return primaryImage;
    return `${baseUrl.replace("/api/v1", "")}/uploads/products/${primaryImage}`;
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(
      { itemId, quantity: newQuantity },
      {
        onError: () => toast.error("Failed to update quantity"),
      }
    );
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId, {
      onSuccess: () => toast.success("Item removed from cart"),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Slider Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:max-w-[420px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-teal-700" />
            <span className="text-lg font-semibold text-neutral-900 font-playfair">Your Cart</span>
            <span className="text-neutral-500 font-lato">({totalItems}) items</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="text-teal-700 animate-spin" />
            </div>
          ) : !isAuthenticated || cartItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <EmptyCartIllustration />
              <h3 className="text-xl font-playfair text-neutral-900 mt-6">
                Your Cart is <span className="italic text-teal-700">Empty</span>
              </h3>
              <p className="text-neutral-500 font-lato mt-3 max-w-xs">
                Looks like you haven't added any items to your cart yet. Start exploring our collection to find something you'll love.
              </p>
            </div>
          ) : (
            /* Cart Items */
            <div className="p-4 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    className="flex gap-4 p-3 bg-neutral-50 rounded-xl"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      onClick={onClose}
                      className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white"
                    >
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        onClick={onClose}
                      >
                        <h4 className="text-sm font-semibold text-neutral-900 font-lato truncate hover:text-teal-700 transition-colors">
                          {product.name}
                        </h4>
                      </Link>
                      {product.category?.name && (
                        <p className="text-xs text-neutral-500 font-lato mt-0.5">
                          {product.category.name}
                        </p>
                      )}
                      <p className="text-teal-700 font-bold font-lato mt-1">
                        NRs. {product.price?.toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-md hover:bg-white transition-colors disabled:opacity-50"
                          >
                            <Minus size={14} className="text-neutral-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-neutral-900 font-lato">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-md hover:bg-white transition-colors disabled:opacity-50"
                          >
                            <Plus size={14} className="text-neutral-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isRemoving}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-neutral-700 font-lato">Subtotal</span>
            <span className="text-xl font-bold text-neutral-900 font-playfair">
              NRs. {subtotal.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-lato mb-4">
            Shipping and taxes calculated at checkout
          </p>
          <Link
            to="/checkout"
            onClick={onClose}
            className="w-full flex items-center justify-center py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-colors font-lato"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={onClose}
            className="w-full text-center mt-3 text-neutral-700 font-medium font-lato underline underline-offset-2 hover:text-neutral-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
