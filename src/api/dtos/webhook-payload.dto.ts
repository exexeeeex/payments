import {
	IsEnum,
	IsNotEmpty,
	IsObject,
	IsString,
	IsUUID,
} from "class-validator";
import { PaymentStatus } from "../../domain/entities/payment.entity";

class Amount {
	@IsString()
	@IsNotEmpty()
	value: string;

	@IsString()
	currency: string;
}

class Event {
	@IsString()
	id: string;

	@IsString()
	@IsNotEmpty()
	type: string;

	@IsString()
	paymentId: string;

	@IsEnum(PaymentStatus)
	status: PaymentStatus;

	@IsObject()
	amount: Amount;
}

export class WebhookPayload {
	@IsString()
	type: string;

	@IsObject()
	event: Event;
}
