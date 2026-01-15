import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NativeARView from "../../components/ar/NativeARView";
import { useProducts } from "../../hooks/product/useProductTan";
import { useCategories } from "../../hooks/product/useCategoryTan";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import useAuthStore from "../../store/authStore";

export default function NativeARPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialProductSlug = queryParams.get("select");
  const { isAuthenticated } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customization, setCustomization] = useState({});

  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 100,
    status: "active",
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const { mutate: addToCart } = useAddToCart();

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];

  const arProducts = products.filter((p) => {
    const hasModelFiles = p.modelFiles?.some(
      (m) => m.format === "glb" || m.format === "gltf"
    );
    const hasLegacyModel =
      p.modelUrl?.includes(".glb") || p.modelUrl?.includes(".gltf");
    return hasModelFiles || hasLegacyModel;
  });

  const introProduct = {
    _id: "intro",
    slug: "intro",
    name: "Aura Signature Sofa",
    description: "Experience modern luxury with our signature handcrafted sofa piece.",
    price: 45000,
    modelFiles: [{ format: "glb", url: "/sofa_chair.glb" }],
    modelUrl: "/sofa_chair.glb",
    images: [{ url: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=800" }]
  };

  const allArProducts = [introProduct, ...arProducts];

  useEffect(() => {
    if (allArProducts.length > 0 && !selectedProduct) {
      if (initialProductSlug) {
        const found = allArProducts.find(p => p.slug === initialProductSlug || p._id === initialProductSlug);
        if (found) {
          setSelectedProduct(found);
          return;
        }
      }
      setSelectedProduct(allArProducts[0]);
    }
  }, [allArProducts, selectedProduct, initialProductSlug]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCustomization({});
  };

  const handleCustomize = (newCustomization) => {
    setCustomization(newCustomization);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/shop");
      return;
    }

    addToCart(
      {
        productId: product._id,
        quantity: 1,
      },
      {
        onSuccess: () => { },
      }
    );
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <NativeARView
      products={allArProducts}
      categories={categories}
      selectedProduct={selectedProduct}
      onProductSelect={handleProductSelect}
      customization={customization}
      onCustomize={handleCustomize}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
      isLoading={isLoading}
    />
  );
}
