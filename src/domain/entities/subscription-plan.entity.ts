import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base';
import { IsBoolean, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { UserSubscription } from './user-subscription.entity';

@Entity('SubscriptionPlans')
export class SubscriptionPlan extends BaseEntity {
    @Column({ unique: true })
    @IsNotEmpty()
    name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    @IsNumber()
    @Min(1)
    price: number;

    @Column({ default: 'RUB' })
    currency: string;

    @Column({ default: 30 })
    @IsNumber()
    periodDays: number;

    @Column({ default: false })
    @IsBoolean()
    isActive: boolean;

    @OneToMany(() => UserSubscription, (subscription) => subscription.plan)
    subscriptions: UserSubscription[];
}
