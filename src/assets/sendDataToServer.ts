import Axios from 'axios';
import forge from 'node-forge';

async function fetchPublicKey(url: string): Promise<string> {
  try {
    const response = await Axios.get(url);

    if (response.data && response.data.publicKey) {
      return response.data.publicKey;
    } else if (typeof response.data === 'string') {
      // If the response is a string, return it directly
      return response.data;
    } else {
      throw new Error('Invalid response format for public key');
    }
  } catch (error) {
    throw new Error('Failed to fetch public key: ' );
  }
}

async function sendDataToServer(url: string, publicKeyUrl: string, payload: object, maxRetries = 10): Promise<any> {
  try {
    const publicKeyPem = await fetchPublicKey(publicKeyUrl);

    if (!publicKeyPem) {
      throw new Error('Public key is undefined');
    }
  
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Generate a random AES key
    const aesKey = forge.random.getBytesSync(16);
    const iv = forge.random.getBytesSync(16);

    // Encrypt the payload using AES
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(payload), 'utf8'));
    cipher.finish();
    const encryptedPayload = cipher.output.getBytes();

    // Encrypt the AES key with the public key
    const encryptedAesKey = publicKey.encrypt(aesKey);

    // Convert to base64 for transmission
    const encryptedPayloadBase64 = forge.util.encode64(encryptedPayload);
    const encryptedAesKeyBase64 = forge.util.encode64(encryptedAesKey);
    const ivBase64 = forge.util.encode64(iv);    

    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await Axios.post(url, {  payload: encryptedPayloadBase64,
            key: encryptedAesKeyBase64,
            iv: ivBase64, });

        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        if (Axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Error response:', error.response.data);
          } else {
            console.error('Error message:', error.message);
          }
        } else if (error instanceof Error) {
          console.error('Error:', error.message);
        } else {
          console.error('Unknown error:', error);
        }

        attempt += 1;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }
    }

    throw new Error('Failed to send data after multiple attempts');
  } catch (error) {    
    throw new Error('Failed to prepare data for sending: ');
  }
}

export default sendDataToServer;
