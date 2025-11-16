import BaseTextField from "@/components/BaseTextField/BaseTextField";
import BaseEnterText from "@/components/BaseEnterText/BaseEnterText";
import { ROW_ACTION_TYPE } from "@/constants";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";

import { BaseConfirmDialog } from "@/components/Dialogs/BaseConfirmDialog";
import {
    validateNotEmpty,
    validateField,
    validateMaxLength,
} from "@/helpers";
import { getPresignedUrl, uploadImageToPresignedUrl } from "@/helpers/presignedUrl";
import * as sellerProductsApi from "@/api/sellerProducts";
import * as brandApis from "@/api/brand";
import * as categoryApis from "@/api/category";
import {
    Product,
    ProductCreate,
    ProductUpdate,
    ProductVariant,
    ProductSKU,
    ProductStatus,
} from "@/types/api";
import { useStyles } from "./ProductManageForm.styles";

interface Props {
    id: string | number | null;
    actionType: string;
}

export interface ProductManageFormRef {
    handleSubmit: (onClose: () => any, onRefresh: () => any) => void;
    handleClose: (onClose: () => any) => any;
    handleActive: (onClose: () => any, onRefresh: () => any) => void;
}

const validators = {
    name: (value: any) => {
        return validateField([
            () => validateNotEmpty("Tên sản phẩm", value),
            () => validateMaxLength("Tên sản phẩm", value, 500),
        ]);
    },
    basePrice: (value: any) => {
        return validateField([
            () => validateNotEmpty("Giá gốc", value),
            () => {
                const num = Number(value);
                return isNaN(num) || num < 0
                    ? "Giá gốc phải là số không âm"
                    : "";
            },
        ]);
    },
    virtualPrice: (value: any) => {
        return validateField([
            () => validateNotEmpty("Giá bán", value),
            () => {
                const num = Number(value);
                return isNaN(num) || num < 0
                    ? "Giá bán phải là số không âm"
                    : "";
            },
        ]);
    },
    brandId: (value: any) => {
        return validateField([() => validateNotEmpty("Thương hiệu", value)]);
    },
    status: (value: any) => {
        return validateField([() => validateNotEmpty("Trạng thái", value)]);
    },
    images: (value: any) => {
        return validateField([
            () => {
                if (!Array.isArray(value) || value.length === 0) {
                    return "Vui lòng chọn ít nhất một hình ảnh";
                }
                return "";
            },
        ]);
    },
    categories: (value: any) => {
        return validateField([
            () => {
                if (!Array.isArray(value) || value.length === 0) {
                    return "Vui lòng chọn ít nhất một danh mục";
                }
                return "";
            },
        ]);
    },
};

const defaultFormData = {
    publishedAt: null,
    name: "",
    basePrice: 0,
    virtualPrice: 0,
    brandId: null,
    images: [],
    variants: [],
    categories: [],
    skus: [],
};

const fieldLabels = {
    publishedAt: "Ngày xuất bản",
    name: "Tên sản phẩm",
    basePrice: "Giá gốc",
    virtualPrice: "Giá bán",
    brandId: "Thương hiệu",
    images: "Hình ảnh",
    variants: "Biến thể",
    categories: "Danh mục",
    skus: "SKU",
    status: "Trạng thái",
};

