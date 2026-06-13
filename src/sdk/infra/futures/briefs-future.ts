import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { BriefEnvelope } from '@/sdk/domain/entities/brief';
import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';

export class BriefsFuture extends Future<BriefEnvelope[], WaldeAdmin> {
  private projectIdFilter?: string;

  constructor({ parent, briefRepo }: { parent: WaldeAdmin; briefRepo: BriefRepository }) {
    super({ parent });
    this.briefRepo = briefRepo;
  }

  private briefRepo: BriefRepository;

  forProject(projectId: string): BriefsFuture {
    const future = new BriefsFuture({ parent: this.parent, briefRepo: this.briefRepo });
    future.projectIdFilter = projectId;
    return future;
  }

  async resolve(): Promise<Result<BriefEnvelope[], string>> {
    try {
      const envelopes = await this.briefRepo.list(this.projectIdFilter);
      return ok(envelopes);
    } catch (e: unknown) {
      return err(e instanceof Error ? e.message : String(e));
    }
  }
}
