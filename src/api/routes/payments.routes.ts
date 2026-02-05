import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

export class PaymentRoutes {
	private router = Router();
	private paymentController: PaymentController;

	constructor(paymentController: PaymentController) {
		this.paymentController = paymentController;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post(
			`/payments/create`,
			this.paymentController.createPayment.bind(this.paymentController),
		);

		this.router.get(
			"/payments/get-status/:id",
			this.paymentController.getPaymentStatus.bind(this.paymentController),
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
