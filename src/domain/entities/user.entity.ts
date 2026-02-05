import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserSubscription } from './user-subscription.entity';
import { Payment } from './payment.entity';

@Entity('Users')
export class User extends BaseEntity {
    @Column({ unique: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @OneToMany(() => UserSubscription, (subscription) => subscription.user)
    subscriptions: UserSubscription[];

    @OneToMany(() => Payment, (payment) => payment.user)
    payments: Payment[];

    @BeforeInsert()
    @BeforeUpdate()
    validateEmail() {
        const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!regex.test(this.email)) throw new Error('Email not valid');
    }
}
