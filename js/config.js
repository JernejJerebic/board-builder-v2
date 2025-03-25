
/**
 * Configuration settings for LCC Naročilo razreza
 */
const CONFIG = {
    // API URL for production
    apiUrl: 'https://lcc-api.example.com',
    
    // Use mock data for development
    useMockData: true,
    
    // VAT percentage
    vatPercentage: 22,
    
    // Admin credentials
    adminCredentials: [
        {
            email: "em.mont3@gmail.com",
            password: "12emir34"
        },
        {
            email: "jerebic.jernej@gmail.com",
            password: "12jernej34"
        }
    ],
    
    // EmailJS configuration
    emailJs: {
        serviceId: 'service_iqv96th',
        templateId: 'template_2pd5z1i',
        userId: 'QSWNF6DxGrTMaC3CI'
    }
};
