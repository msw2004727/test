// loadApiKey.js
export async function loadDeepSeekApiKey() {
    try {
        const response = await fetch('/api_key.txt');
        const text = await response.text();
        const match = text.match(/deepseek api key\s+(\S+)/i);
        return match ? match[1] : null;
    } catch (error) {
        console.error("無法讀取 DeepSeek API Key:", error);
        return null;
    }
}