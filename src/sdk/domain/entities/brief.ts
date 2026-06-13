export type BriefState =
  | 'DRAFT'
  | 'INTENT_DEFINED'
  | 'TECH_SPEC_DEFINED'
  | 'IMPLEMENTING'
  | 'IMPLEMENTED'
  | 'FAILED'
  | 'ARCHIVED';

export type SectionKey =
  | 'intent'
  | 'namingConventions'
  | 'contracts'
  | 'architecture'
  | 'approach'
  | 'appendix'
  | 'designDecisions';

export interface BriefComment {
  author: { name: string };
  content: string;
  timestamp: string;
}

export interface BriefEnvelope {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  state: BriefState;
  createdAt: string;
}

export interface EditPayload {
  title?: string;
  state?: BriefState;
  sections?: Partial<Record<SectionKey, string>>;
}

export interface CommentAddPayload {
  content: string;
}

export class BriefEvent {
  constructor(
    public readonly id: string,
    public readonly briefId: string,
    public readonly type: 'edit' | 'commentAdd',
    public readonly author: { name: string },
    public readonly timestamp: string,
    public readonly payload: Record<string, any>
  ) {}
}

export class Brief {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly tenantId: string,
    public readonly title: string,
    public readonly state: BriefState,
    public readonly createdAt: string,
    public readonly sections: Record<string, string>,
    public readonly comments: BriefComment[]
  ) {}
}
