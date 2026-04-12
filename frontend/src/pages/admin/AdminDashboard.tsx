import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Package, DollarSign, Tag, X, Store, Camera, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { storeService, Store as StoreType } from '@/services/storeService';
import { useToast, Spinner } from '@/components/ui';
import { AdminBottomNav } from '@/components/layouts';

interface ProductFormData {
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  original_price: string;
  store_id: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    image: '',
    category: '',
    description: '',
    original_price: '',
    store_id: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
      
      // Extract unique categories from products
      const uniqueCategories = Array.from(new Set(fetchedProducts.map((p) => p.category).filter(Boolean)));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showError('فشل في جلب المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const fetchedStores = await storeService.getActiveStores();
      setStores(fetchedStores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const getStoreName = (storeId: number | null | undefined) => {
    if (!storeId) return null;
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : null;
  };

  // Filter products based on search, store, and category
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query (product name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Filter by store
    if (selectedStore) {
      result = result.filter((p) => p.store_id?.toString() === selectedStore);
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedStore, selectedCategory]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStore('');
    setSelectedCategory('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('يرجى اختيار ملف صورة صالح', 'ملف غير صالح');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      description: '',
      original_price: '',
      store_id: '',
    });
    setImagePreview('');
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      description: product.description || '',
      original_price: product.originalPrice?.toString() || '',
      store_id: product.store_id?.toString() || '',
    });
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        description: formData.description || undefined,
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        store_id: formData.store_id ? parseInt(formData.store_id) : null,
      };

      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(editingProduct.id, productData);
        success('تم تحديث المنتج بنجاح');
      } else {
        // Create new product
        await productService.createProduct(productData);
        success('تم إضافة المنتج بنجاح');
      }

      resetForm();
      await fetchProducts();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      showError(err.response?.data?.detail || 'فشل في حفظ المنتج');
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      success('تم حذف المنتج بنجاح');
      await fetchProducts();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showError('فشل في حذف المنتج');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary-600 dark:text-primary-500 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">لوحة تحكم المسؤول</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">إدارة المنتجات</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px] flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة منتج</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{products.length}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600 dark:text-primary-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">التصنيفات</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {new Set(products.map((p) => p.category)).size}
                </p>
              </div>
              <Tag className="w-12 h-12 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">متوسط السعر</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {products.length > 0
                    ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
                    : 0}{' '}
                  ر.س
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-orange-600 dark:text-orange-500" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                المنتجات
                {filteredProducts.length !== products.length && (
                  <span className="mr-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    (عرض {filteredProducts.length} من {products.length})
                  </span>
                )}
              </h2>
              {(searchQuery || selectedStore || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>مسح الفلاتر</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث باسم المنتج..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Store Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Filter className="w-3 h-3 inline-block ml-1" />
                    تصفية بالمتجر
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="">جميع المتاجر</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id.toString()}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Tag className="w-3 h-3 inline-block ml-1" />
                    تصفية بالتصنيف
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="">جميع التصنيفات</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedStore || selectedCategory) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">الفلاتر النشطة:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">
                      البحث: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="hover:text-primary-900 dark:hover:text-primary-300">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedStore && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                      المتجر: {getStoreName(parseInt(selectedStore))}
                      <button onClick={() => setSelectedStore('')} className="hover:text-green-900 dark:hover:text-green-300">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                      التصنيف: {selectedCategory}
                      <button onClick={() => setSelectedCategory('')} className="hover:text-purple-900 dark:hover:text-purple-300">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              {products.length > 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد منتجات مطابقة للفلاتر</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات بعد</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    إضافة أول منتج
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3 p-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start gap-3">
                      <img
                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                        src={product.image}
                        alt={product.name}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {getStoreName(product.store_id) ? (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              {getStoreName(product.store_id)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">بدون متجر</span>
                          )}
                          {product.category && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-base font-bold text-gray-900 dark:text-gray-100">{product.price} ر.س</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors min-h-[44px]"
                      >
                        <Edit className="w-4 h-4" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors min-h-[44px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        المتجر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        التصنيف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        السعر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image}
                                alt={product.name}
                              />
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStoreName(product.store_id) ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              {getStoreName(product.store_id)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">بدون متجر</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                          {product.price} ر.س
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-primary-600 dark:text-primary-500 hover:text-primary-900 dark:hover:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors min-h-[44px]"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden md:inline">تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors min-h-[44px]"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden md:inline">حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المنتج <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="أدخل اسم المنتج"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التصنيف <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">اختر التصنيف</option>
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="ملابس">ملابس</option>
                  <option value="منزل">منزل</option>
                  <option value="رياضة">رياضة</option>
                  <option value="أكسسوارات">أكسسوارات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              {/* Store */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المتجر
                </label>
                <select
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">بدون متجر (اختياري)</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id.toString()}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    السعر (ر.س) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    السعر الأصلي (اختياري)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  صورة المنتج <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative cursor-pointer group w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-primary-500 transition-colors"
                    onClick={handleImageClick}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">صورة</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-tl-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      انقر على المربع لاختيار صورة من الجهاز
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      الصيغ المدعومة: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="وصف المنتج (اختياري)"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium min-h-[44px]"
                >
                  {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
};
