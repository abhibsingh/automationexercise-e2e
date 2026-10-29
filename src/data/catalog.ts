export const catalog = {
  knownProduct: { id: 1, name: 'Blue Top', price: 500, category: 'Women > Tops', brand: 'Polo' },
  secondProduct: { id: 2, name: 'Men Tshirt', price: 400 },
  searchTerm: 'top',
  noResultsTerm: 'zzqx-no-such-product',
  edgeTerms: ['"; DROP TABLE products; --', '<script>alert(1)</script>', 'ß é 中文'],
  categories: [
    { id: 1, parent: 'Women', name: 'Dress' },
    { id: 3, parent: 'Men', name: 'Tshirts' },
    { id: 4, parent: 'Kids', name: 'Dress' },
  ],
  invalidProductId: 99999,
} as const;
