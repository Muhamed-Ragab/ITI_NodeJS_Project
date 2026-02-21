import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as couponsController from "../../../src/modules/coupons/coupons.controller.js";
import * as couponsService from "../../../src/modules/coupons/coupons.service.js";
import { sendSuccess } from "../../../src/utils/response.js";

vi.mock("../../../src/modules/coupons/coupons.service.js");
vi.mock("../../../src/utils/response.js", () => ({
	sendSuccess: vi.fn(),
}));

describe("Coupons Controller", () => {
	let req;
	let res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			params: {},
			query: {},
			body: {},
			user: { id: "u1", role: "admin" },
		};
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
	});

	it("creates coupon", async () => {
		const coupon = { _id: "c1", code: "SAVE10" };
		req.body = { code: "SAVE10", type: "percentage", value: 10 };
		couponsService.createCoupon.mockResolvedValue(coupon);

		await couponsController.createCoupon(req, res);

		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({
				statusCode: StatusCodes.CREATED,
				data: coupon,
			})
		);
	});

	it("validates coupon for order preview", async () => {
		couponsService.validateCouponForOrder.mockResolvedValue({
			couponInfo: { code: "SAVE10" },
			discountAmount: 10,
		});
		req.body = { code: "SAVE10", subtotal_amount: 100 };

		await couponsController.validateCoupon(req, res);

		expect(couponsService.validateCouponForOrder).toHaveBeenCalledWith({
			code: "SAVE10",
			userId: "u1",
			subtotalAmount: 100,
		});
		expect(sendSuccess).toHaveBeenCalledWith(
			res,
			expect.objectContaining({ statusCode: StatusCodes.OK })
		);
	});
});
