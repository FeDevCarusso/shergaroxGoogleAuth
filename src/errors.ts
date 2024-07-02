export class ShergaroxGAError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ShergaroxGAError';
    }
}
