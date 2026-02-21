import { ApiError } from "../../utils/errors/api-error.js";
import * as repo from "./content.repository.js";

export const createContent = async (payload) => {
	const existing = await repo.findBySlug(payload.slug);
	if (existing) {
		throw ApiError.badRequest({
			code: "CONTENT.SLUG_EXISTS",
			message: "Content slug already exists",
			details: { slug: payload.slug },
		});
	}

	return await repo.create(payload);
};

export const listContent = async (query = {}) => {
	const filters = {};

	if (query.section) {
		filters.section = query.section;
	}

	if (query.is_active === "true") {
		filters.is_active = true;
	}

	if (query.is_active === "false") {
		filters.is_active = false;
	}

	return await repo.list(filters);
};

export const getContentById = async (id) => {
	const content = await repo.findById(id);
	if (!content) {
		throw ApiError.notFound({
			code: "CONTENT.NOT_FOUND",
			message: "Content not found",
			details: { id: String(id) },
		});
	}

	return content;
};

export const updateContent = async (id, payload) => {
	if (payload.slug) {
		const existing = await repo.findBySlug(payload.slug);
		if (existing && String(existing._id) !== String(id)) {
			throw ApiError.badRequest({
				code: "CONTENT.SLUG_EXISTS",
				message: "Content slug already exists",
				details: { slug: payload.slug },
			});
		}
	}

	const updated = await repo.updateById(id, payload);
	if (!updated) {
		throw ApiError.notFound({
			code: "CONTENT.NOT_FOUND",
			message: "Content not found",
			details: { id: String(id) },
		});
	}

	return updated;
};

export const deleteContent = async (id) => {
	const deleted = await repo.deleteById(id);
	if (!deleted) {
		throw ApiError.notFound({
			code: "CONTENT.NOT_FOUND",
			message: "Content not found",
			details: { id: String(id) },
		});
	}

	return deleted;
};
