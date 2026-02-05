import crypto from 'crypto';

export class Security {
    static validateWebhookSignature(
        payload: any,
        signature: string,
        secret: string,
    ): boolean {
        const computed = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return computed === signature;
    }

    static encrypt(data: string, key: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            Buffer.from(key, 'hex'),
            iv,
        );
        let encrypted = cipher.update(data, 'utf8', 'hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }

    static decrypt(data: string, key: string): string {
        const [ivHex, encrypted, tagHex] = data.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(key, 'hex'),
            iv,
        );
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
        let dcrypted = decipher.update(encrypted, 'hex', 'utf8');
        dcrypted += decipher.final('utf8');
        return dcrypted;
    }
}
