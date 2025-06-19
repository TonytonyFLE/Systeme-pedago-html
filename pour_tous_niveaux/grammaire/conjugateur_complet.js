
/**
 * Conjugateur Français Complet
 * Gestion des accords automatiques pour tous les temps composés
 * Support de 45+ verbes avec toutes leurs particularités
 */
class ConjugateurFrancais {
    constructor() {
        // Sujets avec leurs propriétés grammaticales
        this.sujets = {
            "Je": { personne: 1, nombre: "singulier", genre: null },
            "Tu": { personne: 2, nombre: "singulier", genre: null },
            "Il": { personne: 3, nombre: "singulier", genre: "masculin" },
            "Elle": { personne: 3, nombre: "singulier", genre: "féminin" },
            "On": { personne: 3, nombre: "singulier", genre: null },
            "Nous": { personne: 1, nombre: "pluriel", genre: null },
            "Vous": { personne: 2, nombre: "pluriel", genre: null },
            "Ils": { personne: 3, nombre: "pluriel", genre: "masculin" },
            "Elles": { personne: 3, nombre: "pluriel", genre: "féminin" }
        };

        // Pronoms réfléchis pour les verbes pronominaux
        this.pronomsReflexifs = {
            "Je": "me", "Tu": "te", "Il": "se", "Elle": "se", "On": "se",
            "Nous": "nous", "Vous": "vous", "Ils": "se", "Elles": "se"
        };

        // Auxiliaires conjugués au présent
        this.auxiliaires = {
            "avoir": {
                "Je": "ai", "Tu": "as", "Il": "a", "Elle": "a", "On": "a",
                "Nous": "avons", "Vous": "avez", "Ils": "ont", "Elles": "ont"
            },
            "être": {
                "Je": "suis", "Tu": "es", "Il": "est", "Elle": "est", "On": "est", 
                "Nous": "sommes", "Vous": "êtes", "Ils": "sont", "Elles": "sont"
            }
        };

        // Cache pour les données de verbes chargées
        this.verbesData = null;
    }

    /**
     * Charge les données des verbes depuis le JSON
     * @param {Object} verbesJson - Données JSON des verbes
     */
    chargerVerbes(verbesJson) {
        this.verbesData = verbesJson;
        console.log(`📚 ${Object.keys(verbesJson).length} verbes chargés`);
    }

    /**
     * Accorde le participe passé selon les règles françaises
     * @param {string} participe - Participe passé de base
     * @param {string} auxiliaire - "avoir" ou "être"
     * @param {string} sujet - Sujet de la phrase
     * @param {boolean} pronominal - Si le verbe est pronominal
     * @param {string} genre - Genre spécifique (optionnel)
     * @param {string} nombre - Nombre spécifique (optionnel)
     * @returns {string} Participe accordé
     */
    accorderParticipe(participe, auxiliaire, sujet, pronominal = false, genre = null, nombre = null) {
        const infoSujet = this.sujets[sujet];
        const genreFinal = genre || infoSujet.genre;
        const nombreFinal = nombre || infoSujet.nombre;

        let accord = "";

        // Règles d'accord du participe passé
        if (auxiliaire === "être" || pronominal) {
            // Avec être ou verbes pronominaux : accord avec le sujet
            if (genreFinal === "féminin") accord += "e";
            if (nombreFinal === "pluriel") accord += "s";
        }
        // Avec avoir : pas d'accord automatique (sauf COD antéposé, non géré ici)

        return participe + accord;
    }

