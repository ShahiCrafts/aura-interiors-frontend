import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  Package,
  Box,
  Link as LinkIcon,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Skeleton from "../../components/common/Skeleton";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../hooks/product/useProductTan";
import { useCategories } from "../../hooks/product/useCategoryTan";
import { toast } from "react-toastify";
import ImageWithFallback from "../../components/fallbacks/ImageWithFallback";
import {
  getImageUrl as getImageUrlUtil,
  getProductImageUrl,
} from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

import Pagination from "../../components/common/Pagination";

export default function Products() {
  const fileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [modelInputType, setModelInputType] = useState("url");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [modelFiles, setModelFiles] = useState([]); // New file uploads
  const [modelUrls, setModelUrls] = useState([]); // New URL entries
  const [existingModelFiles, setExistingModelFiles] = useState([]); // Existing models (both files and URLs)
  const [isDraggingModel, setIsDraggingModel] = useState(false);
  const [newModelUrl, setNewModelUrl] = useState(""); // For URL input field
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    shortDescription: "",
    status: "active",
    modelUrl: "",
    sku: "",
    style: "",
    isFeatured: false,
    isNewArrival: false,
    dimensions: { width: "", height: "", depth: "" },
    weight: { value: "", unit: "kg" },
    materials: [],
    colors: [],
  });

  const colorOptions = [
    "White",
    "Black",
    "Gray",
    "Brown",
    "Beige",
    "Navy",
    "Green",
    "Red",
    "Blue",
    "Natural",
  ];
  const materialOptions = [
    "Wood",
    "Metal",
    "Fabric",
    "Leather",
    "Glass",
    "Marble",
    "Velvet",
    "Rattan",
  ];
  const styleOptions = [
    "Modern",
    "Contemporary",
    "Traditional",
    "Minimalist",
    "Industrial",
    "Scandinavian",
    "Bohemian",
    "Rustic",
  ];

  // Fetch products
  const { data: productsData, isLoading } = useProducts({
    search: searchQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    page,
    limit: pageSize,
  });
  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || { total: 0, pages: 1 };

  // Fetch categories for filter and form
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.categories || [];

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category?._id || product.category || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        status: product.status || "active",
        modelUrl: product.modelUrl || "",
        sku: product.sku || "",
        style: product.style || "",
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        dimensions: product.dimensions || { width: "", height: "", depth: "" },
        weight: product.weight || { value: "", unit: "kg" },
        materials: product.materials || [],
        colors: product.colors || [],
      });
      setModelInputType(
        product.modelUrl || product.modelFiles?.length > 0
          ? product.modelUrl
            ? "url"
            : "upload"
          : "url"
      );
      // Set existing images as previews
      if (product.images?.length > 0) {
        setImagePreviews(
          product.images.map((img) => ({
            url: getImageUrlUtil(img.url, "products"),
            existing: true,
            originalUrl: img.url,
          }))
        );
      } else {
        setImagePreviews([]);
      }
      setImageFiles([]);
      // Set existing model files (both uploaded and URL-based)
      if (product.modelFiles?.length > 0) {
        setExistingModelFiles(
          product.modelFiles.map((model) => ({
            ...model,
            existing: true,
          }))
        );
      } else {
        setExistingModelFiles([]);
      }
      setModelFiles([]);
      setModelUrls([]);
      setNewModelUrl("");
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        category: categories[0]?._id || "",
        price: "",
        originalPrice: "",
        stock: "",
        description: "",
        shortDescription: "",
        status: "active",
        modelUrl: "",
        sku: "",
        style: "",
        isFeatured: false,
        isNewArrival: false,
        dimensions: { width: "", height: "", depth: "" },
        weight: { value: "", unit: "kg" },
        materials: [],
        colors: [],
      });
      setModelInputType("url");
      setImageFiles([]);
      setImagePreviews([]);
      setModelFiles([]);
      setModelUrls([]);
      setExistingModelFiles([]);
      setNewModelUrl("");
    }
    setActiveTab("basic");
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [
          ...prev,
          { url: reader.result, existing: false, file },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleModelFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    addModelFiles(files);
  };

  const addModelFiles = (files) => {
    const validExtensions = [".glb", ".gltf", ".usdz"];
    const validFiles = [];

    for (const file of files) {
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error(
          `Invalid file format: ${file.name}. Please upload .glb, .gltf, or .usdz files`
        );
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File size exceeds 50MB limit: ${file.name}`);
        continue;
      }

      // Check for duplicate formats (including URL entries)
      const format = fileExtension.replace(".", "");
      const existingFormat = [
        ...existingModelFiles,
        ...modelFiles,
        ...modelUrls,
      ].find(
        (f) => f.format === format || (f.name && f.name.endsWith(fileExtension))
      );
      if (existingFormat) {
        toast.error(
          `A ${format.toUpperCase()} model already exists. Remove it first to add a new one.`
        );
        continue;
      }

      validFiles.push({
        file,
        name: file.name,
        size: file.size,
        format,
        platform: format === "usdz" ? "ios" : "android",
      });
    }

    if (validFiles.length > 0) {
      setModelFiles((prev) => [...prev, ...validFiles]);
      // Clear the URL input when files are uploaded
      setProductForm((prev) => ({ ...prev, modelUrl: "" }));
    }
  };

  const handleModelDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModel(true);
  };

  const handleModelDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModel(false);
  };

  const handleModelDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModel(false);

    const files = Array.from(e.dataTransfer.files || []);
    addModelFiles(files);
  };

  const removeModelFile = (index, isExisting = false, isUrl = false) => {
    if (isExisting) {
      setExistingModelFiles((prev) => prev.filter((_, i) => i !== index));
    } else if (isUrl) {
      setModelUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      setModelFiles((prev) => prev.filter((_, i) => i !== index));
    }
    if (modelFileInputRef.current) {
      modelFileInputRef.current.value = "";
    }
  };

  const addModelUrl = () => {
    if (!newModelUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(newModelUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    // Detect format from URL
    const url = newModelUrl.toLowerCase();
    let format = "";
    if (url.includes(".glb")) {
      format = "glb";
    } else if (url.includes(".gltf")) {
      format = "gltf";
    } else if (url.includes(".usdz")) {
      format = "usdz";
    } else {
      toast.error("URL must point to a .glb, .gltf, or .usdz file");
      return;
    }

    // Check for duplicate formats
    const existingFormat = [
      ...existingModelFiles,
      ...modelFiles,
      ...modelUrls,
    ].find((f) => f.format === format);
    if (existingFormat) {
      toast.error(
        `A ${format.toUpperCase()} model already exists. Remove it first to add a new one.`
      );
      return;
    }

    const platform = format === "usdz" ? "ios" : "android";

    setModelUrls((prev) => [
      ...prev,
      {
        url: newModelUrl.trim(),
        format,
        platform,
        isExternal: true,
      },
    ]);
    setNewModelUrl("");
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];
    if (preview.existing) {
      // Mark for removal on save
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new files
      setImageFiles((prev) =>
        prev.filter(
          (_, i) => i !== index - imagePreviews.filter((p) => p.existing).length
        )
      );
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast.error("Please fill in required fields");
      return;
    }

    const formData = {
      name: productForm.name,
      category: productForm.category,
      price: productForm.price,
      stock: productForm.stock || 0,
      status: productForm.status,
    };

    if (productForm.originalPrice)
      formData.originalPrice = productForm.originalPrice;
    if (productForm.description) formData.description = productForm.description;
    if (productForm.shortDescription)
      formData.shortDescription = productForm.shortDescription;
    if (productForm.modelUrl) formData.modelUrl = productForm.modelUrl;
    if (productForm.sku) formData.sku = productForm.sku;
    if (productForm.style) formData.style = productForm.style;
    formData.isFeatured = productForm.isFeatured;
    formData.isNewArrival = productForm.isNewArrival;

    if (
      productForm.dimensions.width ||
      productForm.dimensions.height ||
      productForm.dimensions.depth
    ) {
      formData.dimensions = productForm.dimensions;
    }
    if (productForm.weight.value) {
      formData.weight = productForm.weight;
    }
    if (productForm.materials.length > 0) {
      formData.materials = productForm.materials;
    }
    if (productForm.colors.length > 0) {
      formData.colors = productForm.colors;
    }

    // Add new images
    if (imageFiles.length > 0) {
      formData.images = imageFiles;
    }

    // Add 3D model files if uploaded
    if (modelFiles.length > 0) {
      formData.modelFiles = modelFiles.map((m) => m.file);
    }

    // Add 3D model URLs
    if (modelUrls.length > 0) {
      formData.modelUrls = modelUrls.map((m) => ({
        url: m.url,
        format: m.format,
        platform: m.platform,
      }));
    }

    // Track removed images for update
    if (editingProduct) {
      const existingUrls = editingProduct.images?.map((img) => img.url) || [];
      const remainingUrls = imagePreviews
        .filter((p) => p.existing)
        .map((p) => p.originalUrl);
      const removedImages = existingUrls.filter(
        (url) => !remainingUrls.includes(url)
      );
      if (removedImages.length > 0) {
        formData.removeImages = removedImages;
      }

      // Track removed model files for update
      const existingModelUrls =
        editingProduct.modelFiles?.map((m) => m.url) || [];
      const remainingModelUrls = existingModelFiles.map((m) => m.url);
      const removedModelFiles = existingModelUrls.filter(
        (url) => !remainingModelUrls.includes(url)
      );
      if (removedModelFiles.length > 0) {
        formData.removeModelFiles = removedModelFiles;
      }
    }

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct._id,
          data: formData,
        });
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Product created successfully");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(formatError(err, "Something went wrong"));
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteMutation.mutateAsync(productToDelete);
      toast.success("Product deleted successfully");
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error(formatError(err, "Failed to delete product"));
    }
  };

  const confirmDelete = (id) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleToggle = (field, value) => {
    if (field === "colors" || field === "materials") {
      setProductForm((prev) => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-teal-50 text-teal-700";
      case "out_of_stock":
        return "bg-red-50 text-red-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "out_of_stock":
        return "Out of Stock";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const getProductImage = (product) => {
    return getProductImageUrl(product);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters inside table card */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                All
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat._id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-11 h-11 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Stock
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    3D Model
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {getProductImage(product) ? (
                            <ImageWithFallback
                              src={getProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.sku || product._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">
                          NRs. {product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            NRs. {product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${product.stock === 0
                          ? "text-red-500"
                          : product.stock < 10
                            ? "text-amber-500"
                            : "text-gray-600"
                          }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.modelUrl || product.modelFiles?.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-100">
                          <Box className="w-3 h-3" />
                          {product.modelFiles?.length > 0
                            ? `${product.modelFiles.length} Model${product.modelFiles.length > 1 ? "s" : ""
                            }`
                            : "Available"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-100">
                          No Model
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        <span
                          className={`${product.status === "active"
                            ? "bg-teal-500"
                            : product.status === "out_of_stock"
                              ? "bg-red-500"
                              : "bg-gray-400"
                            }`}
                        ></span>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => confirmDelete(product._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">
              No products found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={pagination.pages}
        pageSize={pageSize}
        totalItems={pagination.total}
        onPageChange={setPage}
      />

      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-6">
                {[
                  { id: "basic", label: "Basic Info" },
                  { id: "3dmodel", label: "3D Model" },
                  { id: "details", label: "Details" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? "border-[#025E5D] text-[#025E5D]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Images
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#025E5D] transition-colors cursor-pointer"
                      >
                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      {imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all bg-white"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={productForm.status}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              status: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            Rs.
                          </span>
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                price: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            Rs.
                          </span>
                          <input
                            type="number"
                            value={productForm.originalPrice}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                originalPrice: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              sku: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                          placeholder="SKU-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Style
                        </label>
                        <select
                          value={productForm.style}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              style: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all bg-white"
                        >
                          <option value="">Select Style</option>
                          {styleOptions.map((style) => (
                            <option key={style} value={style.toLowerCase()}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={productForm.shortDescription}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            shortDescription: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                        placeholder="Brief description for listings"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all resize-none"
                        placeholder="Enter product description"
                      />
                    </div>

                    {/* Featured & New Arrival toggles */}
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              isFeatured: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-[#025E5D] focus:ring-[#025E5D]"
                        />
                        <span className="text-sm text-gray-700">
                          Featured Product
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.isNewArrival}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              isNewArrival: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-[#025E5D] focus:ring-[#025E5D]"
                        />
                        <span className="text-sm text-gray-700">
                          New Arrival
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 3D Model Tab */}
                {activeTab === "3dmodel" && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Box className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-800">
                            3D Model for AR/VR Experience
                          </p>
                          <p className="text-sm text-purple-700 mt-0.5">
                            Upload a 3D model to enable customers to view this
                            product in AR on their devices. Supported formats:
                            .glb, .gltf, .usdz (for iOS)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Input Type Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add 3D Model
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setModelInputType("url")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${modelInputType === "url"
                            ? "border-[#025E5D] bg-[#025E5D]/5 text-[#025E5D]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                          <LinkIcon className="w-4 h-4" />
                          URL / Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelInputType("upload")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${modelInputType === "upload"
                            ? "border-[#025E5D] bg-[#025E5D]/5 text-[#025E5D]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                          <Upload className="w-4 h-4" />
                          Upload File
                        </button>
                      </div>
                    </div>

                    {/* URL Input */}
                    {modelInputType === "url" && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Add 3D Model URLs
                        </label>

                        {/* Existing and new URL entries list */}
                        {(existingModelFiles.length > 0 ||
                          modelUrls.length > 0) && (
                            <div className="space-y-2">
                              {/* Existing model entries (URL-based) */}
                              {existingModelFiles
                                .filter((m) => m.isExternal)
                                .map((model, index) => (
                                  <div
                                    key={`existing-url-${index}`}
                                    className="border border-gray-200 rounded-xl p-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.platform === "ios"
                                            ? "bg-blue-100"
                                            : "bg-green-100"
                                            }`}
                                        >
                                          <LinkIcon
                                            className={`w-5 h-5 ${model.platform === "ios"
                                              ? "text-blue-600"
                                              : "text-green-600"
                                              }`}
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {model.url}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`text-xs px-2 py-0.5 rounded-full ${model.platform === "ios"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                              {model.format?.toUpperCase()} -{" "}
                                              {model.platform === "ios"
                                                ? "iOS"
                                                : "Android/Web"}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                              URL
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeModelFile(
                                            existingModelFiles.indexOf(model),
                                            true
                                          )
                                        }
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                              {/* New URL entries */}
                              {modelUrls.map((model, index) => (
                                <div
                                  key={`new-url-${index}`}
                                  className="border border-gray-200 rounded-xl p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.platform === "ios"
                                          ? "bg-blue-100"
                                          : "bg-green-100"
                                          }`}
                                      >
                                        <LinkIcon
                                          className={`w-5 h-5 ${model.platform === "ios"
                                            ? "text-blue-600"
                                            : "text-green-600"
                                            }`}
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {model.url}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${model.platform === "ios"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-green-100 text-green-700"
                                              }`}
                                          >
                                            {model.format?.toUpperCase()} -{" "}
                                            {model.platform === "ios"
                                              ? "iOS"
                                              : "Android/Web"}
                                          </span>
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                            New
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeModelFile(index, false, true)
                                      }
                                      className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* URL input area */}
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newModelUrl}
                            onChange={(e) => setNewModelUrl(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addModelUrl())
                            }
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
                            placeholder="https://example.com/model.glb"
                          />
                          <button
                            type="button"
                            onClick={addModelUrl}
                            className="px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter URLs to .glb, .gltf, or .usdz files. Format is
                          auto-detected from URL.
                        </p>
                      </div>
                    )}

                    {/* File Upload */}
                    {modelInputType === "upload" && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Upload 3D Models
                        </label>

                        {/* Uploaded files list */}
                        {(existingModelFiles.filter((m) => !m.isExternal)
                          .length > 0 ||
                          modelFiles.length > 0) && (
                            <div className="space-y-2">
                              {/* Existing model files (uploaded, not URL) */}
                              {existingModelFiles
                                .filter((m) => !m.isExternal)
                                .map((model, index) => (
                                  <div
                                    key={`existing-${index}`}
                                    className="border border-gray-200 rounded-xl p-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.platform === "ios"
                                            ? "bg-blue-100"
                                            : "bg-green-100"
                                            }`}
                                        >
                                          <Box
                                            className={`w-5 h-5 ${model.platform === "ios"
                                              ? "text-blue-600"
                                              : "text-green-600"
                                              }`}
                                          />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {model.url}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`text-xs px-2 py-0.5 rounded-full ${model.platform === "ios"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                              {model.format?.toUpperCase()} -{" "}
                                              {model.platform === "ios"
                                                ? "iOS"
                                                : "Android/Web"}
                                            </span>
                                            {model.fileSize && (
                                              <span className="text-xs text-gray-500">
                                                {(
                                                  model.fileSize /
                                                  (1024 * 1024)
                                                ).toFixed(2)}{" "}
                                                MB
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeModelFile(
                                            existingModelFiles.indexOf(model),
                                            true
                                          )
                                        }
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                              {/* New model files */}
                              {modelFiles.map((model, index) => (
                                <div
                                  key={`new-${index}`}
                                  className="border border-gray-200 rounded-xl p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.platform === "ios"
                                          ? "bg-blue-100"
                                          : "bg-green-100"
                                          }`}
                                      >
                                        <Box
                                          className={`w-5 h-5 ${model.platform === "ios"
                                            ? "text-blue-600"
                                            : "text-green-600"
                                            }`}
                                        />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {model.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${model.platform === "ios"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-green-100 text-green-700"
                                              }`}
                                          >
                                            {model.format?.toUpperCase()} -{" "}
                                            {model.platform === "ios"
                                              ? "iOS"
                                              : "Android/Web"}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {(model.size / (1024 * 1024)).toFixed(
                                              2
                                            )}{" "}
                                            MB
                                          </span>
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                            New
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeModelFile(index, false)
                                      }
                                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* Upload area */}
                        <div
                          onClick={() => modelFileInputRef.current?.click()}
                          onDragOver={handleModelDragOver}
                          onDragLeave={handleModelDragLeave}
                          onDrop={handleModelDrop}
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${isDraggingModel
                            ? "border-[#025E5D] bg-[#025E5D]/5"
                            : "border-gray-200 hover:border-[#025E5D]"
                            }`}
                        >
                          <Box className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">
                            {existingModelFiles.length + modelFiles.length > 0
                              ? "Add more 3D models"
                              : "Drop your 3D models here"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            or click to browse
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Supported: .glb, .gltf (Android/Web), .usdz (iOS) -
                            max 50MB each
                          </p>
                          <input
                            ref={modelFileInputRef}
                            type="file"
                            accept=".glb,.gltf,.usdz"
                            multiple
                            onChange={handleModelFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Cross-platform AR Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Cross-Platform AR Support
                          </p>
                          <p className="text-sm text-blue-700 mt-0.5">
                            For the best AR experience across all devices:
                          </p>
                          <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                            <li>
                              <strong>.glb/.gltf</strong> - For Android devices
                              and web browsers
                            </li>
                            <li>
                              <strong>.usdz</strong> - For iOS devices
                              (iPhone/iPad)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-4">
                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            type="number"
                            value={productForm.dimensions.width}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                dimensions: {
                                  ...productForm.dimensions,
                                  width: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                            placeholder="Width"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={productForm.dimensions.height}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                dimensions: {
                                  ...productForm.dimensions,
                                  height: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                            placeholder="Height"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={productForm.dimensions.depth}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                dimensions: {
                                  ...productForm.dimensions,
                                  depth: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                            placeholder="Depth"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="number"
                          value={productForm.weight.value}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              weight: {
                                ...productForm.weight,
                                value: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all"
                          placeholder="0"
                        />
                        <select
                          value={productForm.weight.unit}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              weight: {
                                ...productForm.weight,
                                unit: e.target.value,
                              },
                            })
                          }
                          className="w-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20 outline-none transition-all bg-white"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>

                    {/* Materials */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {materialOptions.map((material) => (
                          <button
                            key={material}
                            type="button"
                            onClick={() =>
                              handleToggle("materials", material.toLowerCase())
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${productForm.materials.includes(
                              material.toLowerCase()
                            )
                              ? "bg-[#025E5D] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              handleToggle("colors", color.toLowerCase())
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${productForm.colors.includes(color.toLowerCase())
                              ? "bg-[#025E5D] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={
                    !productForm.name ||
                    !productForm.price ||
                    !productForm.category ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="flex-1 bg-[#025E5D] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#014d4b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
