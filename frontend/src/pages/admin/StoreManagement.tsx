import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Store, X, Camera, Image as ImageIcon, Search, ArrowUpDown, Eye } from 'lucide-react';
import { storeService, Store as StoreType } from '@/services/storeService';
import { useToast, Spinner } from '@/components/ui';
import { AdminBottomNav } from '@/components/layouts';

interface StoreFormData {
  name: string;
  description: string;
  logo: string;
  banner: string;
  address: string;
}

export const StoreManagement: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    logo: '',
    banner: '',
    address: '',
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Search and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch stores
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const fetchedStores = await storeService.getStores();
      setStores(fetchedStores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      showError('فشل في جلب المتاجر');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = [...stores];

    // Filter by search query (store name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }

    // Sort by creation date
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return result;
  }, [stores, searchQuery, sortBy]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('يرجى اختيار ملف صورة صالح', 'ملف غير صالح');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(base64String);
        } else {
          setBannerPreview(base64String);
        }
        setFormData((prev) => ({ ...prev, [type]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      banner: '',
      address: '',
    });
    setLogoPreview('');
    setBannerPreview('');
    setEditingStore(null);
    setShowForm(false);
  };

  const handleEdit = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      description: store.description || '',
      logo: store.logo || '',
      banner: store.banner || '',
      address: store.address || '',
    });
    setLogoPreview(store.logo || '');
    setBannerPreview(store.banner || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const storeData = {
        name: formData.name,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        banner: formData.banner || undefined,
        address: formData.address || undefined,
      };

      if (editingStore) {
        // Update existing store
        await storeService.updateStore(editingStore.id, storeData);
        success('تم تحديث المتجر بنجاح');
      } else {
        // Create new store
        await storeService.createStore(storeData);
        success('تم إضافة المتجر بنجاح');
      }

      resetForm();
      await fetchStores();
    } catch (err: any) {
      console.error('Failed to save store:', err);
      showError(err.response?.data?.detail || 'فشل في حفظ المتجر');
    }
  };

  const handleDelete = async (storeId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المتجر؟')) {
      return;
    }

    try {
      await storeService.deleteStore(storeId);
      success('تم حذف المتجر بنجاح');
      await fetchStores();
    } catch (err: any) {
      console.error('Failed to delete store:', err);
      showError('فشل في حذف المتجر');
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
              <Store className="w-8 h-8 text-primary-600 dark:text-primary-500 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">إدارة المتاجر</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">إضافة وإدارة المتاجر</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px] flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة متجر</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المتاجر</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stores.length}</p>
              </div>
              <Store className="w-12 h-12 text-primary-600 dark:text-primary-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المتاجر النشطة</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stores.filter((s) => s.is_active).length}
                </p>
              </div>
              <Store className="w-12 h-12 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                المتاجر
                {filteredStores.length !== stores.length && (
                  <span className="mr-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    (عرض {filteredStores.length} من {stores.length})
                  </span>
                )}
              </h2>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>مسح البحث</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث باسم المتجر..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="appearance-none w-full md:w-48 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm cursor-pointer"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Active Search Display */}
            {searchQuery && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">البحث النشط:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">
                  {searchQuery}
                  <button onClick={clearSearch} className="hover:text-primary-900 dark:hover:text-primary-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {filteredStores.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              {stores.length > 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد متاجر مطابقة للبحث</p>
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    مسح البحث
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400">لا توجد متاجر بعد</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    إضافة أول متجر
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3 p-4">
                {filteredStores.map((store) => (
                  <div key={store.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {store.logo ? (
                          <img className="h-14 w-14 rounded-full object-cover" src={store.logo} alt={store.name} />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Store className="w-7 h-7 text-primary-600 dark:text-primary-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{store.name}</h3>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                            store.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}
                        >
                          {store.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        {store.description && (
                          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{store.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => navigate(`/admin/stores/${store.id}`)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors min-h-[44px]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض</span>
                      </button>
                      <button
                        onClick={() => handleEdit(store)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors min-h-[44px]"
                      >
                        <Edit className="w-4 h-4" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors min-h-[44px]"
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
                        المتجر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStores.map((store) => (
                      <tr key={store.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {store.logo ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={store.logo}
                                  alt={store.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                  <Store className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                                </div>
                              )}
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{store.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              store.is_active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}
                          >
                            {store.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/stores/${store.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 dark:text-green-500 hover:text-green-900 dark:hover:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors min-h-[44px]"
                              title="عرض المتجر"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden lg:inline">عرض</span>
                            </button>
                            <button
                              onClick={() => handleEdit(store)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-primary-600 dark:text-primary-500 hover:text-primary-900 dark:hover:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors min-h-[44px]"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden lg:inline">تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDelete(store.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors min-h-[44px]"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden lg:inline">حذف</span>
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

      {/* Add/Edit Store Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingStore ? 'تعديل المتجر' : 'إضافة متجر جديد'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم المتجر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="أدخل اسم المتجر"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  وصف المتجر
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="وصف المتجر (اختياري)"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان المتجر
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="عنوان المتجر (اختياري)"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  شعار المتجر
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative cursor-pointer group w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-primary-500 transition-colors"
                    onClick={handleLogoClick}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">شعار</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-tl-md flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">انقر لاختيار صورة الشعار</p>
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="hidden" />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  صورة الغلاف
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative cursor-pointer group w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-primary-500 transition-colors"
                    onClick={handleBannerClick}
                  >
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">غلاف</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-tl-md flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">انقر لاختيار صورة الغلاف</p>
                  </div>
                </div>
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} className="hidden" />
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
                  {editingStore ? 'تحديث المتجر' : 'إضافة المتجر'}
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
