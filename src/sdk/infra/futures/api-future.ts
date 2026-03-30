import { Future, Result, ok, err } from '@/std';
import { ApiCall, ApiCallParams } from '@/sdk/domain/interactors/api-call';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';
import { WaldeAdmin } from './walde-admin-future';

export class ApiFuture extends Future<any, WaldeAdmin> {
  private apiCall: ApiCall;
  private callParams?: ApiCallParams;

  constructor({ parent, backendCommunication }: { parent: WaldeAdmin; backendCommunication: BackendCommunication }) {
    super({ parent });
    this.apiCall = new ApiCall(backendCommunication);
  }

  call(params: ApiCallParams): ApiFuture {
    const future = new ApiFuture({ parent: this.parent, backendCommunication: this.parent.getConfig().backendCommunication });
    future.callParams = params;
    return future;
  }

  async resolve(): Promise<Result<any, string>> {
    try {
      if (!this.callParams) {
        return err('No API call parameters specified');
      }

      const result = await this.apiCall.execute(this.callParams);
      return ok(result);
    } catch (error) {
      return err(error instanceof Error ? error.message : String(error));
    }
  }
}
