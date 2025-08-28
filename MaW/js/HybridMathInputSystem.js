/**
 * Système mathématique hybride : Palette + conversion automatique des fractions
 */
class HybridMathInputSystem {
    constructor() {
        this.activeInput = null;
        this.primaryPalette = null;
        this.secondaryPalette = null;
        this.currentSecondaryType = null;
        this.savedRange = null;
        
        // Configuration des palettes (sans les fractions dans la palette primaire)
        this.primarySymbols = [
            { symbol: '+', type: 'operator' },
            { symbol: '−', type: 'operator' },
            { symbol: '×', type: 'operator' },
            { symbol: '÷', type: 'operator' },
            { symbol: '(', type: 'parenthesis' },
            { symbol: ')', type: 'parenthesis' },
            { symbol: 'π', type: 'constant' },
            { symbol: '√', type: 'function', action: 'sqrt' },
            { symbol: 'xⁿ', type: 'secondary', action: 'exponents' },
            { symbol: '⚙️', type: 'secondary', action: 'advanced' }
        ];
        
        this.secondarySymbols = {
            exponents: [
                { symbol: '⁰', type: 'superscript' },
                { symbol: '¹', type: 'superscript' },
                { symbol: '²', type: 'superscript' },
                { symbol: '³', type: 'superscript' },
                { symbol: '⁴', type: 'superscript' },
                { symbol: '⁵', type: 'superscript' },
                { symbol: '⁶', type: 'superscript' },
                { symbol: '⁷', type: 'superscript' },
                { symbol: '⁸', type: 'superscript' },
                { symbol: '⁹', type: 'superscript' },
                { symbol: 'ⁿ', type: 'superscript' },
                { symbol: '⁻', type: 'superscript' }
            ],
            advanced: [
                { symbol: '±', type: 'operator' },
                { symbol: '≤', type: 'comparison' },
                { symbol: '≥', type: 'comparison' },
                { symbol: '≠', type: 'comparison' },
                { symbol: '≈', type: 'comparison' },
                { symbol: '∞', type: 'constant' },
                { symbol: '∑', type: 'function' },
                { symbol: '∫', type: 'function' },
                { symbol: '∂', type: 'function' },
                { symbol: 'α', type: 'greek' },
                { symbol: 'β', type: 'greek' },
                { symbol: 'γ', type: 'greek' },
                { symbol: 'δ', type: 'greek' },
                { symbol: 'θ', type: 'greek' },
                { symbol: 'λ', type: 'greek' },
                { symbol: 'μ', type: 'greek' },
                { symbol: 'σ', type: 'greek' },
                { symbol: 'ω', type: 'greek' }
            ]
        };
        
        this.createPalettes();
        this.bindEvents();
    }
    
    createPalettes() {
        // Palette primaire
        this.primaryPalette = document.createElement('div');
        this.primaryPalette.className = 'math-palette primary-palette';
        this.primaryPalette.innerHTML = this.generatePaletteHTML(this.primarySymbols);
        document.body.appendChild(this.primaryPalette);
        
        // Palette secondaire
        this.secondaryPalette = document.createElement('div');
        this.secondaryPalette.className = 'math-palette secondary-palette';
        document.body.appendChild(this.secondaryPalette);
    }
    
    generatePaletteHTML(symbols) {
        return symbols.map(item => 
            `<button class="symbol-btn ${item.type}" 
                     data-symbol="${item.symbol}" 
                     data-type="${item.type}"
                     data-action="${item.action || ''}"
                     type="button"
                     tabindex="-1">
                ${item.symbol}
             </button>`
        ).join('');
    }
    
    bindEvents() {
        // Focus sur les champs math
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('math-input')) {
                this.showPrimaryPalette(e.target);
            }
        });
        
        // Clic en dehors pour fermer
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.math-palette') && 
                !e.target.classList.contains('math-input')) {
                this.hideAllPalettes();
            }
        });
        
        // Gestion des clics sur les boutons de palette
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('symbol-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleSymbolClick(e.target);
                return false;
            }
        });
        
