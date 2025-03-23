export const getUserFromToken = async (reqHeaders) => {
  const token = reqHeaders.authorization?.split(' ')[1];
  if (token) {
    // Decode the ID token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedData = JSON.parse(Buffer.from(base64, 'base64').toString());
    
    return decodedData?.unique_name || decodedData?.preferred_username; // "o
  }
  return undefined;
};