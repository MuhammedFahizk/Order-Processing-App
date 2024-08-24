import { userInstance } from "../../Instance";

export const SearchProducts = async (query) => {
    try {
        const response = await userInstance.get(`/search`, {
            params: { q: query }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