// Empêcher la fermeture lors du clic sur les palettes mais permettre la navigation
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.math-palette') && !e.target.classList.contains('symbol-btn')) {
        e.preventDefault();
    }
});
        
        // NOUVEAU : Gestion de la conversion automatique des fractions
        document.addEventListener('keyup', (e) => {
            if (e.target.classList.contains('math-input')) {
                setTimeout(() => this.handleAutoConversion(e.target), 10);
            }
        }, true);

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('math-input')) {
                setTimeout(() => this.handleAutoConversion(e.target), 10);
            }
        }, true);

        document.addEventListener('paste', (e) => {
            if (e.target.classList.contains('math-input')) {
                setTimeout(() => this.handleAutoConversion(e.target), 50);
            }
        }, true);
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            if (this.activeInput && this.primaryPalette.classList.contains('active')) {
                this.positionPalette(this.primaryPalette, this.activeInput);
                if (this.secondaryPalette.classList.contains('active')) {
                    this.positionSecondaryPalette();
                }
            }
        });
    }
    
    /**
     * Gestion de la conversion automatique des fractions uniquement
     */
    handleAutoConversion(input) {
        let content = input.textContent || input.innerText || '';
        let converted = content;
        
        // Conversion uniquement des fractions avec "/"
        converted = converted.replace(/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/g, (match, num, den) => {
            return `<span class="fraction"><span class="numerator">${num}</span><span class="denominator">${den}</span></span>`;
        });
        
        // Gestion des fractions avec parenthèses complexes
        converted = converted.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, (match, num, den) => {
            return `<span class="complex-fraction"><span class="numerator">${num}</span><span class="denominator">${den}</span></span>`;
        });
        
        if (converted !== content) {
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const cursorOffset = range ? range.startOffset : 0;
            
            input.innerHTML = converted;
            
            // Restaurer la position du curseur
            try {
                const newRange = document.createRange();
                const textNodes = this.getTextNodes(input);
                let currentOffset = 0;
                
                for (let node of textNodes) {
                    if (currentOffset + node.textContent.length >= cursorOffset) {
                        newRange.setStart(node, cursorOffset - currentOffset);
                        newRange.setEnd(node, cursorOffset - currentOffset);
                        break;
                    }
                    currentOffset += node.textContent.length;
                }
                
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // En cas d'erreur, placer le curseur à la fin
                const range = document.createRange();
                range.selectNodeContents(input);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
 this.enablePaletteInFractions(input);
        }
    }
    }

    /**
     * Active la palette mathématique dans les fractions créées
     */
    enablePaletteInFractions(parentInput) {
        const fractions = parentInput.querySelectorAll('.fraction .numerator, .fraction .denominator, .complex-fraction .numerator, .complex-fraction .denominator');
        
        fractions.forEach(fractionPart => {
            // Rendre les parties de fractions éditables
            fractionPart.contentEditable = true;
            fractionPart.classList.add('math-input');
            
            // Ajouter les événements pour la palette
            fractionPart.addEventListener('focus', (e) => {
                this.showPrimaryPalette(e.target);
            });
            
            fractionPart.addEventListener('input', (e) => {
                setTimeout(() => this.handleAutoConversion(e.target), 10);
            });
        });
    }
    
    /**
     * Utilitaire pour obtenir tous les nœuds texte d'un élément
     */
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
    
    showPrimaryPalette(input) {
        this.activeInput = input;
        this.positionPalette(this.primaryPalette, input);
        this.primaryPalette.classList.add('active');
        this.hideSecondaryPalette();
    }
    
    showSecondaryPalette(type) {
        if (!this.secondarySymbols[type]) return;
        
        this.currentSecondaryType = type;
        const symbolsHTML = this.generatePaletteHTML(this.secondarySymbols[type]);
        
        this.secondaryPalette.innerHTML = `
            <button class="palette-close-btn" type="button" tabindex="-1">×</button>
            <div class="secondary-title">${this.getSecondaryTitle(type)}</div>
            ${symbolsHTML}
        `;
        
        const closeBtn = this.secondaryPalette.querySelector('.palette-close-btn');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideSecondaryPalette();
        });
        
        this.positionSecondaryPalette();
        this.secondaryPalette.classList.add('active');
    }
    
