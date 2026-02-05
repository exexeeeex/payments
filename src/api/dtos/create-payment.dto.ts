import {
    IsUUID,
    IsNotEmpty,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsUrl,
} from 'class-validator';

export class CreatePaymentDTO {
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsNotEmpty()
    planId: string;

    @IsNumber()
    @Min(1)
    @Max(1000000)
    amount: number;

    @IsOptional()
    currency?: string;

    @IsOptional()
    description?: string;

    @IsUrl({ protocols: ['https'], require_protocol: true })
    returnUrl: string;

    @IsOptional()
    @IsUUID()
    subscriptionId: string;
}