export const ProductManageForm = forwardRef<ProductManageFormRef, Props>(
    ({ id, actionType }, ref) => {
        const classes = useStyles();
        const initialDataRef = useRef<any>({ ...defaultFormData });

        const [data, setData] = useState<any>({ ...defaultFormData });
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
        const [onConfirmClose, setOnConfirmClose] = useState<() => void>(
            () => () => {},
        );
        const [isUploading, setIsUploading] = useState(false);
        const [pendingProductImages, setPendingProductImages] = useState<File[]>([]);
        const [pendingSkuImages, setPendingSkuImages] = useState<Array<{ file: File; skuIndex: number }>>([]);
        const fileInputRef = useRef<HTMLInputElement>(null);

        // State for dropdown options
        const [brandOptions, setBrandOptions] = useState<any[]>([]);
        const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

        const handleInputChange = useCallback(
            (key: string) => (value: any) => {
                const error = validators[key]?.(value) || "";
                setErrors(prev => ({ ...prev, [key]: error }));
                setData(prev => {
                    return { ...prev, [key]: value };
                });
            },
            [],
        );

        const handleArrayChange = useCallback(
            (key: string) => (value: any) => {
                const error = validators[key]?.(value) || "";
                setErrors(prev => ({ ...prev, [key]: error }));
                setData(prev => ({ ...prev, [key]: value }));
            },
            [],
        );

        // Generate all possible SKU combinations from variants
        const generateSKUCombinations = useCallback(
            (variants: ProductVariant[]) => {
                if (variants.length === 0) return [];

                // Create all combinations using Cartesian product
                const combinations = variants.reduce(
                    (acc: string[][], variant) => {
                        if (acc.length === 0) {
                            return variant.options.map(option => [option]);
                        }
                        return acc.flatMap(combo =>
                            variant.options.map(option => [...combo, option]),
                        );
                    },
                    [],
                );

                return combinations.map(combo => ({
                    value: combo.join("-"),
                    price: data.basePrice || 0,
                    stock: 0,
                    image: "",
                }));
            },
            [data.basePrice],
        );

        const handleVariantsChange = useCallback(
            (variants: ProductVariant[]) => {
                setData(prev => {
                    const newSKUs = generateSKUCombinations(variants);
                    return {
                        ...prev,
                        variants,
                        skus: newSKUs,
                    };
                });
            },
            [generateSKUCombinations],
        );

        const addVariant = useCallback(() => {
            const newVariant: ProductVariant = { value: "", options: [] };
            const newVariants = [...data.variants, newVariant];
            setData(prev => ({ ...prev, variants: newVariants }));
        }, [data.variants]);

        const removeVariant = useCallback(
            (index: number) => {
                const newVariants = data.variants.filter(
                    (_: any, i: number) => i !== index,
                );
                handleVariantsChange(newVariants);
            },
            [data.variants, handleVariantsChange],
        );

        const updateVariant = useCallback(
            (index: number, field: "value" | "options", value: any) => {
                const newVariants = [...data.variants];
                newVariants[index] = { ...newVariants[index], [field]: value };
                handleVariantsChange(newVariants);
            },
            [data.variants, handleVariantsChange],
        );

        const handleSubmit = async (
            onClose: () => any,
            onRefresh: () => any,
        ) => {
            const newErrors: Record<string, string> = {};
            Object.keys(validators).forEach(key => {
                const error = validators[key](data[key]);
                if (error) newErrors[key] = error;
            });
            setErrors(newErrors);
            if (Object.values(newErrors).some(error => error)) return;

            try {
                setIsUploading(true);

                // Upload pending product images first
                let uploadedImageUrls: string[] = [...data.images.filter(img => !img.startsWith('blob:'))];
                if (pendingProductImages.length > 0) {
                    console.log(`[handleSubmit] Uploading ${pendingProductImages.length} product images...`);
                    let uploadSuccess = 0;
                    for (const file of pendingProductImages) {
                        try {
                            // Step 1: Get presigned URL
                            const presignedData = await getPresignedUrl(file.name);
                            if (!presignedData) {
                                throw new Error('Failed to get presigned URL');
                            }

                            // Step 2: Upload to S3
                            const uploadResult = await uploadImageToPresignedUrl(presignedData.presignedUrl, file);
                            if (!uploadResult) {
                                throw new Error('Failed to upload to S3');
                            }

                            // Step 3: Use the returned URL
                            uploadedImageUrls.push(presignedData.url);
                            uploadSuccess++;
                        } catch (error) {
                            console.error(`[handleSubmit] Error uploading ${file.name}:`, error);
                        }
                    }
                    console.log(`[handleSubmit] Uploaded ${uploadSuccess}/${pendingProductImages.length} product images`);
                    if (uploadSuccess < pendingProductImages.length) {
                        toast.warning(
                            `Chỉ tải lên thành công ${uploadSuccess}/${pendingProductImages.length} ảnh sản phẩm`,
                            { autoClose: 3000 }
                        );
                    }
                }

                // Upload pending SKU images
                const updatedSkus = [...data.skus];
                if (pendingSkuImages.length > 0) {
                    console.log(`[handleSubmit] Uploading ${pendingSkuImages.length} SKU images...`);
                    let uploadSuccess = 0;
                    for (const { file, skuIndex } of pendingSkuImages) {
                        try {
                            // Step 1: Get presigned URL
                            const presignedData = await getPresignedUrl(file.name);
                            if (!presignedData) {
                                throw new Error('Failed to get presigned URL');
                            }

                            // Step 2: Upload to S3
                            const uploadResult = await uploadImageToPresignedUrl(presignedData.presignedUrl, file);
                            if (!uploadResult) {
                                throw new Error('Failed to upload to S3');
                            }

                            // Step 3: Update SKU with the returned URL
                            updatedSkus[skuIndex] = {
                                ...updatedSkus[skuIndex],
                                image: presignedData.url,
                            };
                            uploadSuccess++;
                        } catch (error) {
                            console.error(`[handleSubmit] Error uploading SKU image:`, error);
                        }
                    }
                    console.log(`[handleSubmit] Uploaded ${uploadSuccess}/${pendingSkuImages.length} SKU images`);
                    if (uploadSuccess < pendingSkuImages.length) {
                        toast.warning(
                            `Chỉ tải lên thành công ${uploadSuccess}/${pendingSkuImages.length} ảnh SKU`,
                            { autoClose: 3000 }
                        );
                    }
                }

                // Clear pending images after upload
                setPendingProductImages([]);
                setPendingSkuImages([]);

                if (actionType === ROW_ACTION_TYPE.ADD) {
                    const payload: ProductCreate = {
                        publishedAt: data.publishedAt,
                        name: data.name,
                        basePrice: Number(data.basePrice),
                        virtualPrice: Number(data.virtualPrice),
                        brandId: Number(data.brandId),
                        images: uploadedImageUrls,
                        variants: data.variants,
                        categories: data.categories,
                        skus: updatedSkus.map((sku: any) => ({
                            ...sku,
                            price: Number(sku.price),
                            stock: Number(sku.stock),
                        })),

                    };
                    const response = await sellerProductsApi.postAsync(payload);

                    if (response) {
                        toast.success("Tạo sản phẩm thành công!", { autoClose: 3000 });
                        onClose();
                        onRefresh();
                    }
                } else if (actionType === ROW_ACTION_TYPE.EDIT) {
                    const payload: ProductUpdate & { productId: number } = {
                        productId: Number(id),
                        publishedAt: data.publishedAt,
                        name: data.name,
                        basePrice: Number(data.basePrice),
                        virtualPrice: Number(data.virtualPrice),
                        brandId: Number(data.brandId),
                        images: uploadedImageUrls,
                        variants: data.variants,
                        categories: data.categories,
                        skus: updatedSkus.map((sku: any) => ({
                            ...sku,
                            price: Number(sku.price),
                            stock: Number(sku.stock),
                        })),
                    };
                    const response = await sellerProductsApi.updateAsync(payload);

                    if (response) {
                        toast.success("Cập nhật sản phẩm thành công!", { autoClose: 3000 });
                        onClose();
                        onRefresh();
                    }
                }
            } catch (error) {
                console.error("[handleSubmit] Error:", error);
                toast.error("Có lỗi xảy ra khi lưu sản phẩm", { autoClose: 3000 });
            } finally {
                setIsUploading(false);
            }
        };

        const handleActive = async (
            _onClose: () => any,
            onRefresh: () => any,
        ) => {
            if (!id) return;

            try {
                // Determine next status based on current status
                let newStatus: ProductStatus;
                switch (data.status) {
                    case "INACTIVE":
                        newStatus = "ACTIVE";
                        break;
                    case "WAITING_ACTIVE":
                        newStatus = "ACTIVE";
                        break;
                    case "ACTIVE":
                        newStatus = "INACTIVE";
                        break;
                    default:
                        newStatus = "ACTIVE";
                        break;
                }

                // Send complete payload with all required fields
                const payload: ProductUpdate & { productId: number } = {
                    productId: Number(id),
                    publishedAt: data.publishedAt,
                    name: data.name,
                    basePrice: Number(data.basePrice),
                    virtualPrice: Number(data.virtualPrice),
                    brandId: Number(data.brandId),
                    images: data.images,
                    variants: data.variants,
                    categories: data.categories,
                    skus: data.skus.map((sku: any) => ({
                        ...sku,
                        price: Number(sku.price),
                        stock: Number(sku.stock),
                    })),
                    status: newStatus,
                };

                const response = await sellerProductsApi.updateAsync(payload);

                if (response) {
                    // Update local state
                    setData(prev => ({ ...prev, status: newStatus }));
                    onRefresh();
                }
            } catch (error) {
                console.error("Error updating product status:", error);
            }
        };

        const handleClose = (onClose: () => void) => {
            const initialData = initialDataRef.current ?? {
                ...defaultFormData,
            };

            const isChanged = Object.keys(defaultFormData).some(key => {
                return (initialData[key] ?? "") !== (data[key] ?? "");
            });

            if (!isChanged || actionType === ROW_ACTION_TYPE.VIEW)
                return onClose();

            setOnConfirmClose(() => onClose);
            setConfirmDialogOpen(true);
        };

        useImperativeHandle(ref, () => ({
            handleSubmit,
            handleClose,
            handleActive,
        }));

        const fetchInitialData = async () => {
            if (actionType === ROW_ACTION_TYPE.EDIT && id) {
                const res: Product = await sellerProductsApi.getDetailsAsync(
                    Number(id),
                );
                if (res) {
                    const formData = {
                        publishedAt: res.publishedAt,
                        name: res.name || "",
                        basePrice: res.basePrice || 0,
                        virtualPrice: res.virtualPrice || 0,
                        brandId: res.brandId || null,
                        images: res.images || [],
                        variants: res.variants || [],
                        categories: res.categories?.map(cat => cat.id) || [],
                        skus: res.skus || [],
                        status: res.status || "ACTIVE",
                    };
                    setData(formData);
                    initialDataRef.current = formData;
                }
            }
        };

        const fetchDropdownData = async () => {
            // Fetch brands
            try {
                const brandsResponse = await brandApis.getListAsync({
                    limit: 1000,
                });
                if (brandsResponse?.data) {
                    const brandOptions = brandsResponse.data.map(
                        (brand: any) => ({
                            text: brand.name,
                            value: brand.id,
                        }),
                    );
                    setBrandOptions(brandOptions);
                }
            } catch (error) {
                return null;
            }

            // Fetch categories
            try {
                const categoriesResponse = await categoryApis.getListAsync({
                    limit: 1000,
                });
                if (categoriesResponse?.data) {
                    const categoryOptions = categoriesResponse.data.map(
                        (category: any) => ({
                            text: category.name,
                            value: category.id,
                        }),
                    );
                    setCategoryOptions(categoryOptions);
                }
            } catch (error) {
                return null;
            }
        };

        useEffect(() => {
            fetchInitialData();
            fetchDropdownData();
        }, [id, actionType]);

        return (
            <Box className={classes.container}>
                <Box className={classes.formContainer}>
                    <BaseTextField
                        label={fieldLabels.name}
                        value={data.name}
                        onChange={handleInputChange("name")}
                        errorMessage={errors.name}
                        placeholder="Nhập tên sản phẩm"
                    />
                    <Box className={classes.priceContainer}>
                        <BaseTextField
                            label={fieldLabels.basePrice}
                            value={data.basePrice}
                            onChange={handleInputChange("basePrice")}
                            errorMessage={errors.basePrice}
                            placeholder="0"
                            type="number"
                        />
                        <BaseTextField
                            label={fieldLabels.virtualPrice}
                            value={data.virtualPrice}
                            onChange={handleInputChange("virtualPrice")}
                            errorMessage={errors.virtualPrice}
                            placeholder="0"
                            type="number"
                        />
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>Thương hiệu</InputLabel>
                        <Select
                            value={data.brandId || ""}
                            onChange={(event) => handleInputChange("brandId")(event.target.value)}
                            label="Thương hiệu"
                        >
                            {brandOptions.map((brand) => (
                                <MenuItem key={brand.value} value={brand.value}>
                                    {brand.text}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {errors.brandId && (
                        <Typography color="error" variant="caption" display="block">
                            {errors.brandId}
                        </Typography>
                    )}
                    {/* <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={data.status || ""}
                            onChange={(event) => handleInputChange("status")(event.target.value)}
                            label="Trạng thái"
                        >
                            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                            <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                            <MenuItem value="WAITING_ACTIVE">Chờ kích hoạt</MenuItem>
                        </Select>
                    </FormControl> */}
                    {errors.status && (
                        <Typography color="error" variant="caption" display="block">
                            {errors.status}
                        </Typography>
                    )}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label={fieldLabels.publishedAt}
                            value={data.publishedAt ? dayjs(data.publishedAt) : null}
                            onChange={(newValue: Dayjs | null) => {
                                const dateString = newValue
                                    ? newValue.format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                                    : null;
                                handleInputChange("publishedAt")(dateString);
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    placeholder: "Chọn ngày giờ (tùy chọn)",
                                },
                            }}
                        />
                    </LocalizationProvider>
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                            Hình ảnh sản phẩm
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                marginBottom: 2,
                            }}
                        >
                            {data.images.map((image: string, index: number) => (
                                <Box
                                    key={index}
                                    sx={{
                                        position: "relative",
                                        width: 100,
                                        height: 100,
                                        borderRadius: 1,
                                        overflow: "hidden",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`Product ${index}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const newImages = data.images.filter(
                                                (_: string, i: number) => i !== index
                                            );
                                            handleArrayChange("images")(
                                                newImages
                                            );
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: -5,
                                            right: -5,
                                            backgroundColor: "rgba(255,255,255,0.9)",
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ marginBottom: 1 }}
                            disabled={isUploading}
                        >
                            {isUploading ? "Đang xử lý..." : "Chọn Hình Ảnh"}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (!files) return;

                                    // Just add files to pending list - don't upload yet
                                    const newPendingImages = [...pendingProductImages];
                                    for (let i = 0; i < files.length; i++) {
                                        newPendingImages.push(files[i]);
                                    }
                                    setPendingProductImages(newPendingImages);

                                    // Add file names to preview (use URL.createObjectURL)
                                    const newImages = [...data.images];
                                    for (let i = 0; i < files.length; i++) {
                                        const fileUrl = URL.createObjectURL(files[i]);
                                        newImages.push(fileUrl);
                                    }
                                    handleArrayChange("images")(newImages);

                                    // Reset input value to allow re-upload of same file
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }

                                    toast.info(
                                        `Đã chọn ${files.length} ảnh. Nhấn "Lưu" để tải lên.`,
                                        { autoClose: 3000 }
                                    );
                                }}
                            />
                        </Button>
                        {errors.images && (
                            <Typography
                                color="error"
                                variant="caption"
                                display="block"
                            >
                                {errors.images}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="h6" className={classes.sectionTitle}>
                        Danh mục sản phẩm
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Chọn danh mục</InputLabel>
                        <Select
                            multiple
                            value={data.categories}
                            onChange={event => {
                                const value = event.target.value as number[];
                                handleArrayChange("categories")(value);
                            }}
                            renderValue={selected => (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}
                                >
                                    {(selected as number[]).map(value => {
                                        const category = categoryOptions.find(
                                            cat => cat.value === value,
                                        );
                                        return (
                                            <Chip
                                                key={value}
                                                label={category?.text || value}
                                                size="small"
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        >
                            {categoryOptions.map(category => (
                                <MenuItem
                                    key={category.value}
                                    value={category.value}
                                >
                                    {category.text}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {errors.categories && (
                        <Typography
                            color="error"
                            variant="caption"
                            display="block"
                        >
                            {errors.categories}
                        </Typography>
                    )}
                    <Typography variant="h6" className={classes.sectionTitle}>
                        Biến thể sản phẩm
                    </Typography>

                    {data.variants.map(
                        (variant: ProductVariant, index: number) => (
                            <Box key={index} className={classes.variantItem}>
                                <Box className={classes.variantHeader}>
                                    <BaseTextField
                                        label="Tên biến thể"
                                        value={variant.value}
                                        onChange={value =>
                                            updateVariant(index, "value", value)
                                        }
                                        placeholder="VD: Color, Size"
                                    />
                                    <IconButton
                                        onClick={() => removeVariant(index)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <BaseEnterText
                                    value={variant.options}
                                    onChange={options =>
                                        updateVariant(index, "options", options)
                                    }
                                    placeholder="Nhập các tùy chọn (VD: Red, Blue, Green) - Nhấn Enter để thêm"
                                />
                            </Box>
                        ),
                    )}

                    <Button
                        startIcon={<AddIcon />}
                        onClick={addVariant}
                        variant="outlined"
                        className={classes.addVariantBtn}
                    >
                        Thêm biến thể
                    </Button>
                    <Typography variant="h6" className={classes.sectionTitle}>
                        SKU sản phẩm ({data.skus.length} SKU được tạo)
                    </Typography>
                    {data.skus.length > 0 ? (
                        <Box className={classes.skuContainer}>
                            {data.skus.map((sku: ProductSKU, index: number) => (
                                <Box key={index} className={classes.skuItem}>
                                    <Typography
                                        variant="body1"
                                        className={classes.skuLabel}
                                    >
                                        SKU: {sku.value}
                                    </Typography>
                                    <Box className={classes.skuInputs}>
                                        <BaseTextField
                                            label="Giá (VND)"
                                            value={sku.price.toString()}
                                            onChange={value => {
                                                const newSkus = [...data.skus];
                                                newSkus[index] = {
                                                    ...newSkus[index],
                                                    price: Number(value) || 0,
                                                };
                                                setData(prev => ({
                                                    ...prev,
                                                    skus: newSkus,
                                                }));
                                            }}
                                            type="number"
                                            placeholder="0"
                                        />
                                        <BaseTextField
                                            label="Tồn kho"
                                            value={sku.stock.toString()}
                                            onChange={value => {
                                                const newSkus = [...data.skus];
                                                newSkus[index] = {
                                                    ...newSkus[index],
                                                    stock: Number(value) || 0,
                                                };
                                                setData(prev => ({
                                                    ...prev,
                                                    skus: newSkus,
                                                }));
                                            }}
                                            type="number"
                                            placeholder="0"
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                            <Typography variant="subtitle2">
                                                Hình ảnh SKU
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                                                {sku.image && (
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            width: 100,
                                                            height: 100,
                                                            borderRadius: 1,
                                                            overflow: "hidden",
                                                            border: "1px solid #ddd",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <img
                                                            src={sku.image}
                                                            alt={`SKU ${sku.value}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const newSkus = [...data.skus];
                                                                newSkus[index] = {
                                                                    ...newSkus[index],
                                                                    image: "",
                                                                };
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    skus: newSkus,
                                                                }));
                                                            }}
                                                            sx={{
                                                                position: "absolute",
                                                                top: -5,
                                                                right: -5,
                                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    size="small"
                                                    sx={{ alignSelf: "center" }}
                                                >
                                                    {sku.image ? "Đổi ảnh" : "Chọn ảnh"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Add to pending SKU images for upload on save
                                                                const newPendingSkuImages = [...pendingSkuImages];
                                                                newPendingSkuImages.push({ file, skuIndex: index });
                                                                setPendingSkuImages(newPendingSkuImages);

                                                                // Show preview with object URL
                                                                const fileUrl = URL.createObjectURL(file);
                                                                const newSkus = [...data.skus];
                                                                newSkus[index] = {
                                                                    ...newSkus[index],
                                                                    image: fileUrl,
                                                                };
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    skus: newSkus,
                                                                }));

                                                                toast.info(
                                                                    "Ảnh SKU sẽ được tải lên khi bạn nhấn Lưu",
                                                                    { autoClose: 2000 }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color="textSecondary" variant="body2">
                            Thêm biến thể để tự động tạo SKU. Ví dụ: nếu có
                            Color (Red, Blue) và Size (S, M) sẽ tạo ra 4 SKU:
                            Red-S, Red-M, Blue-S, Blue-M
                        </Typography>
                    )}
                </Box>

                <BaseConfirmDialog
                    open={confirmDialogOpen}
                    title="Xác nhận"
                    content="Bạn có muốn đóng form không? Dữ liệu chưa lưu sẽ bị mất."
                    onNo={() => setConfirmDialogOpen(false)}
                    onYes={() => {
                        setConfirmDialogOpen(false);
                        onConfirmClose();
                    }}
                />
            </Box>
        );
    },
);

ProductManageForm.displayName = "ProductManageForm";
