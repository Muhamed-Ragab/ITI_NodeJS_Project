import CategoryModel from "./categories.model.js";

export const create = async (category) => {
	return await CategoryModel.create(category);
};

export const findById = async (id) => {
	return await CategoryModel.findById(id);
};

export const updateById = async (id, category) => {
	return await CategoryModel.findByIdAndUpdate(id, category, {
		new: true,
		runValidators: true,
	});
};

export const deleteById = async (id) => {
	return await CategoryModel.findByIdAndDelete(id);
};

export const list = async () => {
	return await CategoryModel.find().sort({ createdAt: -1 });
};
