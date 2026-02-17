import CategoryModel from "./categories.model.js";

//Create Category

export const create = async (category) => {
	return await CategoryModel.create(category);
};

// Find Category By ID

export const findById = async (id) => {
	return await CategoryModel.findById(id);
};

// Update Category By ID

export const updateById = async (id, category) => {
	return await CategoryModel.findByIdAndUpdate(id, category, {
		new: true, // return updated document
		runValidators: true, // apply schema validators on update
	});
};

//Delete Category By ID

export const deleteById = async (id) => {
	return await CategoryModel.findByIdAndDelete(id);
};

// List All Categories

export const list = async () => {
	return await CategoryModel.find().sort({ createdAt: -1 });
};
