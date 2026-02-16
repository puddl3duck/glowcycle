// API Configuration for Glow Cycle
// IMPORTANT: Update this URL with your own API Gateway endpoint after deployment
// Get this URL from: AWS Console → API Gateway → Your API → Stages → prod

const API_CONFIG = {
    BASE_URL: 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/prod',
    ENDPOINTS: {
        JOURNAL: '/journal',
        PERIOD: '/period',
        SKIN: '/skin'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
