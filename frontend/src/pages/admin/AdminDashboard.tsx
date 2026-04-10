import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Package, DollarSign, Tag, X } from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { useToast, Spinner } from '@/components/ui';

interface ProductFormData {
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  original_price: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
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
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showError('فشل في جلب المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      description: '',
      original_price: '',
    });
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
    });
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
              <Package className="w-8 h-8 text-primary-600 dark:text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">لوحة تحكم المسؤول</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">إدارة المنتجات</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                العودة للمتجر
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <DollarSign className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">المنتجات</h2>
          </div>
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات بعد</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                إضافة أول منتج
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المنتج
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {product.price} ر.س
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 dark:text-primary-500 hover:text-primary-900 dark:hover:text-primary-400 ml-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <button onClick={resetForm} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الصورة <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/image.jpg"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="وصف المنتج (اختياري)"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
