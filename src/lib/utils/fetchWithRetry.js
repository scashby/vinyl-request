// ✅ src/lib/utils/fetchWithRetry.js

export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