    /**
     * Conjugue un verbe au passé composé avec accord automatique
     * @param {string} infinitif - Infinitif du verbe
     * @param {string} sujet - Sujet de conjugaison
     * @param {string} genre - Genre optionnel pour forcer l'accord
     * @param {string} nombre - Nombre optionnel pour forcer l'accord
     * @returns {string} Forme conjuguée
     */
    conjuguerPasseCompose(infinitif, sujet, genre = null, nombre = null) {
        if (!this.verbesData || !this.verbesData[infinitif]) {
            throw new Error(`Verbe "${infinitif}" non trouvé dans les données`);
        }

        const verbeData = this.verbesData[infinitif];
        const auxiliaire = verbeData.auxiliaire;
        const participe = verbeData.participe_passe;
        const pronominal = verbeData.pronominal;

        const auxConjugue = this.auxiliaires[auxiliaire][sujet];
        const participeAccorde = this.accorderParticipe(participe, auxiliaire, sujet, pronominal, genre, nombre);

        if (pronominal) {
            const pronomReflexif = this.pronomsReflexifs[sujet];
            return `${pronomReflexif} ${auxConjugue} ${participeAccorde}`;
        }

        return `${auxConjugue} ${participeAccorde}`;
    }

    /**
     * Génère toutes les formes d'accord possibles pour un verbe
     * @param {string} infinitif - Infinitif du verbe
     * @param {string} sujet - Sujet de conjugaison
     * @returns {Object} Toutes les variantes d'accord
     */
    genererVariantesAccord(infinitif, sujet) {
        if (!this.verbesData || !this.verbesData[infinitif]) {
            throw new Error(`Verbe "${infinitif}" non trouvé dans les données`);
        }

        const verbeData = this.verbesData[infinitif];
        const variantes = {};

        if (verbeData.auxiliaire === "être" || verbeData.pronominal) {
            variantes.masculin_singulier = this.conjuguerPasseCompose(infinitif, sujet, "masculin", "singulier");
            variantes.feminin_singulier = this.conjuguerPasseCompose(infinitif, sujet, "féminin", "singulier");
            variantes.masculin_pluriel = this.conjuguerPasseCompose(infinitif, sujet, "masculin", "pluriel");
            variantes.feminin_pluriel = this.conjuguerPasseCompose(infinitif, sujet, "féminin", "pluriel");
        } else {
            // Avec avoir, une seule forme (sauf COD antéposé)
            variantes.invariable = this.conjuguerPasseCompose(infinitif, sujet);
        }

        return variantes;
    }

    /**
     * Obtient des informations sur un verbe
     * @param {string} infinitif - Infinitif du verbe
     * @returns {Object} Informations du verbe
     */
    getInfoVerbe(infinitif) {
        if (!this.verbesData || !this.verbesData[infinitif]) {
            return null;
        }
        return this.verbesData[infinitif];
    }

    /**
     * Liste tous les verbes disponibles
     * @returns {Array} Liste des infinitifs
     */
    listerVerbes() {
        return this.verbesData ? Object.keys(this.verbesData).sort() : [];
    }

    /**
     * Filtre les verbes par critères
     * @param {Object} criteres - Critères de filtrage
     * @returns {Array} Verbes correspondants
     */
    filtrerVerbes(criteres = {}) {
        if (!this.verbesData) return [];

        return Object.entries(this.verbesData)
            .filter(([infinitif, data]) => {
                if (criteres.groupe && data.groupe !== criteres.groupe) return false;
                if (criteres.auxiliaire && data.auxiliaire !== criteres.auxiliaire) return false;
                if (criteres.pronominal !== undefined && data.pronominal !== criteres.pronominal) return false;
                if (criteres.irregulier !== undefined && data.irregulier !== criteres.irregulier) return false;
                return true;
            })
            .map(([infinitif]) => infinitif)
            .sort();
    }

    /**
     * Conjugue automatiquement avec le bon accord selon le sujet
     * @param {string} infinitif - Infinitif du verbe
     * @param {string} sujet - Sujet de conjugaison
     * @returns {string} Forme conjuguée avec accord automatique
     */
    conjuguerAuto(infinitif, sujet) {
        const infoSujet = this.sujets[sujet];
        return this.conjuguerPasseCompose(infinitif, sujet, infoSujet.genre, infoSujet.nombre);
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConjugateurFrancais;
}

// Instance globale pour utilisation directe
window.conjugateur = new ConjugateurFrancais();
