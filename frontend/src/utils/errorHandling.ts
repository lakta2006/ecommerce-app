import { FieldError } from 'react-hook-form';

/**
 * Safely extract error message from FieldError
 * Handles cases where message might be an object (Zod errors)
 */
export function getErrorMessage(error?: FieldError): string | undefined {
  if (!error?.message) {
    return undefined;
  }

  const msg = error.message;

  // If it's already a string, return it
  if (typeof msg === 'string') {
    return msg;
  }

  // If it's a Zod error object, extract the message
  if (typeof msg === 'object' && msg !== null) {
    const objMsg = msg as Record<string, unknown>;
    // Handle Zod error structure { type, loc, msg, input }
    if ('msg' in objMsg && typeof objMsg.msg === 'string') {
      return objMsg.msg;
    }
    // Handle other object structures
    if ('message' in objMsg && typeof objMsg.message === 'string') {
      return objMsg.message;
    }
    // Fallback: stringify the object
    return JSON.stringify(msg);
  }

  // Fallback: convert to string
  return String(msg);
}
