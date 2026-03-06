import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { prepareFormData } from '../utils/productFormHelpers';
import { productSchema } from "../utils/productValidation";
import { zodResolver } from "@hookform/resolvers/zod";

export const useProductForm = (product = null) => {
    const navigate = useNavigate();

    const productData      = product?.product  ?? null;
    const existingVariants = Array.isArray(productData?.variants) ? productData.variants : [];

    // Keep existingVariants in a ref so the useEffect can always read the
    // latest value without needing it as a dependency (avoids infinite loop)
    const existingVariantsRef = useRef(existingVariants);
    existingVariantsRef.current = existingVariants;

    const [mainImageData, setMainImageData]                       = useState(productData?.mainImage        || null);
    const [additionalImagesData, setAdditionalImagesData]         = useState(productData?.additionalImages || []);
    const [existingAdditionalImages, setExistingAdditionalImages] = useState(productData?.additionalImages || []);
    const [selectedOptions, setSelectedOptions]                   = useState(
        buildSelectedOptions(productData?.options)
    );

    const formMethods = useForm({
        resolver:      zodResolver(productSchema),
        defaultValues: getDefaultValues(productData, existingVariants),
    });

    const { reset, control, setValue } = formMethods;

    const { fields: variantFields, replace: replaceVariants } = useFieldArray({
        control,
        name: "variants",
    });

    // Keep variantFields in a ref for the same reason — read latest without
    // adding it as a dependency which would cause infinite loop
    const variantFieldsRef = useRef(variantFields);
    variantFieldsRef.current = variantFields;

    // ── Auto-generate variants whenever selectedOptions changes ───────────────
    // This runs on mount too — which is correct for edit mode because
    // selectedOptions is already populated from buildSelectedOptions() and
    // we need the variant table to appear immediately.
    useEffect(() => {
        const optionValueObjects = selectedOptions
            .map(selectedOpt => {
                if (!selectedOpt.optionId?._id) return null;
                return selectedOpt.values.map(valueObj => ({
                    optionId: selectedOpt.optionId._id.toString(),
                    valueId:  valueObj._id.toString(),
                    label:    valueObj.label,
                }));
            })
            .filter(Boolean);

        if (
            optionValueObjects.length === 0 ||
            optionValueObjects.some(arr => arr.length === 0)
        ) {
            replaceVariants([]);
            if (productData?.hasVariants) {
                setValue('price',    '');
                setValue('quantity', '');
            };
            
            return;
        }

        const combinations = optionValueObjects.reduce((acc, optValues) => {
            if (acc.length === 0) return optValues.map(v => [v]);
            const combined = [];
            acc.forEach(existingCombo => {
                optValues.forEach(newValue => {
                    combined.push([...existingCombo, newValue]);
                });
            });
            return combined;
        }, []);

        // Read from refs — always the latest values, no stale closure problem
        const currentVariants  = variantFieldsRef.current;
        const dbVariants       = existingVariantsRef.current;

        const newVariants = combinations.map(combo => {
            const label = combo.map(v => v.label).join(' / ');

            // 1 — Preserve what admin already typed this session (after first render)
            const inForm = currentVariants.find(v => v.label === label);
            if (inForm) {
                return {
                    label,
                    sku:        inForm.sku        ?? '',
                    price:      inForm.price      ?? '',
                    quantity:   inForm.quantity   ?? '',
                    options:    combo.map(v => ({ optionId: v.optionId, valueId: v.valueId })),
                    _variantId: inForm._variantId ?? null,
                };
            }

            // 2 — Match against DB variants (edit mode initial load, or re-selecting
            //     a previously deselected option)
            const fromDb = dbVariants.find(v =>
                v.options.length === combo.length &&
                combo.every(c =>
                    v.options.some(o =>
                        o.optionId?.toString() === c.optionId &&
                        o.valueId?.toString()  === c.valueId
                    )
                )
            );

            return {
                label,
                sku:        fromDb?.sku                  ?? '',
                price:      fromDb?.price?.toString()    ?? '',
                quantity:   fromDb?.quantity?.toString() ?? '',
                options:    combo.map(v => ({ optionId: v.optionId, valueId: v.valueId })),
                _variantId: fromDb?._id?.toString()      ?? null,
            };
        });

        replaceVariants(newVariants);
        setValue('price',    undefined);
        setValue('quantity', undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOptions]);
    // Only selectedOptions as dep — variantFields and existingVariants are
    // read via refs to avoid stale closures and infinite loops

    // ── Reset when navigating between edit pages ──────────────────────────────
    useEffect(() => {
        if (productData) {
            const variantsFromProduct = Array.isArray(productData.variants) ? productData.variants : [];
            reset(getDefaultValues(productData, variantsFromProduct));
            setMainImageData(productData.mainImage        || null);
            setAdditionalImagesData(productData.additionalImages || []);
            setExistingAdditionalImages(productData.additionalImages || []);
            setSelectedOptions(buildSelectedOptions(productData.options));
            existingVariantsRef.current = variantsFromProduct;
        }
    }, [product, reset]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMainImageChange           = (img)        => setMainImageData(img);
    const handleAdditionalImagesChange    = (imgs)       => setAdditionalImagesData(imgs);
    const handleOptionChange              = (newOptions) => setSelectedOptions(newOptions);
    const handleRemoveExistingAdditionalImage = (url) =>
        setExistingAdditionalImages(prev => prev.filter(img => img.url !== url));

    const prepareSubmissionData = (formValues) => {
        return prepareFormData({
            ...formValues,
            mainImageData,
            additionalImagesData,
            existingAdditionalImages,
            selectedOptions,
        });
    };

    return {
        formMethods,
        mainImageData,
        additionalImagesData,
        existingAdditionalImages,
        selectedOptions,
        handleMainImageChange,
        handleAdditionalImagesChange,
        handleOptionChange,
        handleRemoveExistingAdditionalImage,
        prepareSubmissionData,
        navigate,
        variantFields,
    };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSelectedOptions(options = []) {
    if (!options?.length) return [];

    return options
        .map(opt => {
            const fullOption = opt.optionId;
            if (!fullOption?._id) return null;

            const chosenIds = (opt.values || []).map((value) =>
                typeof value === 'string' ? value : value?._id?.toString?.() || value?.toString?.()
            );

            const fullValues = chosenIds
                .map((id) =>
                    fullOption.values?.find(
                        (v) => v._id?.toString() === id
                    )
                )
                .filter(Boolean);

            if (fullValues.length === 0) return null;

            return { optionId: fullOption, values: fullValues };
        })
        .filter(Boolean);
}

function getDefaultValues(product, variants = []) {
    if (!product) {
        return {
            name: '', sku: '', price: '', quantity: '',
            discount: '', categoryId: '', brand: '',
            status: 'enabled', tags: [],
            shortDescription: '', longDescription: '',
            flashSaleIsActive: false,
            flashSaleSalePrice: '',
            flashSaleStartAt: '',
            flashSaleEndAt: '',
        };
    }

    return {
        name:             product.name             || '',
        sku:              product.sku              || '',
        price:            product.hasVariants ? undefined : (product.price    || ''),
        quantity:         product.hasVariants ? undefined : (product.quantity || ''),
        discount:         product.discount         || '',
        categoryId:       product.categoryId?._id  || product.categoryId || '',
        brand:            product.brandId?._id     || product.brandId    || '',
        status:           product.status           || 'enabled',
        tags:             product.tags             || [],
        shortDescription: product.shortDescription || '',
        longDescription:  product.longDescription  || '',
        flashSaleIsActive: Boolean(product.flashSale?.isActive),
        flashSaleSalePrice: product.flashSale?.salePrice ?? '',
        flashSaleStartAt: toDateTimeLocal(product.flashSale?.startAt),
        flashSaleEndAt: toDateTimeLocal(product.flashSale?.endAt),
        variants: variants.map(v => ({
            label:      '',
            sku:        v.sku,
            price:      v.price.toString(),
            quantity:   v.quantity.toString(),
            options:    v.options.map(o => ({
                optionId: o.optionId.toString(),
                valueId:  o.valueId.toString(),
            })),
            _variantId: v._id.toString(),
        })),
    };
}

function toDateTimeLocal(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (num) => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
