const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

const toInteger = (value, fallback) => {
	const parsed = Number.parseInt(String(value ?? ""), 10);
	if (Number.isNaN(parsed)) {
		return fallback;
	}

	return parsed;
};

export const parsePagination = (query = {}) => {
	const page = Math.max(DEFAULT_PAGE, toInteger(query.page, DEFAULT_PAGE));
	const rawLimit = toInteger(query.limit, DEFAULT_LIMIT);
	const limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, rawLimit));

	return {
		page,
		limit,
		skip: (page - 1) * limit,
	};
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
	page,
	limit,
	total,
	pages: Math.ceil(total / limit) || 1,
});
