import { Router } from "express";

import {
	PaymentService,
	UserSubscriptionService,
	SubscriptionPlanService,
	PaymentIssueService,
	WebhookService,
} from "../../domain/services";

const subscriptionPlanService = new SubscriptionPlanService();

const userSubscriptionService = new UserSubscriptionService(
	subscriptionPlanService,
);

const paymentIssueService = new PaymentIssueService();

const paymentService = new PaymentService(
	userSubscriptionService,
	subscriptionPlanService,
	paymentIssueService,
);

const webhookService = new WebhookService(paymentService);

import { PaymentController } from "../controllers/payment.controller";
import { PaymentRoutes } from "./payments.routes";
import { WebhookController } from "../controllers";
import { WebhookRoutes } from "./webhook.routes";

const paymentController = new PaymentController(paymentService);
const webhookController = new WebhookController(webhookService);

const paymentRoutes = new PaymentRoutes(paymentController);
const webhookRoutes = new WebhookRoutes(webhookController);

const router = Router();

router.use("/api", paymentRoutes.getRouter());
router.use("/api/webhook/", webhookRoutes.getRouter());

export { router };
