import { EntityManager } from "typeorm";
import { WebhookPayload } from "../../api/dtos/webhook-payload.dto";
import { WebhookEvent } from "../entities/webhook-event.entity";
import { PaymentService } from "./payment.service";

export class WebhookService {
	private paymentService: PaymentService;
	constructor(paymentService: PaymentService) {
		this.paymentService = paymentService;
	}

	async proccess(
		payload: WebhookPayload,
		manager: EntityManager,
	): Promise<{ proccessed: boolean; message?: string }> {
		const { event, type } = payload;

		const isDuplicate = await WebhookEvent.isDuplicate(event.id, type, manager);
		if (isDuplicate) return { proccessed: false, message: "Дубликат" };

		const webhook = manager.create(WebhookEvent, {
			eventId: event.id,
			eventType: type,
			payload,
			status: "processing",
		});

		await manager.save(webhook);

		try {
			switch (type) {
				case "payment.succeeded":
					if (event.status === "succeeded")
						await this.paymentService.processSuccessfulPayment(
							event.paymentId,
							manager,
						);
					break;
				case "payment.canceled":
					break;
			}

			webhook.markAsProcessed();
			await manager.save(webhook);

			return { proccessed: true };
		} catch (error: any) {
			throw error;
		}
	}
}
