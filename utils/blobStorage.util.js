import { ManagedIdentityCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';


const BlobStorageUtil = (() => {
  const _initClient = async () => {
    const accountName = process.env.STORAGE_ACCOUNT_NAME;
    const credential = new ManagedIdentityCredential({
      clientId: process.env.UAMI_STORAGE
    });
    
    // For running locally
    // const credential = new DefaultAzureCredential();
    
    return new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
  };
  
  const _streamToBuffer = async (readableStream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
      readableStream.on('data', (data) => chunks.push(data));
      readableStream.on('end', () => resolve(Buffer.concat(chunks)));
      readableStream.on('error', reject);
    });
  };
  
  const _createBlobClient = async ({ blobServiceClient, fileName }) => {
    const containerName = process.env.CONTAINER_NAME;
    const prefixBlobName = process.env.PREFIX_ATTCHMENTS;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    return containerClient.getBlockBlobClient(`${prefixBlobName}/${fileName}`);
  };
  
  const downloadAttachment = async (blobName) => {
    const blobServiceClient = await _initClient();
    const blobClient = await _createBlobClient({ blobServiceClient, fileName: blobName });
    const downloadBlockBlobResponse = await blobClient.download();
    return await _streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
  };
  
  const uploadBlob = async (blobContent, headers) => {
    const blobServiceClient = await _initClient();
    const blockBlobClient = await _createBlobClient({ blobServiceClient, fileName: headers.filename });
    await blockBlobClient.upload(blobContent, blobContent.length, {
      blobHTTPHeaders: {
        blobContentType: headers.contentType
      }
    });
    
    return blockBlobClient.url;
  };
  return {
    uploadBlob,
    downloadAttachment
  };
})();

export default BlobStorageUtil;