import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useProduct } from "../../hooks/product/useProductTan";
import NativeARView from "../../components/ar/NativeARView";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import useAuthStore from "../../store/authStore";

export default function ARViewPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [customization, setCustomization] = useState({});

  const { data: productData, isLoading, error } = useProduct(productSlug);
  const product = productData?.data?.product;

  const { mutate: addToCart } = useAddToCart();

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/product/${productSlug}`);
    }
  };

  const products = product ? [product] : [];

  const handleProductSelect = (p) => {
    setCustomization({});
  };

  const handleCustomize = (newCustomization) => {
    setCustomization(newCustomization);
  };

  const handleAddToCart = (p) => {
    if (!isAuthenticated) {
      navigate("/shop");
      return;
    }

    addToCart(
      {
        productId: p._id,
        quantity: 1,
      },
      {
        onSuccess: () => { },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-dm-sans">
        <Loader2 size={40} className="text-teal-700 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-dm-sans">
        <div className="text-center">
          <AlertCircle size={48} className="text-neutral-400 mx-auto mb-4" />
          <h1 className="text-xl font-playfair text-neutral-900 mb-2">Product Not Found</h1>
          <p className="text-neutral-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <NativeARView
      products={products}
      categories={[]} // No categories needed for single product view
      selectedProduct={product}
      onProductSelect={handleProductSelect}
      customization={customization}
      onCustomize={handleCustomize}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
      isLoading={isLoading}
    />
  );
}
