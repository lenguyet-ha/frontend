// Validation helpers
export const validateNotEmpty = (fieldName: string, value: any): string => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} không được để trống`;
  }
  return "";
};

export const validateMaxLength = (
  fieldName: string,
  value: string,
  maxLength: number
): string => {
  if (value && value.length > maxLength) {
    return `${fieldName} không được vượt quá ${maxLength} ký tự`;
  }
  return "";
};

export const validateMinLength = (
  fieldName: string,
  value: string,
  minLength: number
): string => {
  if (value && value.length < minLength) {
    return `${fieldName} phải có ít nhất ${minLength} ký tự`;
  }
  return "";
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return "Email không hợp lệ";
  }
  return "";
};

export const validatePhone = (phone: string): string => {
  const phoneRegex = /^[0-9]{10,11}$/;
  if (phone && !phoneRegex.test(phone)) {
    return "Số điện thoại không hợp lệ";
  }
  return "";
};

export const validateNumber = (fieldName: string, value: any): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} phải là số`;
  }
  return "";
};

export const validatePositiveNumber = (fieldName: string, value: any): string => {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} phải là số dương`;
  }
  return "";
};

// Run multiple validators and return first error
export const validateField = (validators: (() => string)[]): string => {
  for (const validator of validators) {
    const error = validator();
    if (error) return error;
  }
  return "";
};
