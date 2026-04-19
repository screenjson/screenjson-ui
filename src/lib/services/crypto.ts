/**
 * Encryption/Decryption Service
 * Handles encrypted ScreenJSON document content
 */

import CryptoJS from 'crypto-js';
import type { Encrypt, Text, ScreenJSONDocument } from '../types/screenjson';

/** Decryption result */
export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

/** Check if a document has encrypted content */
export function hasEncryptedContent(document: ScreenJSONDocument): boolean {
  // Check document-level encryption
  if (document.encrypt) {
    return true;
  }
  
  // Check element-level encryption
  for (const scene of document.document.scenes) {
    for (const element of scene.body) {
      if (element.encrypt) {
        return true;
      }
    }
  }
  
  return false;
}

/** Get encryption info from document */
export function getEncryptionInfo(document: ScreenJSONDocument): Encrypt | null {
  return document.encrypt ?? null;
}

/** Decode encrypted string based on encoding */
function decodeEncryptedString(encrypted: string, encoding: Encrypt['encoding']): CryptoJS.lib.WordArray {
  switch (encoding) {
    case 'base64':
      return CryptoJS.enc.Base64.parse(encrypted);
    case 'hex':
    case 'base16':
      return CryptoJS.enc.Hex.parse(encrypted);
    default:
      // Treat as hex by default
      return CryptoJS.enc.Hex.parse(encrypted);
  }
}

/** Decrypt text using AES-256-CTR */
export function decryptText(
  encryptedText: string,
  password: string,
  encrypt: Encrypt
): DecryptionResult {
  try {
    const { cipher, hash, encoding } = encrypt;
    
    // Validate cipher
    if (cipher !== 'aes-256-ctr' && cipher !== 'aes-256-cbc') {
      return {
        success: false,
        error: `Unsupported cipher: ${cipher}. Only aes-256-ctr and aes-256-cbc are supported.`
      };
    }
    
    // Generate key from password
    let key: CryptoJS.lib.WordArray;
    if (hash === 'sha256') {
      key = CryptoJS.SHA256(password);
    } else if (hash === 'sha512') {
      key = CryptoJS.SHA512(password);
      // Truncate to 256 bits for AES-256
      key = CryptoJS.lib.WordArray.create(key.words.slice(0, 8), 32);
    } else {
      return {
        success: false,
        error: `Unsupported hash: ${hash}. Only sha256 and sha512 are supported.`
      };
    }
    
    // Parse encrypted data
    // Format: iv:ciphertext (both in the specified encoding)
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      return {
        success: false,
        error: 'Invalid encrypted text format. Expected iv:ciphertext.'
      };
    }
    
    const iv = decodeEncryptedString(parts[0], encoding);
    const ciphertext = decodeEncryptedString(parts[1], encoding);
    
    // Decrypt
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext
    });
    
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: cipher === 'aes-256-ctr' ? CryptoJS.mode.CTR : CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      return {
        success: false,
        error: 'Decryption failed. The password may be incorrect.'
      };
    }
    
    return {
      success: true,
      data: plaintext
    };
  } catch (error) {
    return {
      success: false,
      error: `Decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/** Decrypt all encrypted text fields in a document */
export function decryptDocument(
  document: ScreenJSONDocument,
  password: string
): { document: ScreenJSONDocument; errors: string[] } {
  const errors: string[] = [];
  const encrypt = document.encrypt;
  
  if (!encrypt) {
    return { document, errors: [] };
  }
  
  // Deep clone the document
  const decryptedDoc = JSON.parse(JSON.stringify(document)) as ScreenJSONDocument;
  
  // Decrypt element text fields
  for (const scene of decryptedDoc.document.scenes) {
    for (const element of scene.body) {
      if ('text' in element && element.text) {
        const elementEncrypt = element.encrypt ?? encrypt;
        const decryptedText: Text = {};
        
        for (const [lang, text] of Object.entries(element.text)) {
          // Check if this text looks encrypted (contains only hex chars and colons)
          if (/^[0-9a-fA-F:]+$/.test(text)) {
            const result = decryptText(text, password, elementEncrypt);
            if (result.success && result.data) {
              decryptedText[lang] = result.data;
            } else {
              decryptedText[lang] = text; // Keep original if decryption fails
              if (result.error) {
                errors.push(`Element ${element.id}: ${result.error}`);
              }
            }
          } else {
            decryptedText[lang] = text; // Not encrypted
          }
        }
        
        (element as any).text = decryptedText;
      }
    }
  }
  
  return { document: decryptedDoc, errors };
}

/** Simple password validation */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 1) {
    return { valid: false, error: 'Password cannot be empty' };
  }
  
  return { valid: true };
}
