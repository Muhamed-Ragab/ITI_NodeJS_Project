import slugify from "slugify";
import * as categoryRepository from "./categories.repository.js";

export const createCategory = async (category) => {
	const slug = slugify(category.name, {
		lower: true,
		strict: true,
	});

	return await categoryRepository.create({
		...category,
		slug,
	});
};

export const getCategoryById = async (id) => {
	return await categoryRepository.findById(id);
};

export const updateCategory = async (id, category) => {
	if (category.name) {
		category.slug = slugify(category.name, {
			lower: true,
			strict: true,
		});
	}

	return await categoryRepository.updateById(id, category);
};

export const deleteCategory = async (id) => {
	return await categoryRepository.deleteById(id);
};

export const listCategories = async () => {
	return await categoryRepository.list();
};