hideSecondaryPalette() {
    this.secondaryPalette.classList.remove('active');
    this.currentSecondaryType = null;
    
    // Ne pas forcer le focus - laisser l'utilisateur naviguer librement
    if (this.activeInput && this.savedRange) {
        setTimeout(() => {
            this.restoreCursor();
        }, 10);
    }
}
    
    hideAllPalettes() {
        this.primaryPalette.classList.remove('active');
        this.hideSecondaryPalette();
        this.activeInput = null;
    }
    
    getSecondaryTitle(type) {
        const titles = {
            exponents: 'Exposants',
            advanced: 'Symboles avancés'
        };
        return titles[type] || '';
    }
    
    positionPalette(palette, input) {
        const rect = input.getBoundingClientRect();
        const paletteHeight = 80;
        
        if (window.innerWidth <= 768) {
            palette.style.position = 'fixed';
            palette.style.bottom = '0';
            palette.style.left = '0';
            palette.style.right = '0';
            palette.style.top = 'auto';
            palette.style.transform = 'none';
            return;
        }
        
        let top = rect.bottom + 5;
        let left = rect.left;
        
        if (top + paletteHeight > window.innerHeight) {
            top = rect.top - paletteHeight - 5;
        }
        
        const paletteWidth = 400;
        if (left + paletteWidth > window.innerWidth) {
            left = window.innerWidth - paletteWidth - 10;
        }
        
        palette.style.position = 'absolute';
        palette.style.top = (top + window.scrollY) + 'px';
        palette.style.left = Math.max(10, left) + 'px';
        palette.style.bottom = 'auto';
        palette.style.right = 'auto';
        palette.style.transform = 'none';
    }
    
    positionSecondaryPalette() {
        if (window.innerWidth <= 768) {
            this.secondaryPalette.style.position = 'fixed';
            this.secondaryPalette.style.top = '50%';
            this.secondaryPalette.style.left = '50%';
            this.secondaryPalette.style.transform = 'translate(-50%, -50%)';
            this.secondaryPalette.style.bottom = 'auto';
            this.secondaryPalette.style.right = 'auto';
        } else {
            const primaryRect = this.primaryPalette.getBoundingClientRect();
            
            this.secondaryPalette.style.position = 'absolute';
            this.secondaryPalette.style.top = (primaryRect.top + window.scrollY) + 'px';
            this.secondaryPalette.style.left = (primaryRect.right + 10) + 'px';
            this.secondaryPalette.style.transform = 'none';
            this.secondaryPalette.style.bottom = 'auto';
            this.secondaryPalette.style.right = 'auto';
        }
    }
    
    handleSymbolClick(button) {
        const symbol = button.dataset.symbol;
        const type = button.dataset.type;
        const action = button.dataset.action;
        
        this.saveCursorPosition();
        
        if (type === 'secondary') {
            this.showSecondaryPalette(action);
            return;
        }
        
        if (action === 'sqrt') {
            this.insertSymbol('√(');
            this.moveCursorBack(1);
            return;
        }
        
        this.insertSymbol(symbol);
        
        if (this.currentSecondaryType) {
            this.hideSecondaryPalette();
        }
    }
    
    saveCursorPosition() {
        if (!this.activeInput) return;
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0).cloneRange();
        }
    }
    
    restoreCursor() {
        if (!this.activeInput || !this.savedRange) return;
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
    }
    
    moveCursorBack(steps) {
        if (!this.activeInput) return;
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            try {
                for (let i = 0; i < steps; i++) {
                    range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
                    range.setEnd(range.startContainer, Math.max(0, range.endOffset - 1));
                }
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                // En cas d'erreur, ne rien faire
            }
        }
    }
    
    insertSymbol(symbol) {
        if (!this.activeInput) return;
        
        this.activeInput.focus();
        
        let range;
        const selection = window.getSelection();
        
        if (this.savedRange) {
            range = this.savedRange;
        } else if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        } else {
            range = document.createRange();
            range.selectNodeContents(this.activeInput);
            range.collapse(false);
        }
        
        range.deleteContents();
        const textNode = document.createTextNode(symbol);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.savedRange = range.cloneRange();
    }
    
    /**
     * Comparaison flexible pour les réponses (utilisée par ChapterManager)
     */
    compareAnswers(userAnswer, correctAnswer) {
        const normalize = (answer) => {
            return answer.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');
        };
        
        return normalize(userAnswer) === normalize(correctAnswer);
    }
    
reinitialize() {
    // Ne pas re-bind les événements car ils sont déjà globaux
    // Cette méthode existe pour la compatibilité mais ne fait rien
    setTimeout(() => {
        // Juste s'assurer que les palettes sont masquées
        this.hideAllPalettes();
    }, 100);
}
    
    destroy() {
        if (this.primaryPalette) {
            this.primaryPalette.remove();
        }
        if (this.secondaryPalette) {
            this.secondaryPalette.remove();
        }
        this.activeInput = null;
        this.savedRange = null;
    }
}
