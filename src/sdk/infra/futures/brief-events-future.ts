import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { BriefEvent } from '@/sdk/domain/entities/brief';
import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';

export class BriefEventsFuture extends Future<BriefEvent[], WaldeAdmin> {
  constructor({ parent, briefRepo, briefId }: { parent: WaldeAdmin; briefRepo: BriefRepository; briefId: string }) {
    super({ parent });
    this.briefRepo = briefRepo;
    this.briefId = briefId;
  }

  private briefRepo: BriefRepository;
  private briefId: string;

  async resolve(): Promise<Result<BriefEvent[], string>> {
    try {
      const events = await this.briefRepo.getEvents(this.briefId);
      return ok(events);
    } catch (e: unknown) {
      return err(e instanceof Error ? e.message : String(e));
    }
  }
}
