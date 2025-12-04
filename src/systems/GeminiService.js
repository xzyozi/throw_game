// NOTE: This is a mock service for now.
// In a real implementation, this would use the Gemini API.
export class GeminiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getBossName() {
        // Mock implementation
        return Promise.resolve("暗黒騎士ガイア");
    }

    async getBossTaunt() {
        // Mock implementation
        const taunts = [
            "無駄な足掻きを…",
            "その程度か？",
            "我が闇の前にひれ伏せ！"
        ];
        if (Math.random() < 0.3) {
            return Promise.resolve(taunts[Math.floor(Math.random() * taunts.length)]);
        }
        return Promise.resolve(null);
    }
}
