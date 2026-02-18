import ProductModel from "./products.model.js";

// Create Product
export const create = async (product) => {
	return await ProductModel.create(product);
};

// Find Product By ID
export const findById = async (id) => {
	return await ProductModel.findById(id)
		.populate("seller_id", "name email")
		.populate("category_id", "name slug");
};

// Update Product By ID
export const updateById = async (id, product) => {
	return await ProductModel.findByIdAndUpdate(id, product, {
		new: true,
		runValidators: true,
	})
		.populate("seller_id", "name email")
		.populate("category_id", "name slug");
};

// Delete Product By ID
export const deleteById = async (id) => {
	return await ProductModel.findByIdAndDelete(id);
};

// List Products with Filters
export const listWithFilters = async (filters = {}) => {
	const {
		category_id,
		min_price,
		max_price,
		search,
		is_active,
		page = 1,
		limit = 10,
	} = filters;

	const query = {};

	if (category_id) query.category_id = category_id;
	if (is_active !== undefined) query.is_active = is_active;
	if (min_price || max_price) {
		query.price = {};
		if (min_price) query.price.$gte = parseFloat(min_price);
		if (max_price) query.price.$lte = parseFloat(max_price);
	}
	if (search) {
		query.$or = [
			{ title: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	const skip = (page - 1) * limit;

	const [products, total] = await Promise.all([
		ProductModel.find(query)
			.populate("seller_id", "name email")
			.populate("category_id", "name slug")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit)),
		ProductModel.countDocuments(query),
	]);

	return {
		products,
		pagination: {
			page: parseInt(page),
			limit: parseInt(limit),
			total,
			pages: Math.ceil(total / limit),
		},
	};
};

// Append Images to Product
export const appendImages = async (id, images) => {
	return await ProductModel.findByIdAndUpdate(
		id,
		{ $push: { images: { $each: images } } },
		{ new: true, runValidators: true }
	);
};
