import { MigrationInterface, QueryRunner } from "typeorm";

export class Payments1770124459747 implements MigrationInterface {
	name = "Payments1770124459747";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "SubscriptionPlans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'RUB', "periodDays" integer NOT NULL DEFAULT '30', "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_f2f36e7567b3599bd917bd24cbb" UNIQUE ("name"), CONSTRAINT "PK_0edc081dd24ab1b1eae18426c90" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."UserSubscriptions_status_enum" AS ENUM('active', 'canceled', 'expired', 'pending_payment')`,
		);
		await queryRunner.query(
			`CREATE TABLE "UserSubscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "status" "public"."UserSubscriptions_status_enum" NOT NULL DEFAULT 'active', "currentPeriodStart" TIMESTAMP NOT NULL, "currentPeriodEnd" TIMESTAMP NOT NULL, "cancelPeriodEnd" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_56cefb632fb2c3e9e691137ae8f" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_43af8b18cb9d5d61baeacdefb9" ON "UserSubscriptions" ("userId", "status") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_8376172480689541fff157ab4b" ON "UserSubscriptions" ("currentPeriodEnd") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_4c94a1431649931dc8d7a4fe9c" ON "UserSubscriptions" ("status") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_d591f708b32c7e119e868be2a2" ON "UserSubscriptions" ("userId") `,
		);
		await queryRunner.query(
			`CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."Payments_status_enum" AS ENUM('pending', 'waiting', 'succeeded', 'canceled', 'failed')`,
		);
		await queryRunner.query(
			`CREATE TABLE "Payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "externalPaymentId" character varying, "userId" uuid NOT NULL, "subscriptionId" uuid, "planId" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'RUB', "description" character varying, "status" "public"."Payments_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" character varying, "paidAt" TIMESTAMP, CONSTRAINT "UQ_ab5dcc0661e7a51597d9bfc980c" UNIQUE ("externalPaymentId"), CONSTRAINT "PK_50c3077812277d7b8c68c54d61a" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_f634c8227e1912f84ae17ac24d" ON "Payments" ("userId", "status") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_ab5dcc0661e7a51597d9bfc980" ON "Payments" ("externalPaymentId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a50bdf54cd1db9b03cc3c960e3" ON "Payments" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_72f2238189273498f6393b5da2" ON "Payments" ("status") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_61e80a03a53cf7b8a01aed5645" ON "Payments" ("userId") `,
		);
		await queryRunner.query(
			`CREATE TABLE "WebhookEvents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "eventId" character varying NOT NULL, "eventType" character varying NOT NULL, "paymentId" uuid, "payload" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'processed', "processedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_113b69faa4c04af9628c2c05616" UNIQUE ("eventId", "eventType"), CONSTRAINT "PK_00198414a49a06a3b55bbba9a49" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a43da5dd507414d5b6955bb460" ON "WebhookEvents" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_4afb769514c083c5dcd100eca7" ON "WebhookEvents" ("eventId") `,
		);
		await queryRunner.query(
			`CREATE TABLE "PaymentIssues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentId" uuid, "issueType" character varying NOT NULL, "resolved" boolean NOT NULL DEFAULT false, "resolvedAt" TIMESTAMP, CONSTRAINT "PK_b24f30798232b7ead74dd2efe3d" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_642f74e5df257dddf6388eac31" ON "PaymentIssues" ("resolved") `,
		);
		await queryRunner.query(
			`ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "FK_d591f708b32c7e119e868be2a23" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "FK_e949a79bc36510aa1bccc812c05" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_61e80a03a53cf7b8a01aed56451" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_b6f9b94e58c2dd15c42d5cd43ed" FOREIGN KEY ("subscriptionId") REFERENCES "UserSubscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" ADD CONSTRAINT "FK_59338574cefeb5a8c78316d2e65" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "WebhookEvents" ADD CONSTRAINT "FK_ea416e129b664fcfab00cbe3655" FOREIGN KEY ("paymentId") REFERENCES "Payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "PaymentIssues" ADD CONSTRAINT "FK_6feebed2f7fba2f8c913884ee1c" FOREIGN KEY ("paymentId") REFERENCES "Payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "PaymentIssues" DROP CONSTRAINT "FK_6feebed2f7fba2f8c913884ee1c"`,
		);
		await queryRunner.query(
			`ALTER TABLE "WebhookEvents" DROP CONSTRAINT "FK_ea416e129b664fcfab00cbe3655"`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_59338574cefeb5a8c78316d2e65"`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_b6f9b94e58c2dd15c42d5cd43ed"`,
		);
		await queryRunner.query(
			`ALTER TABLE "Payments" DROP CONSTRAINT "FK_61e80a03a53cf7b8a01aed56451"`,
		);
		await queryRunner.query(
			`ALTER TABLE "UserSubscriptions" DROP CONSTRAINT "FK_e949a79bc36510aa1bccc812c05"`,
		);
		await queryRunner.query(
			`ALTER TABLE "UserSubscriptions" DROP CONSTRAINT "FK_d591f708b32c7e119e868be2a23"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_642f74e5df257dddf6388eac31"`,
		);
		await queryRunner.query(`DROP TABLE "PaymentIssues"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_4afb769514c083c5dcd100eca7"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a43da5dd507414d5b6955bb460"`,
		);
		await queryRunner.query(`DROP TABLE "WebhookEvents"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_61e80a03a53cf7b8a01aed5645"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_72f2238189273498f6393b5da2"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a50bdf54cd1db9b03cc3c960e3"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_ab5dcc0661e7a51597d9bfc980"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_f634c8227e1912f84ae17ac24d"`,
		);
		await queryRunner.query(`DROP TABLE "Payments"`);
		await queryRunner.query(`DROP TYPE "public"."Payments_status_enum"`);
		await queryRunner.query(`DROP TABLE "Users"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_d591f708b32c7e119e868be2a2"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_4c94a1431649931dc8d7a4fe9c"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_8376172480689541fff157ab4b"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_43af8b18cb9d5d61baeacdefb9"`,
		);
		await queryRunner.query(`DROP TABLE "UserSubscriptions"`);
		await queryRunner.query(
			`DROP TYPE "public"."UserSubscriptions_status_enum"`,
		);
		await queryRunner.query(`DROP TABLE "SubscriptionPlans"`);
	}
}
