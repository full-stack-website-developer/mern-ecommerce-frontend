import { z } from "zod";

const optionalNumber = z
  .union([z.string(), z.number(), z.undefined()])
  .transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  });

// Schema for each individual variant row
const variantSchema = z.object({
  label:    z.string().optional(),
  sku:      z.string().min(1, "Variant SKU is required"),
  price:    z.coerce.number().min(0, "Price must be 0 or greater"),
  quantity: z.coerce.number().min(0).max(10000),
  options:  z.array(
    z.object({
      optionId: z.string(),
      valueId:  z.string(),
    })
  ).optional(),
});

export const productSchema = z.object({
  name: z.string().min(3, "Product Name must be at least 3 letters").max(50),

  // Base product SKU — always required regardless of hasVariants
  sku: z.string().min(1, "SKU is required"),

  // price + quantity: required only when there are NO variants
  // When variants exist, each variant carries its own price/qty
  price:    optionalNumber,
  quantity: optionalNumber,
  discount: optionalNumber,
  
  categoryId: z.string().min(1, "Category is required"),
  brand:      z.string().min(1, "Brand is required"),
  status:     z.string().min(1, "Status is required"),

  shortDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters")
    .max(150, "Short description is too long"),

  // longDescription is optional — but if provided must meet min length
  longDescription: z
    .string()
    .max(2000, "Long description is too long")
    .optional()
    .or(z.literal("")),

  tags: z.array(z.string()).optional(),
  flashSaleIsActive: z.boolean().optional(),
  flashSaleSalePrice: optionalNumber,
  flashSaleStartAt: z.string().optional().or(z.literal("")),
  flashSaleEndAt: z.string().optional().or(z.literal("")),

  variants: z.array(variantSchema)
  .optional()
  .superRefine((variants, ctx) => {
    if (!variants || variants.length === 0) return;

    const seen = new Set();

    variants.forEach((variant, index) => {
      const sku = variant.sku?.trim().toUpperCase();

      if (!sku) return; // already caught by variantSchema min(1)

      if (seen.has(sku)) {
        ctx.addIssue({
          path: [index, "sku"],
          code: z.ZodIssueCode.custom,
          message: `Duplicate SKU "${sku}" — each variant must have a unique SKU`,
        });
      } else {
        seen.add(sku);
      }
    });
  }),

}).superRefine((data, ctx) => {
  const hasVariants = data.variants && data.variants.length > 0;

  if (!hasVariants) {
    // Simple product — price and quantity are required
    if (data.price === undefined || data.price === null || data.price < 1) {
      ctx.addIssue({
        path: ["price"],
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than 0 for a simple product",
      });
    }
    if (data.quantity === undefined || data.quantity === null) {
      ctx.addIssue({
        path: ["quantity"],
        code: z.ZodIssueCode.custom,
        message: "Quantity is required for a simple product",
      });
    }
  }

  if (data.flashSaleIsActive) {
    if (data.flashSaleSalePrice === undefined || data.flashSaleSalePrice <= 0) {
      ctx.addIssue({
        path: ["flashSaleSalePrice"],
        code: z.ZodIssueCode.custom,
        message: "Sale price must be greater than 0",
      });
    }

    if (!data.flashSaleStartAt) {
      ctx.addIssue({
        path: ["flashSaleStartAt"],
        code: z.ZodIssueCode.custom,
        message: "Flash sale start date is required",
      });
    }

    if (!data.flashSaleEndAt) {
      ctx.addIssue({
        path: ["flashSaleEndAt"],
        code: z.ZodIssueCode.custom,
        message: "Flash sale end date is required",
      });
    }

    if (data.flashSaleStartAt && data.flashSaleEndAt) {
      const start = new Date(data.flashSaleStartAt);
      const end = new Date(data.flashSaleEndAt);

      if (isNaN(start.getTime())) {
        ctx.addIssue({
          path: ["flashSaleStartAt"],
          code: z.ZodIssueCode.custom,
          message: "Invalid flash sale start date",
        });
      }

      if (isNaN(end.getTime())) {
        ctx.addIssue({
          path: ["flashSaleEndAt"],
          code: z.ZodIssueCode.custom,
          message: "Invalid flash sale end date",
        });
      }

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
        ctx.addIssue({
          path: ["flashSaleEndAt"],
          code: z.ZodIssueCode.custom,
          message: "Flash sale end date must be after start date",
        });
      }
    }
  }
});
