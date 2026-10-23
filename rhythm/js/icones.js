// Ícones em linha (24x24, cor = currentColor). Use Icones.svg('play') para
// pegar o SVG como elemento, ou <span data-icone="play"></span> no HTML.
const Icones = {
    caminhos: {
        inicio: '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
        busca: '<circle cx="11" cy="11" r="7.5"/><path d="M21 21l-4.6-4.6"/>',
        biblioteca: '<path d="M4 4v16M9 4v16M14.5 4.5l5 15"/>',
        mais: '<path d="M12 5v14M5 12h14"/>',
        coracao: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
        play: '<path d="M7 4.5v15l12.5-7.5z"/>',
        pausa: '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
        anterior: '<path d="M19 19.5L9 12l10-7.5z"/><path d="M5 19V5"/>',
        proxima: '<path d="M5 4.5L15 12 5 19.5z"/><path d="M19 5v14"/>',
        aleatorio: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
        repetir: '<path d="M17 2l4 4-4 4"/><path d="M3 11V10a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
        volume: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
        mudo: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M23 9l-6 6M17 9l6 6"/>',
        mundo: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        adicionar: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
        remover: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
        lapis: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
        lixeira: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
        nota: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
    },

    svg(nome) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = this.caminhos[nome] || '';
        return svg;
    },

    aplicar(raiz = document) {
        raiz.querySelectorAll('[data-icone]').forEach(elemento => {
            elemento.prepend(Icones.svg(elemento.dataset.icone));
            elemento.removeAttribute('data-icone');
        });
    }
};
