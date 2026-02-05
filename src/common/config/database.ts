import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import path from 'path';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentIssue } from '../../domain/entities/payment-issue.entity';
import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { User } from '../../domain/entities/user.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';

const env = process.env.NODE_ENV || 'development';

dotenv.config();
dotenv.config({ path: `.env.${env}` });

const rootDir =
    process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..')
        : path.join(__dirname, '..', '..');

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'payments',
    synchronize: false,

    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],

    migrationsRun: false,
    migrationsTableName: 'typeorm_migrations',

    poolSize: 20,
    extra: {
        connectionTimeoutMillis: 5000,
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 30000,
    },
});
