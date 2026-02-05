import { EntityManager } from "typeorm";
import {
	SubscriptionStatus,
	UserSubscription,
} from "../entities/user-subscription.entity";
import { SubscriptionPlanService } from "./subscription-plan.service";

export class UserSubscriptionService {
	private subscriptionPlanService: SubscriptionPlanService;
	constructor(subscriptionPlanService: SubscriptionPlanService) {
		this.subscriptionPlanService = subscriptionPlanService;
	}

	async activate(
		userId: string,
		planId: string,
		manager: EntityManager,
	): Promise<void> {
		let subscription = await manager.findOne(UserSubscription, {
			where: { userId, status: SubscriptionStatus.ACTIVE },
		});

		const plan = await this.subscriptionPlanService.findPlanById(planId);
		if (!plan) throw new Error(`План не найден!`);

		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setDate(periodEnd.getDate() + plan.periodDays);

		if (subscription) {
			subscription.planId = planId;
			subscription.currentPeriodStart = now;
			subscription.currentPeriodEnd = periodEnd;
			subscription.cancelPeriodEnd = false;
		} else {
			subscription = manager.create(UserSubscription, {
				userId,
				planId,
				status: SubscriptionStatus.ACTIVE,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
			});
		}

		await manager.save(subscription);
	}
}
