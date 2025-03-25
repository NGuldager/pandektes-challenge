export const WEB_SCRAPER_QUEUE_NAME = 'web-scraper';

export type WebScrapeJob = {
  id: string;
};

export type ScrapedPublication = {
  id: string;
  url: string;
  title: string;
  abstract?: string;
  date?: string;
};
