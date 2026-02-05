import {
	BeforeInsert,
	BeforeUpdate,
	Check,
	Column,
	Entity,
	EntityManager,
	Index,
	JoinColumn,
	ManyToOne,
} from "typeorm";
import { BaseEntity } from "./base";
import { User } from "./user.entity";
import { UserSubscription } from "./user-subscription.entity";
import { IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";
import { SubscriptionPlan } from "./subscription-plan.entity";

export enum PaymentStatus {
	PENDING = "pending",
	WAITING = "waiting",
	SUCCEEDED = "succeeded",
	CANCELED = "canceled",
	FAILED = "failed",
}

@Entity("Payments")
@Index(["userId"])
@Index(["status"])
@Index(["createdAt"])
@Index(["externalPaymentId"])
@Index(["userId", "status"])
export class Payment extends BaseEntity {
	@Column({ unique: true, nullable: true })
	externalPaymentId: string;

	@ManyToOne(() => User, (user) => user.payments, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: User;

	@Column()
	userId: string;

	@ManyToOne(() => UserSubscription, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "subscriptionId" })
	subscription: UserSubscription;

	@Column({ nullable: true })
	@IsOptional()
	subscriptionId: string;

	@ManyToOne(() => SubscriptionPlan)
	@JoinColumn({ name: "planId" })
	plan: SubscriptionPlan;

	@Column()
	planId: string;

	@Column("decimal", { precision: 10, scale: 2 })
	@IsNumber()
	@Min(1)
	@Max(1000000)
	amount: number;

	@Column({ default: "RUB" })
	currency: string;

	@Column({ nullable: true })
	description: string;

	@Column({
		type: "enum",
		enum: PaymentStatus,
		default: PaymentStatus.PENDING,
	})
	@IsEnum(PaymentStatus)
	status: PaymentStatus;

	@Column({ nullable: true })
	paymentMethod: string;

	@Column({ nullable: true })
	paidAt: Date;

	@BeforeInsert()
	@BeforeUpdate()
	validateStatusTransition(old?: PaymentStatus) {
		if (
			old === PaymentStatus.SUCCEEDED &&
			this.status !== PaymentStatus.SUCCEEDED
		)
			throw new Error("Невозможно изменить статус успешного платежа!");
	}

	static async findByIdWithLock(
		id: string,
		manager: EntityManager,
		lockMode: "pessimistic_read" | "pessimistic_write" = "pessimistic_write",
	): Promise<Payment | null> {
		return manager
			.createQueryBuilder(Payment, "payment")
			.setLock(lockMode)
			.where("payment.id = :id", { id })
			.getOne();
	}

	markAsSucceeded(paidAt: Date = new Date()): void {
		this.status = PaymentStatus.SUCCEEDED;
		this.paidAt = paidAt;
		this.updatedAt = new Date();
	}
}
