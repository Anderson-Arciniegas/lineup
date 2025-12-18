export interface ApiResponse {
    status: boolean;
    message?: string;
    code?: number;
    error?: string;
}

export interface ApiParams {
    search?: string;
    page?: number;
    limit?: number;
    order?: 'ASC' | 'DESC';
    orderBy?: string;
    category?: number;
    state?: number;
    municipality?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
}

export interface Result {
    itemCount: number;
    last: string;
    next: string;
    pageCount: string;
    totalItems: number;
}
