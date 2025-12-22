import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NativeARView from "../components/ar/NativeARView";
import { useProducts } from "../hooks/useProductTan";
import { useCategories } from "../hooks/useCategoryTan";
import { useAddToCart } from "../hooks/useCartTan";
import useAuthStore from "../store/authStore";

export default function NativeARPage() {
  const navigate = useNavigate();
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

  console.log("productsData:", productsData);
  console.log("products:", products);
  console.log("productsLoading:", productsLoading);

  const arProducts = products.filter((p) => {
    const hasModelFiles = p.modelFiles?.some(
      (m) => m.format === "glb" || m.format === "gltf"
    );
    const hasLegacyModel =
      p.modelUrl?.includes(".glb") || p.modelUrl?.includes(".gltf");
    console.log(
      "Product:",
      p.name,
      "hasModelFiles:",
      hasModelFiles,
      "hasLegacyModel:",
      hasLegacyModel,
      "modelFiles:",
      p.modelFiles
    );
    return hasModelFiles || hasLegacyModel;
  });

  console.log("arProducts:", arProducts);

  useEffect(() => {
    if (arProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(arProducts[0]);
    }
  }, [arProducts, selectedProduct]);

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
        onSuccess: () => {},
      }
    );
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <NativeARView
      products={arProducts}
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
