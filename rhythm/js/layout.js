// Menu lateral (computador) e barra de navegação inferior (celular).
// Para incluir uma página no menu, adicione-a em NAVEGACAO e crie a rota em app.js.
const NAVEGACAO = [
    { rotulo: 'Início', href: '#/', icone: 'inicio' },
    { rotulo: 'Buscar', href: '#/buscar', icone: 'busca' },
    { rotulo: 'Sua Biblioteca', rotuloCurto: 'Biblioteca', href: '#/biblioteca', icone: 'biblioteca' }
];

const Layout = {
    montar() {
        const lateral = document.querySelector('#menu-lateral');
        this.listaPlaylists = Util.el('nav', { class: 'menu-playlists', 'aria-label': 'Playlists' });

        lateral.append(
            Util.el('a', { class: 'marca', href: '#/' }, Util.el('img', { src: '../img/logo.png', alt: 'Cool Rhythm, início', width: 172, height: 130 })),
            Util.el('nav', { 'aria-label': 'Principal' }, Util.el('ul', {},
                ...NAVEGACAO.map(item => Util.el('li', {},
                    Util.el('a', { class: 'menu-link', href: item.href }, Icones.svg(item.icone), item.rotulo))))),
            Util.el('div', { class: 'menu-bloco' },
                Util.el('button', { class: 'menu-link', type: 'button', onclick: () => Componentes.criarPlaylist() },
                    Util.el('span', { class: 'menu-icone-caixa' }, Icones.svg('mais')), 'Criar playlist'),
                Util.el('a', { class: 'menu-link', href: '#/curtidas' },
                    Util.el('span', { class: 'menu-icone-caixa curtidas' }, Icones.svg('coracao')), 'Músicas curtidas')),
            Util.el('hr', { class: 'menu-divisor' }),
            this.listaPlaylists,
            Util.el('div', { class: 'menu-rodape' },
                Util.el('p', {}, 'Projeto de estudo: cada música toca uma prévia de 30 segundos gerada no navegador.'),
                Util.el('span', { class: 'idioma' }, Icones.svg('mundo'), 'Português do Brasil')));

        document.querySelector('#nav-celular').append(
            ...[...NAVEGACAO, { rotulo: 'Curtidas', href: '#/curtidas', icone: 'coracao' }].map(item =>
                Util.el('a', { href: item.href }, Icones.svg(item.icone), item.rotuloCurto || item.rotulo)));

        this.desenharPlaylists();
        Estado.ao('playlists', () => {
            this.desenharPlaylists();
            this.marcarAtual();
        });
    },

    desenharPlaylists() {
        const lista = playlists => Util.el('ul', {}, ...playlists.map(playlist =>
            Util.el('li', {}, Util.el('a', { href: `#/playlist/${playlist.id}` }, playlist.nome))));
        const minhas = Estado.playlists();

        this.listaPlaylists.replaceChildren(
            ...(minhas.length ? [Util.el('p', { class: 'menu-playlists-titulo' }, 'Suas playlists'), lista(minhas)] : []),
            Util.el('p', { class: 'menu-playlists-titulo' }, 'Do Cool Rhythm'),
            lista(SECOES.coolRhythm.map(Catalogo.playlist)));
    },

    // Destaca no menu o link da página aberta.
    marcarAtual() {
        const rota = location.hash.split('?')[0] || '#/';
        document.querySelectorAll('#menu-lateral a, #nav-celular a').forEach(link => {
            if (link.classList.contains('marca')) return;
            if (link.getAttribute('href') === rota) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }
};
