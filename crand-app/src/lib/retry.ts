export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Retry on network errors or timeouts or explicit topology errors
    if (retries > 0 && (
      error.name === 'MongoNetworkError' || 
      error.name === 'MongoTimeoutError' || 
      error.message?.includes('topology') ||
      error.message?.includes('connection')
    )) {
      console.warn(`Database connection failed, retrying... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
