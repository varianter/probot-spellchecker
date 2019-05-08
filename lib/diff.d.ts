export interface DiffLine {
    text: string;
    diffLineNumber: number;
}
export interface FileDiff {
    path: string;
    addedLines: DiffLine[];
}
export declare function getDiff(diff: string): FileDiff[];
