import { Router } from "express";
import { WebhookController } from "../controllers";

export class WebhookRoutes {
	private router = Router();
	private webhookController: WebhookController;

	constructor(webhookController: WebhookController) {
		this.webhookController = webhookController;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post(
			`/`,
			this.webhookController.proccess.bind(this.webhookController),
		);
	}
	public getRouter(): Router {
		return this.router;
	}
}
