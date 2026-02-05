import { randomUUID } from "node:crypto";
import { CreatePaymentDTO } from "../../api/dtos/create-payment.dto";
import { PaymentResponseDTO } from "../../api/dtos/payment-response.dto";
import { Payment, PaymentStatus } from "../entities/payment.entity";
import { EntityManager } from "typeorm";
import { AppDataSource } from "../../common/config";
import { UserSubscriptionService } from "./user-subscription.service";
import { SubscriptionPlanService } from "./subscription-plan.service";
import { PaymentIssueService } from "./payment-issue.service";

export class PaymentService {
	private userSubscriptionService: UserSubscriptionService;
	private subscriptionPlanService: SubscriptionPlanService;
	private paymentIssueService: PaymentIssueService;

	constructor(
		userSubscriptionService: UserSubscriptionService,
		subscriptionPlanService: SubscriptionPlanService,
		paymentIssueService: PaymentIssueService,
	) {
		this.userSubscriptionService = userSubscriptionService;
		this.subscriptionPlanService = subscriptionPlanService;
		this.paymentIssueService = paymentIssueService;
	}

	async createPayment(data: CreatePaymentDTO): Promise<PaymentResponseDTO> {
		console.log(`plan: ${data.planId}`);
		try {
			await this.validatePaymentData(data);

			const manager = AppDataSource.manager;
			const payment = manager.create(Payment, {
				userId: data.userId,
				planId: data.planId,
				subscriptionId: data.subscriptionId,
				amount: data.amount,
				currency: data.currency || "RUB",
				description: data.description,
				status: PaymentStatus.PENDING,
			});

			await manager.save(payment);

			const response = this.callPaymentProvider(payment, data.returnUrl);
			payment.externalPaymentId = response.externalPaymentId!;
			await manager.save(payment);

			return response;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async processSuccessfulPayment(
		externalPaymentId: string,
		manager: EntityManager,
	): Promise<void> {
		const payment = await manager.findOne(Payment, {
			where: { externalPaymentId },
			lock: { mode: "pessimistic_write" },
		});

		if (!payment) {
			console.error(`Payment not found processing!`);
			await this.paymentIssueService.createIssue(null, "not_found", manager);
			throw new Error(`Платёж с ${externalPaymentId} не найден!`);
		}

		if (payment.status === PaymentStatus.SUCCEEDED) return;

		payment.markAsSucceeded();
		await manager.save(payment);

		await this.userSubscriptionService.activate(
			payment.userId,
			payment.planId,
			manager,
		);
	}

	private callPaymentProvider(
		payment: Payment,
		returnUrl: string,
	): PaymentResponseDTO {
		const external = `pay_${Math.random().toString(36)}`;

		return {
			paymentId: payment.id,
			status: PaymentStatus.PENDING,
			confirmationUrl: `${returnUrl}?id=${external}`,
			externalPaymentId: external,
		};
	}

	async validatePaymentData(data: CreatePaymentDTO): Promise<void> {
		const plan = await this.subscriptionPlanService.findPlanById(data.planId);

		if (!plan) throw new Error(`План не найден или неактивен`);

		if (Math.abs(plan.price - data.amount) > 0.01)
			throw new Error(`Несоответствие суммы`);
	}

	async findPaymentByExternalId(externalId: string): Promise<Payment | null> {
		const manager = AppDataSource.manager;
		return await manager.findOne(Payment, {
			where: { externalPaymentId: externalId },
		});
	}

	async getPaymentStatusById(id: string): Promise<Payment | null> {
		const manager = AppDataSource.manager;
		return await manager.findOne(Payment, {
			where: { id },
		});
	}
}
