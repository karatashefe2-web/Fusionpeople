// page-flip paketi TS tip bildirimi içermez — minimum tanım eklenir.
declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, options: Record<string, unknown>)
    loadFromHTML(items: NodeListOf<Element>): void
    loadFromImages(images: string[]): void
    getPageCount(): number
  }
}
