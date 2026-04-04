export interface Store {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  productsCount: number;
  location: string;
  established: string;
}

export const stores: Store[] = [
  {
    id: 1,
    name: 'متجر التقنية الحديثة',
    slug: 'modern-tech',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    description: 'متجر متخصص في أحدث الأجهزة الإلكترونية والتقنيات الحديثة. نقدم لك أفضل المنتجات بأسعار منافسة.',
    productsCount: 45,
    location: 'الرياض',
    established: '2020',
  },
  {
    id: 2,
    name: 'متجر الأناقة للملابس',
    slug: 'elegance-fashion',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
    description: 'تشكيلة واسعة من الملابس العصرية للرجال والنساء. جودة عالية وتصاميم مميزة.',
    productsCount: 120,
    location: 'جدة',
    established: '2019',
  },
  {
    id: 3,
    name: 'متجر المنزل السعيد',
    slug: 'happy-home',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop',
    description: 'كل ما تحتاجه لمنزلك من أثاث وديكورات وأدوات منزلية. جودة وسعر ممتاز.',
    productsCount: 78,
    location: 'الدمام',
    established: '2021',
  },
  {
    id: 4,
    name: 'متجر الرياضة والنشاط',
    slug: 'sports-active',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    description: 'معدات رياضية وملابس رياضية لجميع الألعاب. ابدأ رحلتك الرياضية معنا.',
    productsCount: 32,
    location: 'الرياض',
    established: '2022',
  },
  {
    id: 5,
    name: 'متجر الإكسسوارات الفاخرة',
    slug: 'luxury-accessories',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&fit=crop',
    description: 'إكسسوارات فاخرة وحصرية. ساعات، نظارات، حقائب، والمزيد.',
    productsCount: 56,
    location: 'جدة',
    established: '2018',
  },
  {
    id: 6,
    name: 'المتجر الشامل',
    slug: 'general-store',
    image: 'https://images.unsplash.com/photo-1472851294608-415105022050?w=400&h=300&fit=crop',
    description: 'كل ما تحتاجه في مكان واحد. تسوق بسهولة وسرعة.',
    productsCount: 200,
    location: 'الرياض',
    established: '2017',
  },
];

// Get products for a store (simulated - in real app would be from backend)
export const getStoreProducts = (_storeId: number) => {
  // This function is deprecated - products are now loaded from API
  // In real app, this would be an API call to get store products
  return [];
};
