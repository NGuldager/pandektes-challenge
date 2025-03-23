import {
  Publication as PublicationEntity,
  Document as DocumentEntity,
  Link as LinkEntity,
} from '@prisma/client';

export type CategoryCount = {
  category: string;
  count: number;
};

export type Document = Pick<DocumentEntity, 'file' | 'title'>;

export type Link = Pick<LinkEntity, 'title' | 'url'>;

export type Publication = Omit<
  PublicationEntity,
  'published_date' | 'date' | 'createdAt' | 'updatedAt'
> & {
  published_date: string;
  date: string;
  attachments: Document[] | null;
  documents: Document[] | null;
  links: Link[] | null;
};

export type SearchResponse = {
  totalCount: number;
  elapsedMilliseconds: number;
  categoryCounts: CategoryCount[];
  publications: Publication[];
};
