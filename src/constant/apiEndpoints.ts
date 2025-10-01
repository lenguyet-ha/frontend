const API_LOCAL = "/api";
export const apiEndPoints = {
  LOGIN_USER: `${API_LOCAL}/auth/login`,
  GET_USER_INFO: `${API_LOCAL}/profile`,
  REGISTER_USER: `${API_LOCAL}/auth/register`,

  //#region Product
  PRODUCTS: `${API_LOCAL}/products`,
  MANAGE_PRODUCT: `${API_LOCAL}/manage-product/products`,
  //#endregion Product
};
