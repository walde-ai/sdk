import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { Brief, SectionKey } from '@/sdk/domain/entities/brief';
import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';
import { BriefEventsFuture } from './brief-events-future';
import { WaldeConfigurationError } from '@/sdk/domain/errors';

export class BriefFuture extends Future<Brief, WaldeAdmin> {
  private briefId?: string;
  private operation: 'create' | 'setSections' | 'implement' | 'markImplemented' | 'fail' | 'archive' | 'addComment' | 'appendEvent' | null = null;
  private operationParams: Record<string, any> = {};

  constructor({ parent, briefRepo, briefId }: { parent: WaldeAdmin; briefRepo: BriefRepository; briefId?: string }) {
    super({ parent });
    this.briefRepo = briefRepo;
    this.briefId = briefId;
  }

  private briefRepo: BriefRepository;

  /**
   * Create a new brief with initial content.
   * 
   * Note: The author parameter defaults to 'user' as specified in the Brief spec.
   * This is a deliberate design decision to simplify CLI usage where the author
   * is typically not provided explicitly.
   * 
   * @param opts - Creation options including projectId, title, intent, and optional author
   * @returns Future that resolves to the created Brief
   */
  create(opts: { projectId: string; title: string; intent: string; author?: string }): BriefFuture {
    if (!opts.title || opts.title.trim() === '') {
      throw new WaldeConfigurationError('title is required and must be non-empty');
    }
    if (!opts.intent || opts.intent.trim() === '') {
      throw new WaldeConfigurationError('intent is required and must be non-empty');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo });
    future.operation = 'create';
    future.operationParams = {
      projectId: opts.projectId,
      title: opts.title,
      intent: opts.intent,
      author: opts.author ?? 'user',
    };
    return future;
  }

  setSections(sections: Partial<Record<SectionKey, string>>, opts?: { author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for setSections operation');
    }

    const keys = Object.keys(sections);
    if (keys.length === 0) {
      throw new WaldeConfigurationError('At least one section must be provided');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'setSections';
    future.operationParams = {
      sections,
      author: opts?.author ?? 'user',
    };
    return future;
  }

  implement(opts?: { author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for implement operation');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'implement';
    future.operationParams = {
      author: opts?.author ?? 'user',
    };
    return future;
  }

  markImplemented(opts?: { author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for markImplemented operation');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'markImplemented';
    future.operationParams = {
      author: opts?.author ?? 'user',
    };
    return future;
  }

  fail(opts?: { reason?: string; author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for fail operation');
    }

    if (opts?.reason !== undefined && opts.reason.trim() === '') {
      throw new WaldeConfigurationError('reason must be a non-empty string if provided');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'fail';
    future.operationParams = {
      reason: opts?.reason,
      author: opts?.author ?? 'user',
    };
    return future;
  }

  archive(opts?: { author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for archive operation');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'archive';
    future.operationParams = {
      author: opts?.author ?? 'user',
    };
    return future;
  }

  addComment(opts: { content: string; author?: string }): BriefFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for addComment operation');
    }

    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
    future.operation = 'addComment';
    future.operationParams = {
      content: opts.content,
      author: opts.author ?? 'user',
    };
    return future;
  }

  events(): BriefEventsFuture {
    if (!this.briefId) {
      throw new WaldeConfigurationError('Brief ID required for events operation');
    }
    return new BriefEventsFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: this.briefId });
  }

  /**
   * Raw event-append escape hatch. Posts the given event verbatim to the API. The `briefId`
   * defaults to the BriefFuture's bound id when omitted; for creation events, leave it unset
   * and provide `projectId` in the params.
   */
  appendEvent(params: {
    type: 'edit' | 'commentAdd';
    payload: Record<string, unknown>;
    projectId?: string;
    author?: { name: string };
    briefId?: string;
  }): BriefFuture {
    const future = new BriefFuture({ parent: this.parent, briefRepo: this.briefRepo, briefId: params.briefId ?? this.briefId });
    future.operation = 'appendEvent';
    future.operationParams = {
      type: params.type,
      payload: params.payload,
      projectId: params.projectId,
      author: params.author ?? { name: 'user' },
      briefId: params.briefId ?? this.briefId,
    };
    return future;
  }

  async resolve(): Promise<Result<Brief, string>> {
    if (!this.operation) {
      if (!this.briefId) {
        return err('No operation specified and no briefId provided');
      }
      try {
        const brief = await this.briefRepo.getById(this.briefId);
        return ok(brief);
      } catch (e: unknown) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }

    switch (this.operation) {
      case 'create': {
        try {
          const brief = await this.briefRepo.appendEvent({
            projectId: this.operationParams.projectId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              title: this.operationParams.title,
              state: 'INTENT_DEFINED',
              sections: {
                intent: this.operationParams.intent,
              },
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'setSections': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              sections: this.operationParams.sections,
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'implement': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              state: 'IMPLEMENTING',
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'markImplemented': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              state: 'IMPLEMENTED',
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'fail': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              state: 'FAILED',
            },
          });

          if (this.operationParams.reason) {
            try {
              const briefWithComment = await this.briefRepo.appendEvent({
                briefId: this.briefId,
                type: 'commentAdd',
                author: { name: this.operationParams.author },
                payload: {
                  content: this.operationParams.reason,
                },
              });
              return ok(briefWithComment);
            } catch (e: unknown) {
              return err(e instanceof Error ? e.message : String(e));
            }
          }

          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'archive': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'edit',
            author: { name: this.operationParams.author },
            payload: {
              state: 'ARCHIVED',
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'addComment': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.briefId,
            type: 'commentAdd',
            author: { name: this.operationParams.author },
            payload: {
              content: this.operationParams.content,
            },
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'appendEvent': {
        try {
          const brief = await this.briefRepo.appendEvent({
            briefId: this.operationParams.briefId,
            projectId: this.operationParams.projectId,
            type: this.operationParams.type,
            author: this.operationParams.author,
            payload: this.operationParams.payload,
          });
          return ok(brief);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      default:
        return err(`Unknown operation: ${this.operation}`);
    }
  }
}
