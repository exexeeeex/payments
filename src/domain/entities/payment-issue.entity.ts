import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base";
import { Payment } from "./payment.entity";

@Entity("PaymentIssues")
@Index(["resolved"])
export class PaymentIssue extends BaseEntity {
	@ManyToOne(() => Payment, { nullable: true })
	@JoinColumn({ name: "paymentId" })
	payment: Payment;

	@Column({ nullable: true })
	paymentId: string | null;

	@Column()
	issueType: string;

	@Column({ default: false })
	resolved: boolean;

	@Column({ nullable: true })
	resolvedAt: Date;

	makeAsResolved(): void {
		this.resolved = true;
		this.resolvedAt = new Date();
	}
}
