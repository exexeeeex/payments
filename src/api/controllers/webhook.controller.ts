import { CustomRequest } from "../../common/types/express";
import { WebhookService } from "../../domain";
import { Response } from "express";

export class WebhookController {
	constructor(private service: WebhookService) {}

	async proccess(req: CustomRequest, res: Response): Promise<void> {
		try {
			const signature = req.headers["webhook-signature"] as string;

			if (!signature) {
				res.status(401).json({ success: false, error: `Ошибка сигнатуры` });
				return;
			}

			const transactionManager = req.transactionManager;

			if (!transactionManager) {
				res
					.status(500)
					.json({ success: false, error: `Менеджер транзакции отсутствует` });
				return;
			}

			const result = await this.service.proccess(req.body, transactionManager);

			if (!result.proccessed) {
				console.error(`Вебхук не обработан:`, result.message);
			}

			res.status(200).json({ success: true });
		} catch (error: any) {
			console.error(`Ошибка обработки вебхука:`, error);
			res.status(500).json({ success: false, error: error.message });
		}
	}
}
