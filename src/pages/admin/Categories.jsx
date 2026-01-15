import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FolderTree,
  Package,
  Image,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Upload,
  Loader2,
} from 'lucide-react';
import Skeleton from "../../components/common/Skeleton";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/product/useCategoryTan';
import { toast } from "react-toastify";
import formatError from "../../utils/errorHandler";
import ImageWithFallback from '../../components/fallbacks/ImageWithFallback';
import { getCategoryImageUrl } from '../../utils/imageUrl';
import { API_V1_URL } from '../../config/constants';

const API_URL = API_V1_URL;

export default function Categories() {
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
    status: 'active',
    parent: '',
    sortOrder: 0,
  });

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useCategories();
  const categories = categoriesData?.data?.categories || [];

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      image: null,
      status: 'active',
      parent: '',
      sortOrder: 0,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: null,
      status: category.status,
      parent: category.parent?._id || category.parent || '',
      sortOrder: category.sortOrder || 0,
    });
    setImagePreview(category.image ? getCategoryImageUrl(category.image) : null);
    setShowModal(true);
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteMutation.mutateAsync(categoryToDelete);
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast.error(formatError(err, 'Failed to delete category'));
    }
  };

  const confirmDelete = (id) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm({ ...categoryForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: categoryForm.name,
      description: categoryForm.description,
      status: categoryForm.status,
      sortOrder: categoryForm.sortOrder,
    };

    if (categoryForm.parent) {
      formData.parent = categoryForm.parent;
    }

    if (categoryForm.image instanceof File) {
      formData.image = categoryForm.image;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory._id, data: formData });
        toast.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(formatError(err, 'Something went wrong'));
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get parent categories (those without parent)
  const parentCategories = categories.filter(cat => !cat.parent);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <div className="flex gap-4">
            <Skeleton className="w-40 h-12 rounded-xl" />
            <Skeleton className="w-40 h-12 rounded-xl" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Categories</h2>
        <p className="text-gray-500">{formatError(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage product categories and hierarchy.</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D]"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-500">Total Categories: </span>
            <span className="font-semibold text-gray-900">{categories.length}</span>
          </div>
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-500">Total Products: </span>
            <span className="font-semibold text-gray-900">
              {categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <motion.div
            key={category._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-start gap-4 p-5">
              {/* Category Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {category.image ? (
                  <ImageWithFallback
                    src={getCategoryImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">/{category.slug}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${category.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {category.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    {category.productCount || 0} products
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FolderTree className="w-4 h-4" />
                    {category.subcategories?.length || 0} subcategories
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => confirmDelete(category._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories?.length > 0 && (
              <div className="border-t border-gray-100">
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <span>Subcategories ({category.subcategories.length})</span>
                  {expandedCategories.includes(category._id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedCategories.includes(category._id) && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-2">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${sub.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {sub.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCategory(sub)}
                                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button
                                onClick={() => confirmDelete(sub._id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No categories found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search' : 'Create your first category to get started'}
          </p>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Image
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#025E5D] transition-colors cursor-pointer"
                  >
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-xl mx-auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setCategoryForm({ ...categoryForm, image: null });
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Parent Category (Optional)
                  </label>
                  <select
                    value={categoryForm.parent}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D]"
                  >
                    <option value="">None (Top Level)</option>
                    {parentCategories
                      .filter(cat => cat._id !== editingCategory?._id)
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={categoryForm.status}
                      onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={categoryForm.sortOrder}
                      onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#025E5D]/20 focus:border-[#025E5D]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-[#025E5D] text-white rounded-xl font-medium hover:bg-[#014d4b] transition-colors disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      editingCategory ? 'Save Changes' : 'Add Category'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Category?"
        message="Are you sure you want to delete this category? All subcategories and product associations might be affected. This action cannot be undone."
        onConfirm={handleDeleteCategory}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
