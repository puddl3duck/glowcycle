// API Configuration for Glow Cycle

const API_CONFIG = {
    BASE_URL: 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod',
    ENDPOINTS: {
        JOURNAL: '/journal',
        PERIOD: '/period',
        SKIN_UPLOAD_URL: "/skin/upload-url",
        SKIN_ANALYSE: "/skin/analyse",
        SKIN: '/skin',
        WELLNESS: '/wellness'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
