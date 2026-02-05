import { SubscriptionPlan } from "../entities/subscription-plan.entity";
import { AppDataSource } from "../../common/config";

export class SubscriptionPlanService {
	constructor() {}

	async findPlanById(id: string): Promise<SubscriptionPlan | null> {
		const manager = AppDataSource.manager;
		return await manager.findOne(SubscriptionPlan, {
			where: { id, isActive: true },
		});
	}
}
