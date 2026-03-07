export declare class HealthController {
    root(): {
        name: string;
        status: string;
        docs: string;
    };
    health(): {
        ok: boolean;
        timestamp: string;
    };
}
