const API_LOCAL = "/api";
export const apiEndPoints = {
  LOGIN_USER: `${API_LOCAL}/auth/login`,
  GET_USER_INFO: `${API_LOCAL}/profile`,
  REGISTER_USER: `${API_LOCAL}/auth/register`,
  UPDATE_PROFILE: `${API_LOCAL}/profile`,
  CHANGE_PASSWORD: `${API_LOCAL}/profile/change-password`,

  //#region Product
  PRODUCTS: `${API_LOCAL}/products`,
  MANAGE_PRODUCT: `${API_LOCAL}/manage-product/products`,
  //#endregion Product

  //#category
  CATEGORIES: `${API_LOCAL}/category`,
  //#endregion category

  //#region Cart
  CART: `${API_LOCAL}/cart`,
  //#endregion Cart

  //#region Order
  ORDER: `${API_LOCAL}/orders`,
  //#endregion Order

  //#region Media
  MEDIA: `${API_LOCAL}/media`,
  //#endregion Media

  //#region Reviews
  REVIEWS: `${API_LOCAL}/reviews`,
  //#endregion Reviews

  //#region Messages
  MESSAGES: `${API_LOCAL}/messages`,
  //#endregion Messages

  //#region Seller Registration
  SELLER_REGISTRATION: `${API_LOCAL}/seller-registration`,
  //#endregion Seller Registration

  //#region Discount Codes
  DISCOUNT_CODES: `${API_LOCAL}/discount-codes`,
  //#endregion Discount Codes

  //#region Shipping Methods
  SHIPPING_METHODS: `${API_LOCAL}/shipping-methods`,
  //#endregion Shipping Methods

  //#region Payment Methods
  PAYMENT_METHODS: `${API_LOCAL}/payment-methods`,
  //#endregion Payment Methods
};
