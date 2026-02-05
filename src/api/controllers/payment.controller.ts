import { PaymentService } from "../../domain";
import { Request, Response } from "express";
import { CreatePaymentDTO } from "../dtos/create-payment.dto";

export class PaymentController {
	constructor(private service: PaymentService) {}

	async createPayment(req: Request, res: Response): Promise<void> {
		try {
			const dto: CreatePaymentDTO = req.body;
			const result = await this.service.createPayment(dto);

			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Ошибка при создании платежа",
			});
		}
	}

	async getPaymentStatus(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id as string;
			console.log(req.params);
			const payment = await this.service.getPaymentStatusById(id);

			if (!payment) {
				res.status(404).json({ error: `Платёж не найден!` });
				return;
			}
			res.json({
				success: true,
				data: {
					id: payment.id,
					status: payment.status,
					amount: payment.amount,
					currency: payment.currency,
					paidAt: payment.paidAt,
					externalPaymentId: payment.externalPaymentId,
				},
			});
		} catch (error: any) {
			res.status(500).json({ error: `Internal server error` });
		}
	}
}
