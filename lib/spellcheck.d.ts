export interface Mispelled {
    text: string;
    start: number;
    end: number;
}
export default function spellcheck(text: string): Array<Mispelled>;
