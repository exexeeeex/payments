import { EntityManager } from "typeorm";
import { PaymentIssue } from "../entities/payment-issue.entity";

export class PaymentIssueService {
	constructor() {}

	async createIssue(
		paymentId: string | null,
		issueType: string,
		manager: EntityManager,
	): Promise<void> {
		const issue = manager.create(PaymentIssue, {
			paymentId,
			issueType,
			resolved: false,
		});

		await manager.save(issue);
	}
}
