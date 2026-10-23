// Liga tudo: monta menu e player e troca a página conforme o endereço.
// As rotas usam "#" (ex.: #/playlist/rap) para funcionar abrindo o arquivo
// direto no navegador e no GitHub Pages, sem servidor, e para a música
// continuar tocando enquanto você navega.
const ROTAS = [
    { padrao: /^\/?$/, nome: 'inicio', pagina: () => Paginas.inicio() },
    { padrao: /^\/buscar$/, nome: 'buscar', pagina: (_, parametros) => Paginas.buscar(parametros) },
    { padrao: /^\/biblioteca$/, nome: 'biblioteca', pagina: () => Paginas.biblioteca() },
    { padrao: /^\/curtidas$/, nome: 'curtidas', pagina: () => Paginas.curtidas() },
    { padrao: /^\/playlist\/([\w-]+)$/, nome: 'playlist', pagina: ([, id]) => Paginas.playlist(id) },
    { padrao: /^\/artista\/([\w-]+)$/, nome: 'artista', pagina: ([, id]) => Paginas.artista(id) }
];

const App = {
    rotaAtual: null,

    iniciar() {
        Player.montar();
        Layout.montar();
        this.desenhar({ primeiraVez: true });

        window.addEventListener('hashchange', () => this.desenhar());

        // Algumas páginas mostram curtidas e playlists: redesenha mantendo a rolagem.
        Estado.ao('curtidas', () => {
            if (['curtidas', 'biblioteca'].includes(this.rotaAtual)) this.desenhar({ manterRolagem: true });
        });
        Estado.ao('playlists', () => {
            if (['inicio', 'biblioteca', 'playlist'].includes(this.rotaAtual)) this.desenhar({ manterRolagem: true });
        });

        // Botões que ainda não têm tela (cadastro e login).
        document.querySelectorAll('[data-em-breve]').forEach(botao => {
            botao.addEventListener('click', () => Util.notificar(`${botao.dataset.emBreve} chega numa próxima versão.`));
        });

        // O "pular para o conteúdo" não pode mexer no # das rotas.
        document.querySelector('[data-pular]').addEventListener('click', evento => {
            evento.preventDefault();
            document.querySelector('#conteudo').focus();
        });

        // Barra de espaço toca e pausa (menos quando se está digitando ou num botão).
        document.addEventListener('keydown', evento => {
            if (evento.code !== 'Space' || evento.repeat) return;
            if (evento.target.closest('input, textarea, button, a, select, dialog, [contenteditable]')) return;
            if (!Player.atual) return;
            evento.preventDefault();
            Player.alternar();
        });
    },

    desenhar({ primeiraVez = false, manterRolagem = false } = {}) {
        const [caminho, busca = ''] = location.hash.replace(/^#/, '').split('?');
        const parametros = new URLSearchParams(busca);
        let rota = null;
        let encontrado = null;
        for (const item of ROTAS) {
            encontrado = caminho.match(item.padrao);
            if (encontrado) {
                rota = item;
                break;
            }
        }

        const area = document.querySelector('#area');
        const rolagem = area.scrollTop;
        const conteudo = document.querySelector('#conteudo');
        this.rotaAtual = rota?.nome || null;
        conteudo.replaceChildren(...(rota ? rota.pagina(encontrado, parametros) : Paginas.naoEncontrada()).filter(Boolean));
        Layout.marcarAtual();

        if (manterRolagem) {
            area.scrollTop = rolagem;
            return;
        }
        area.scrollTop = 0;
        if (this.rotaAtual === 'buscar') document.querySelector('#campo-busca').focus();
        // Leitores de tela passam a ler a página nova a partir do começo.
        else if (!primeiraVez) conteudo.focus({ preventScroll: true });
    }
};

App.iniciar();
