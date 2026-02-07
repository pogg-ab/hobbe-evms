export class CurrencyIdValueObject {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error(
                'Invalid Currency ID format. Expected a non-empty string with max length 50. Received: ' +
                value,
            );
        }
        this.value = value;
    }

    private isValid(value: string): boolean {
        return value && value.length <= 50 && value.length > 0;
    }

    toString(): string {
        return this.value;
    }
}