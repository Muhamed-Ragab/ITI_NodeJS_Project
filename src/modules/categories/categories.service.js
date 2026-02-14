import * as categoryRepository from "./categories.repository.js";
import slugify from "slugify";

 // Create Category
 
export const createCategory = async (category) => {
    const slug = slugify(category.name, {
        lower: true,
        strict: true
    });

    return await categoryRepository.create({
        ...category,
        slug
    });
};

 // Get Category By ID
 
export const getCategoryById = async (id) => {
    return await categoryRepository.findById(id);
};

 //Update Category
 
export const updateCategory = async (id, category) => {

    // Only update slug if name exists
    if (category.name) {
        category.slug = slugify(category.name, {
            lower: true,
            strict: true
        });
    }

    return await categoryRepository.updateById(id, category);
};

 // Delete Category
 
export const deleteCategory = async (id) => {
    return await categoryRepository.deleteById(id);
};


 // List Categories
 
export const listCategories = async () => {
    return await categoryRepository.list();
};
