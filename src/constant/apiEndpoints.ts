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
};
