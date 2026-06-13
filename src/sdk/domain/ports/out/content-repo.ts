import { Content, ContentVersion } from '@/sdk/domain/entities';

/**
 * Interface for making HTTP requests to content API
 */
export interface PublishContentParams {
  contentId?: string;
  siteId: string;
  name: string;
  key: string;
  body: string;
  locale: string;
}

export interface ContentRepo {
  list(siteId: string): Promise<Content[]>;
  get(contentId: string, locale: string): Promise<{
    id: string;
    siteId: string;
    name: string;
    key: string;
    state: string;
    locale: string;
    availableLocales: string[];
    latestVersion: object | null;
  }>;
  pushContent(content: Content, contentVersion: ContentVersion): Promise<Content>;
  publishContent(params: PublishContentParams): Promise<{ id: string }>;
}
