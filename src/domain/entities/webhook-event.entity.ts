import {
    Column,
    Entity,
    EntityManager,
    Index,
    JoinColumn,
    ManyToOne,
    Unique,
} from 'typeorm';
import { BaseEntity } from './base';
import { Payment } from './payment.entity';

@Entity('WebhookEvents')
@Unique(['eventId', 'eventType'])
@Index(['eventId'])
@Index(['createdAt'])
export class WebhookEvent extends BaseEntity {
    @Column()
    eventId: string;

    @Column()
    eventType: string;

    @ManyToOne(() => Payment, { nullable: true })
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @Column({ nullable: true })
    paymentId: string;

    @Column('jsonb')
    payload: Record<string, any>;

    @Column({ default: 'processed' })
    status: string;

    @Column({ name: 'processedAt', default: () => 'CURRENT_TIMESTAMP' })
    processedAt: Date;

    static async isDuplicate(
        eventId: string,
        eventType: string,
        manager: EntityManager,
    ): Promise<boolean> {
        const existing = await manager.findOne(WebhookEvent, {
            where: { eventId, eventType },
        });
        return !!existing;
    }

    markAsProcessed(): void {
        this.status = 'processed';
        this.processedAt = new Date();
    }

    markAsError(): void {
        this.status = 'error';
        this.processedAt = new Date();
    }
}
