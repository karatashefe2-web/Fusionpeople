// İçerik API'sinden dönen veri yapısı ve varsayılan değerler

export interface MagazinePage {
  id: number
  name: string
  link: string
  gosterimLink?: string
}

export interface SiteTexts {
  seoTitle: string
  seoDescription: string
  siteTitle: string
  issueDate: string
  mainHeadline: string
  editorTitle: string
  editorText: string
  btnMagazine: string
  btnVideo: string
  goBack: string
  magazineTopTitle: string
  emptyMagazine: string
  emptyVideo: string
}

export interface SiteContent {
  dergi: MagazinePage[]
  belgesel: string
  landing: string
  landingVideo: string
  yuklemeTipi: 'single' | 'pdf'
  pdf: string
  siteMetinleri: SiteTexts | null
}

export const DEFAULT_TEXTS: SiteTexts = {
  seoTitle: 'FUSION PEOPLE',
  seoDescription:
    'FUSION PEOPLE — a cinematic digital magazine exploring digital culture, design and the modern age.',
  siteTitle: 'FUSION PEOPLE',
  issueDate: 'ISSUE 01 — 2026',
  mainHeadline: 'DIGITAL<br/>CULTURE.',
  editorTitle: "EDITOR'S NOTE",
  editorText:
    'In the chaos of the modern age, we rediscover the power of simplicity. Aesthetics and functionality combined.',
  btnMagazine: 'READ ISSUE',
  btnVideo: 'WATCH',
  goBack: '← Go Back',
  magazineTopTitle: 'ISSUE 01',
  emptyMagazine: 'No pages added from the admin panel.',
  emptyVideo: 'Content not loaded.'
}

export const EMPTY_CONTENT: SiteContent = {
  dergi: [],
  belgesel: '',
  landing: '',
  landingVideo: '',
  yuklemeTipi: 'single',
  pdf: '',
  siteMetinleri: null
}
