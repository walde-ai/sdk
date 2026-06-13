export interface CreateEventPayload {
  key: string;
}

export interface DeleteEventPayload {
  key: string;
}

export interface RenameEventPayload {
  oldKey: string;
  newKey: string;
}

export type AssetEvent =
  | { op: 'create'; payload: CreateEventPayload }
  | { op: 'delete'; payload: DeleteEventPayload }
  | { op: 'rename'; payload: RenameEventPayload };

export interface IAssetEventRepo {
  postEvents(siteId: string, events: AssetEvent[]): Promise<void>;
}
