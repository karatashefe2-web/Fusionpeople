// page-flip paketi TS tip bildirimi içermez — minimum tanım eklenir.
declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, options: Record<string, unknown>)
    loadFromHTML(items: NodeListOf<Element>): void
    loadFromImages(images: string[]): void
    updateFromHtml(items: NodeListOf<Element>): void
    updateFromHTML(items: NodeListOf<Element>): void
    getPageCount(): number
    getCurrentPageIndex(): number
    getOrientation(): 'portrait' | 'landscape'
    flipNext(corner?: string): void
    flipPrev(corner?: string): void
    turnToPage(page: number): void
    turnToNextPage(): void
    turnToPrevPage(): void
    destroy(): void
  }
}
