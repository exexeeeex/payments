import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { IsDate, IsEnum } from 'class-validator';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    PENDING_PAYMENT = 'pending_payment',
}

@Entity('UserSubscriptions')
@Index(['userId'])
@Index(['status'])
@Index(['currentPeriodEnd'])
@Index(['userId', 'status'])
export class UserSubscription extends BaseEntity {
    @ManyToOne(() => User, (user) => user.subscriptions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => SubscriptionPlan)
    @JoinColumn({ name: 'planId' })
    plan: SubscriptionPlan;

    @Column()
    planId: string;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    })
    @IsEnum(SubscriptionStatus)
    status: SubscriptionStatus;

    @Column()
    @IsDate()
    currentPeriodStart: Date;

    @Column()
    @IsDate()
    currentPeriodEnd: Date;

    @Column({ default: false })
    cancelPeriodEnd: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    validateDates() {
        if (this.currentPeriodEnd <= this.currentPeriodStart)
            throw new Error('Дата окончания не может быть раньше даты старта');
    }

    isActive(): boolean {
        return (
            this.status === SubscriptionStatus.ACTIVE &&
            this.currentPeriodEnd > new Date()
        );
    }
}
