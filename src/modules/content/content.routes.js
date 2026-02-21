import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./content.controller.js";
import {
	contentCreateSchema,
	contentIdSchema,
	contentListQuerySchema,
	contentUpdateSchema,
} from "./content.validation.js";

const contentRouter = Router();

contentRouter.get(
	"/",
	validate({ query: contentListQuerySchema }),
	controller.listContent
);

contentRouter.get(
	"/:id",
	validate({ params: contentIdSchema }),
	controller.getContentById
);

contentRouter.post(
	"/",
	requireAuth,
	requireRole("admin"),
	validate({ body: contentCreateSchema }),
	controller.createContent
);

contentRouter.put(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: contentIdSchema, body: contentUpdateSchema }),
	controller.updateContent
);

contentRouter.delete(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validate({ params: contentIdSchema }),
	controller.deleteContent
);

export default contentRouter;
