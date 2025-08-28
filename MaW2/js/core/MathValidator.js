/**
 * Système de validation mathématique avancé
 * Gère les fractions équivalentes, approximations numériques, normalisation, exposants
 */
class MathValidator {
    constructor() {
        // Tolérance pour les comparaisons numériques (0.001 = 3 décimales)
        this.numericTolerance = 0.001;
        
        // Symboles équivalents à normaliser
        this.symbolMap = {
            '×': '*',
            '·': '*',
            '÷': '/',
            '−': '-',
            '–': '-',
            '—': '-'
        };
    }
    
    /**
     * Compare deux réponses avec toutes les validations intelligentes
     */
    compareAnswers(userAnswer, correctAnswer) {
        if (!userAnswer || !correctAnswer) return false;
        
        // Normaliser les deux réponses
        const normalizedUser = this.normalizeAnswer(userAnswer);
        const normalizedCorrect = this.normalizeAnswer(correctAnswer);
        
        // 1. Comparaison exacte (après normalisation)
        if (normalizedUser === normalizedCorrect) {
            return true;
        }
        
        // 2. Comparaison de fractions
        if (this.areFractionsEquivalent(normalizedUser, normalizedCorrect)) {
            return true;
        }
        
        // 3. Comparaison numérique avec tolérance
        if (this.areNumbersEquivalent(normalizedUser, normalizedCorrect)) {
            return true;
        }
        
        // 4. Comparaison d'expressions mathématiques simples
        if (this.areExpressionsEquivalent(normalizedUser, normalizedCorrect)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Normalise une réponse (espaces, symboles, casse)
     */
    normalizeAnswer(answer) {
        let normalized = answer.toString().trim().toLowerCase();
        
        // Remplacer les symboles équivalents
        for (const [original, replacement] of Object.entries(this.symbolMap)) {
            normalized = normalized.replace(new RegExp(original, 'g'), replacement);
        }
        
        // Normaliser les exposants Unicode vers notation ^ 
        normalized = this.normalizeExponents(normalized);
        
        // Supprimer les espaces autour des opérateurs
        normalized = normalized.replace(/\s*([+\-*/=^])\s*/g, '\$1');
        
        // Supprimer les espaces multiples
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        return normalized;
    }
    
    /**
     * Convertit les exposants Unicode en notation ^ standard
     * 2³ → 2^3, x² → x^2, etc.
     */
    normalizeExponents(str) {
        // Map des exposants Unicode vers chiffres normaux
        const superscriptMap = {
            '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
            '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
            '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')'
        };
        
        let result = str;
        
        // Remplacer les exposants Unicode par la notation ^
        for (const [unicode, normal] of Object.entries(superscriptMap)) {
            if (result.includes(unicode)) {
                // Trouver le caractère précédent (base de l'exposant)
                result = result.replace(new RegExp(`([a-z0-9)])${unicode}`, 'gi'), '\$1^' + normal);
            }
        }
        
        return result;
    }
    
    /**
     * Vérifie si deux fractions sont équivalentes
     * Exemples: "1/2" == "2/4", "3/6" == "1/2"
     */
    areFractionsEquivalent(answer1, answer2) {
        const fraction1 = this.parseFraction(answer1);
        const fraction2 = this.parseFraction(answer2);
        
        if (!fraction1 || !fraction2) return false;
        
        // Comparaison croisée: a/b == c/d si a*d == b*c
        return (fraction1.numerator * fraction2.denominator) === 
               (fraction1.denominator * fraction2.numerator);
    }
    
    /**
     * Parse une fraction depuis une chaîne
     * Formats supportés: "1/2", "3 / 4", "1 2/3" (mixte)
     */
    parseFraction(str) {
        // Fraction simple: "1/2" ou "3 / 4"
        const simpleFraction = str.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
        if (simpleFraction) {
            return {
                numerator: parseInt(simpleFraction[1]),
                denominator: parseInt(simpleFraction[2])
            };
        }
        
        // Fraction mixte: "1 2/3" = 1 + 2/3
        const mixedFraction = str.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
        if (mixedFraction) {
            const whole = parseInt(mixedFraction[1]);
            const num = parseInt(mixedFraction[2]);
            const den = parseInt(mixedFraction[3]);
            
            return {
                numerator: whole * den + num,
                denominator: den
            };
        }
        
        return null;
    }
    
    /**
     * Compare deux nombres avec tolérance
     * Exemples: 13.333 ≈ 13.33, 0.1666 ≈ 1/6
     */
    areNumbersEquivalent(answer1, answer2) {
        const num1 = this.parseNumber(answer1);
        const num2 = this.parseNumber(answer2);
        
        if (num1 === null || num2 === null) return false;
        
        return Math.abs(num1 - num2) <= this.numericTolerance;
    }
    
    /**
     * Parse un nombre depuis une chaîne (gère les fractions aussi)
     */
    parseNumber(str) {
        // Nombre décimal direct
        const directNumber = parseFloat(str);
        if (!isNaN(directNumber)) {
            return directNumber;
        }
        
        // Fraction convertie en décimal
        const fraction = this.parseFraction(str);
        if (fraction && fraction.denominator !== 0) {
            return fraction.numerator / fraction.denominator;
        }
        
        return null;
    }
    
    /**
     * Compare des expressions mathématiques simples
     * Exemples: "2*3" == "6", "2^3" == "8", "x+x" == "2x"
     */
    areExpressionsEquivalent(answer1, answer2) {
        // Cas spécial: exposants
        if (this.areExponentsEquivalent(answer1, answer2)) {
            return true;
        }
        
        // Cas simple: "2*3" vs "6"
        try {
            const result1 = this.evaluateSimpleExpression(answer1);
            const result2 = this.evaluateSimpleExpression(answer2);
            
            if (result1 !== null && result2 !== null) {
                return Math.abs(result1 - result2) <= this.numericTolerance;
            }
        } catch (e) {
            // Si l'évaluation échoue, pas grave
        }
        
        return false;
    }
    
    /**
     * Compare les expressions avec exposants
     * 2³ vs 8, 3² vs 9, etc.
     */
    areExponentsEquivalent(answer1, answer2) {
        const exp1 = this.evaluateExponent(answer1);
        const exp2 = this.evaluateExponent(answer2);
        
        // Si l'une est un exposant et l'autre un nombre
        if (exp1 !== null && this.parseNumber(answer2) !== null) {
            return Math.abs(exp1 - this.parseNumber(answer2)) <= this.numericTolerance;
        }
        
        if (exp2 !== null && this.parseNumber(answer1) !== null) {
            return Math.abs(exp2 - this.parseNumber(answer1)) <= this.numericTolerance;
        }
        
        // Si les deux sont des exposants
        if (exp1 !== null && exp2 !== null) {
            return Math.abs(exp1 - exp2) <= this.numericTolerance;
        }
        
        return false;
    }
    
    /**
     * Évalue une expression avec exposant simple
     * 2^3 → 8, 5^2 → 25
     */
    evaluateExponent(expr) {
        // Pattern pour base^exposant (nombres seulement pour la sécurité)
        const match = expr.match(/^(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)$/);
        
        if (match) {
            const base = parseFloat(match[1]);
            const exponent = parseFloat(match[2]);
            
            // Limiter les exposants pour éviter les calculs trop lourds
            if (exponent > 10) return null;
            
            return Math.pow(base, exponent);
        }
        
        return null;
    }
    
    /**
     * Évalue une expression mathématique simple (sécurisé)
     * ATTENTION: seulement pour des expressions basiques et sûres
     */
    evaluateSimpleExpression(expr) {
        // Sécurité: permettre aussi ^ pour les exposants
        if (!/^[\d+\-*/^().\s]+$/.test(expr)) {
            return null;
        }
        
        try {
            // Remplacer ^ par Math.pow pour l'évaluation
            let jsExpr = expr.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, 'Math.pow(\$1,\$2)');
            return new Function('return ' + jsExpr)();
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Méthode utilitaire pour déboguer les comparaisons
     */
    debugComparison(userAnswer, correctAnswer) {
        console.log('=== Debug MathValidator ===');
        console.log('User:', userAnswer, '→', this.normalizeAnswer(userAnswer));
        console.log('Correct:', correctAnswer, '→', this.normalizeAnswer(correctAnswer));
        console.log('Fractions:', this.parseFraction(userAnswer), this.parseFraction(correctAnswer));
        console.log('Numbers:', this.parseNumber(userAnswer), this.parseNumber(correctAnswer));
        console.log('Exponents:', this.evaluateExponent(userAnswer), this.evaluateExponent(correctAnswer));
        console.log('Result:', this.compareAnswers(userAnswer, correctAnswer));
        console.log('========================');
    }
}
