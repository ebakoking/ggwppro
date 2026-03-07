import { ReportService } from './report.service';
export declare class ReportController {
    private reportService;
    constructor(reportService: ReportService);
    create(req: any, body: {
        reportedId: string;
        reason: string;
        details?: string;
        matchId?: string;
        messageId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        messageId: string | null;
        matchId: string | null;
        reason: string;
        details: string | null;
        status: string;
        reporterId: string;
        reportedId: string;
    }>;
}
