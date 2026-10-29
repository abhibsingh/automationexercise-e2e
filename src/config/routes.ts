export const routes = {
  home: '/',
  login: '/login',
  products: '/products',
  productDetails: (id: number) => `/product_details/${id}`,
  brand: (name: string) => `/brand_products/${encodeURIComponent(name)}`,
  category: (id: number) => `/category_products/${id}`,
  cart: '/view_cart',
  checkout: '/checkout',
  deleteAccount: '/delete_account',
  logout: '/logout',
} as const;

export const AD_HOSTS =
  /googlesyndication|doubleclick|googleadservices|adservice\.google|google-analytics|googletagmanager|fundingchoicesmessages|adtrafficquality|pagead/i;
