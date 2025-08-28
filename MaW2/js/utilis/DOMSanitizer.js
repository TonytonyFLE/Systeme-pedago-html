/**
 * Utilitaires pour sécuriser l'injection de contenu dans le  DOM
 */
class DOMSanitizer {
    /**
     * Nettoie une chaîne de caractères pour éviter les injections XSS
     */
    static sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    /**
     * Crée un élément DOM sécurisé avec du texte
     */
    static createTextElement(tagName, textContent, className = '') {
        const element = document.createElement(tagName);
        element.textContent = textContent; // Sécurisé automatiquement
        if (className) {
            element.className = className;
        }
        return element;
    }
    
    /**
     * Valide qu'une chaîne ne contient pas de balises HTML dangereuses
     */
    static isTextSafe(text) {
        const dangerousPatterns = [
            /<script/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /javascript:/i,
            /on\w+\s*=/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(text));
    }
}
