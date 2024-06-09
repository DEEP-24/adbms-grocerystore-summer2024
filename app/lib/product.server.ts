import { db } from "./prisma.server";

export function getAllProducts() {
  return db.product.findMany({
    include: {
      category: true,
    },
  });
}

export function getAllCategoriesWithProducts() {
  return db.category.findMany({
    include: {
      products: true,
    },
  });
}

export function getAllCategories() {
  return db.category.findMany();
}
