// Funções de apoio usadas pelo app todo.
const Util = {
    // Cria um elemento: Util.el('a', { href: '#/', class: 'botao' }, 'Texto')
    // Os filhos entram como texto (nunca como HTML), o que evita injeção de código.
    el(tag, atributos = {}, ...filhos) {
        const elemento = document.createElement(tag);
        for (const [nome, valor] of Object.entries(atributos)) {
            if (nome.startsWith('on')) elemento.addEventListener(nome.slice(2), valor);
            else if (nome === 'style' && typeof valor === 'object') {
                for (const [propriedade, valorCss] of Object.entries(valor)) elemento.style.setProperty(propriedade, valorCss);
            }
            else if (valor === true) elemento.setAttribute(nome, '');
            else if (valor !== false && valor != null) elemento.setAttribute(nome, valor);
        }
        elemento.append(...filhos.flat().filter(filho => filho != null && filho !== false));
        return elemento;
    },

    // 75 -> "1:15"
    formatarTempo(segundos) {
        const total = Math.max(0, Math.floor(segundos));
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    },

    // Compara textos sem diferenciar maiúsculas e acentos: "sofrencia" acha "Sofrência".
    normalizar(texto) {
        return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    },

    plural(quantidade, singular, plural = `${singular}s`) {
        return `${quantidade} ${quantidade === 1 ? singular : plural}`;
    },

    saudacao(data = new Date()) {
        const hora = data.getHours();
        if (hora >= 5 && hora < 12) return 'Bom dia';
        if (hora >= 12 && hora < 18) return 'Boa tarde';
        return 'Boa noite';
    },

    // Número fixo a partir de um texto (o mesmo id sempre gera o mesmo número).
    semente(texto) {
        let hash = 2166136261;
        for (const letra of String(texto)) {
            hash ^= letra.codePointAt(0);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    },

    embaralhar(lista) {
        const copia = [...lista];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    },

    notificar(texto) {
        const aviso = Util.el('div', { class: 'aviso', role: 'status' }, texto);
        document.querySelector('#avisos').append(aviso);
        setTimeout(() => aviso.remove(), 3500);
    }
};
