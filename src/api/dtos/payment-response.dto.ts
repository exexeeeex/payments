import { IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { PaymentStatus } from '../../domain/entities/payment.entity';

export class PaymentResponseDTO {
    @IsUUID()
    paymentId: string;

    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @IsUrl()
    @IsOptional()
    confirmationUrl?: string;

    @IsOptional()
    externalPaymentId?: string;
}
