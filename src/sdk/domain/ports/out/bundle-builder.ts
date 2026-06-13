export interface CloudApiBundle {
  name: string;
  lambdaName: string;
  hash: string;
  bundle: Uint8Array;
}

export interface BundleBuilderInput {
  siteId: string;
  filePaths: string[];
}

export interface IBundleBuilder {
  build(input: BundleBuilderInput): Promise<CloudApiBundle[]>;
}
