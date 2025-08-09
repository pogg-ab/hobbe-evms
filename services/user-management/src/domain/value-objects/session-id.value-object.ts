import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class SessionID {
    private readonly value: string;

    constructor(value?: string) {
        if (value) {
            if (!this.isValid(value)) {
                throw new Error(`Invalid UUID format: ${value}`);
            }
            this.value = value;
        } else {
            this.value = uuidv4();
        }
    }

    private isValid(value: string): boolean {
        return uuidValidate(value);
    }

    toString(): string {
        return this.value;
    }

    equals(other: SessionID): boolean {
        return this.value === other.toString();
    }
}