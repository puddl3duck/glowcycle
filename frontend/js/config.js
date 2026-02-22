// API Configuration for Glow Cycle
// IMPORTANT: Update this URL with your own API Gateway endpoint after deployment
// Get this URL from: AWS Console → API Gateway → Your API → Stages → prod

const API_CONFIG = {
    BASE_URL: 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod',
    ENDPOINTS: {
        JOURNAL: '/journal',
        PERIOD: '/period',
        SKIN_UPLOAD_URL: "/skin/upload-url",
        SKIN_ANALYZE: "/skin/analyze",
        SKIN: '/skin',
        WELLNESS: '/wellness'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
