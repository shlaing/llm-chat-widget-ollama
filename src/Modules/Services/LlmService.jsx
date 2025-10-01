import { OLLAMA_API_URL } from "../Configs/OllamaConfig";
import { OLLAMA_MODEL } from "../Configs/OllamaConfig";

function LlmService() {
    const apiUrl = OLLAMA_API_URL;

    const getResponse = async (prompt) => {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": false
            })
        });
        const data = await response.json();
        return data;
    }

    return {
        getResponse
    }
}

function LlmServiceWithStream() {
    const apiUrl = OLLAMA_API_URL;
  
    const getResponse = async (prompt, onToken) => {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: true,
            }),
        });
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
    
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
    
            const chunk = decoder.decode(value, { stream: true });
    
            for (const line of chunk.split("\n")) {
                if (!line.trim()) continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                        onToken(parsed.response); // <-- send chunk back via callback
                    }
                    if (parsed.done) return;
                } catch (err) {
                    console.error("Parse error:", err, line);
                }
            }
        }
    };
  
    return { getResponse };
}

export { LlmService, LlmServiceWithStream };