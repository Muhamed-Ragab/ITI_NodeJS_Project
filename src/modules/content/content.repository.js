import Content from "./content.model.js";

export const create = async (payload) => {
	return await Content.create(payload);
};

export const findById = async (id) => {
	return await Content.findById(id);
};

export const findBySlug = async (slug) => {
	return await Content.findOne({ slug });
};

export const list = async (filters = {}) => {
	const query = {};

	if (filters.section) {
		query.section = filters.section;
	}

	if (typeof filters.is_active === "boolean") {
		query.is_active = filters.is_active;
	}

	return await Content.find(query).sort({ createdAt: -1 });
};

export const updateById = async (id, payload) => {
	return await Content.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	});
};

export const deleteById = async (id) => {
	return await Content.findByIdAndDelete(id);
};
