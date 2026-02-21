import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./content.service.js";

export const createContent = async (req, res) => {
	const content = await service.createContent(req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: content,
		message: "Content created successfully",
	});
};

export const listContent = async (req, res) => {
	const content = await service.listContent(req.query);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: content,
		message: "Content retrieved successfully",
	});
};

export const getContentById = async (req, res) => {
	const content = await service.getContentById(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: content,
		message: "Content retrieved successfully",
	});
};

export const updateContent = async (req, res) => {
	const content = await service.updateContent(req.params.id, req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: content,
		message: "Content updated successfully",
	});
};

export const deleteContent = async (req, res) => {
	const content = await service.deleteContent(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: content,
		message: "Content deleted successfully",
	});
};
