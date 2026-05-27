import { DefaultAzureCredential } from "@azure/identity";
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
} from "@azure/storage-blob";
import { config } from "./config.js";

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${config.storageAccountName}.blob.core.windows.net`,
  credential,
);

export async function createReadOnlyBlobUrl(blobName: string): Promise<string> {
  const startsOn = new Date(Date.now() - 60_000);
  const expiresOn = new Date(Date.now() + config.sasTtlMinutes * 60_000);
  const delegationKey = await blobServiceClient.getUserDelegationKey(
    startsOn,
    expiresOn,
  );

  const sas = generateBlobSASQueryParameters(
    {
      blobName,
      containerName: config.storageContainerName,
      expiresOn,
      permissions: BlobSASPermissions.parse("r"),
      protocol: SASProtocol.Https,
      startsOn,
    },
    delegationKey,
    config.storageAccountName,
  ).toString();

  const blobUrl = blobServiceClient
    .getContainerClient(config.storageContainerName)
    .getBlobClient(blobName).url;

  return `${blobUrl}?${sas}`;
}
