export interface Page<T> {
    data: T[];
    total: number;
}

export interface SingleResult<T> {
    data: T;
}
