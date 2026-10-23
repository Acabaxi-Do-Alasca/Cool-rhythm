// Peças de tela reaproveitadas pelas páginas: capas, cartões, botões de
// tocar, lista de músicas e diálogos.
const Componentes = {
    // Elementos que mudam quando o player, as curtidas ou as playlists mudam.
    // Cada um registra a própria função de atualizar; os que saíram da tela
    // são descartados na próxima rodada.
    observados: [],

    observar(elemento, atualizar) {
        this.observados.push({ elemento, atualizar });
        atualizar(elemento);
        return elemento;
    },

    sincronizar() {
        this.observados = this.observados.filter(({ elemento }) => elemento.isConnected);
        this.observados.forEach(({ elemento, atualizar }) => atualizar(elemento));
    },

    // ---------- Botões ----------
    botaoIcone(icone, rotulo, acao, classeExtra = '') {
        return Util.el('button', { class: `botao-icone ${classeExtra}`.trim(), type: 'button', 'aria-label': rotulo, title: rotulo, onclick: acao },
            Icones.svg(icone));
    },

    // Botão redondo dourado que toca (ou pausa) uma coleção inteira.
    botaoTocarColecao(chave, nome, classeExtra = '') {
        const botao = Util.el('button', {
            class: `botao-play ${classeExtra}`.trim(),
            type: 'button',
            onclick: evento => {
                evento.stopPropagation();
                if (Player.origem === chave) return Player.alternar();
                const ids = Catalogo.musicasDaColecao(chave);
                if (!ids.length) return Util.notificar('Essa lista ainda não tem músicas.');
                Player.tocarLista(ids, { origem: chave });
            }
        });
        return this.observar(botao, elemento => {
            const ativo = Player.origem === chave && Player.tocando;
            elemento.replaceChildren(Icones.svg(ativo ? 'pausa' : 'play'));
            elemento.setAttribute('aria-label', `${ativo ? 'Pausar' : 'Tocar'} ${nome}`);
            elemento.classList.toggle('tocando', ativo);
        });
    },

    // Botão que toca uma música dentro de uma lista (a lista vira a fila).
    botaoTocarMusica(musica, ids, origem, classe = 'botao-play') {
        const botao = Util.el('button', {
            class: classe,
            type: 'button',
            onclick: evento => {
                evento.stopPropagation();
                Componentes.tocarDaLista(musica.id, ids, origem);
            }
        });
        return this.observar(botao, elemento => {
            const ativo = Player.atual === musica.id && Player.tocando;
            elemento.replaceChildren(Icones.svg(ativo ? 'pausa' : 'play'));
            elemento.setAttribute('aria-label', `${ativo ? 'Pausar' : 'Tocar'} ${musica.titulo}`);
            elemento.classList.toggle('tocando', ativo);
        });
    },

    tocarDaLista(id, ids, origem) {
        if (Player.atual === id && Player.origem === origem) return Player.alternar();
        Player.tocarLista(ids, { origem, comecarEm: Math.max(0, ids.indexOf(id)) });
    },

    botaoCurtir(musica) {
        const botao = this.botaoIcone('coracao', 'Curtir', () => {
            const curtiu = Estado.alternarCurtida(musica.id);
            Util.notificar(curtiu ? 'Adicionada às Músicas curtidas' : 'Removida das Músicas curtidas');
        }, 'botao-curtir');
        return this.observar(botao, elemento => {
            const curtida = Estado.curtida(musica.id);
            elemento.setAttribute('aria-pressed', curtida);
            elemento.setAttribute('aria-label', curtida ? `Remover ${musica.titulo} das curtidas` : `Curtir ${musica.titulo}`);
            elemento.title = curtida ? 'Remover das Músicas curtidas' : 'Curtir';
        });
    },

    // ---------- Capas ----------
    matiz: id => Util.semente(id) % 360,

    capa({ imagem, nome, matiz, redonda = false, alt = '' }) {
        const classes = ['capa', redonda && 'capa-redonda', !imagem && 'capa-gerada'].filter(Boolean).join(' ');
        if (imagem) {
            return Util.el('div', { class: classes },
                Util.el('img', { src: `../img/${imagem}`, alt, loading: 'lazy', width: 160, height: 160 }));
        }
        return Util.el('div', { class: classes, style: { '--matiz': matiz }, 'aria-hidden': 'true' }, nome);
    },

    capaDaMusica(musica) {
        return this.capa({ imagem: Catalogo.imagemDaMusica(musica), nome: musica.titulo, matiz: this.matiz(musica.id) });
    },

    capaDoArtista(artista) {
        return this.capa({ imagem: artista.imagem, nome: artista.nome, matiz: this.matiz(artista.id), redonda: true });
    },

    capaDaPlaylist(playlist) {
        return this.capa({ nome: playlist.nome, matiz: playlist.matiz });
    },

    capaDasCurtidas() {
        return Util.el('div', { class: 'capa capa-gerada capa-curtidas', 'aria-hidden': 'true' }, Icones.svg('coracao'));
    },

    linksDosArtistas(musica) {
        const links = [];
        musica.artistas.forEach((id, i) => {
            const artista = Catalogo.artista(id);
            if (!artista) return;
            if (i > 0) links.push(', ');
            links.push(Util.el('a', { href: `#/artista/${id}` }, artista.nome));
        });
        return links;
    },

    // ---------- Cartões ----------
    cartaoPlaylist(playlist) {
        const descricao = playlist.propria ? `Playlist · ${Util.plural(playlist.musicas.length, 'música')}` : playlist.descricao;
        return Util.el('article', { class: 'cartao' },
            Util.el('div', { class: 'cartao-capa' }, this.capaDaPlaylist(playlist), this.botaoTocarColecao(`playlist:${playlist.id}`, playlist.nome)),
            Util.el('h3', {}, Util.el('a', { class: 'cartao-link', href: `#/playlist/${playlist.id}` }, playlist.nome)),
            Util.el('p', {}, descricao));
    },

    cartaoCurtidas() {
        const total = Estado.curtidas().length;
        return Util.el('article', { class: 'cartao' },
            Util.el('div', { class: 'cartao-capa' }, this.capaDasCurtidas(), this.botaoTocarColecao('curtidas', 'Músicas curtidas')),
            Util.el('h3', {}, Util.el('a', { class: 'cartao-link', href: '#/curtidas' }, 'Músicas curtidas')),
            Util.el('p', {}, `Playlist · ${Util.plural(total, 'música')}`));
    },

    cartaoArtista(artista) {
        return Util.el('article', { class: 'cartao' },
            Util.el('div', { class: 'cartao-capa' }, this.capaDoArtista(artista), this.botaoTocarColecao(`artista:${artista.id}`, artista.nome)),
            Util.el('h3', {}, Util.el('a', { class: 'cartao-link', href: `#/artista/${artista.id}` }, artista.nome)),
            Util.el('p', {}, 'Artista'));
    },

    cartaoMusica(musica, ids, origem) {
        return Util.el('article', { class: 'cartao cartao-largo' },
            Util.el('div', { class: 'cartao-capa' }, this.capaDaMusica(musica), this.botaoTocarMusica(musica, ids, origem)),
            Util.el('h3', {}, Util.el('a', { class: 'cartao-link', href: `#/artista/${musica.artistas[0]}` }, musica.titulo)),
            Util.el('p', {}, ...this.linksDosArtistas(musica)));
    },

    // Atalho horizontal do topo da página inicial.
    atalho({ href, capa, nome, botao }) {
        return Util.el('div', { class: 'atalho' }, capa, Util.el('a', { href }, nome), botao);
    },

    // ---------- Seções ----------
    // "itens" é uma lista de cartões (vira grade) ou um elemento pronto.
    // Com "expansivel", os cartões ficam numa fileira que rola para o lado
    // e o botão "Mostrar tudo" abre tudo em grade.
    secao(titulo, itens, { expansivel = false, larga = false, link = null } = {}) {
        const id = `secao-${Util.semente(titulo)}`;
        const cabecalho = Util.el('div', { class: 'secao-cabecalho' }, Util.el('h2', { id }, titulo));
        const lista = Array.isArray(itens)
            ? Util.el('div', { class: expansivel ? `fileira${larga ? ' fileira-larga' : ''}` : 'grade' }, ...itens)
            : itens;

        if (link) cabecalho.append(Util.el('a', { href: link.href }, link.texto));
        // Com poucos itens não há o que abrir.
        if (expansivel && itens.length > 4) {
            cabecalho.append(Util.el('button', {
                type: 'button',
                'aria-expanded': 'false',
                onclick: evento => {
                    const aberta = lista.classList.toggle('expandida');
                    evento.currentTarget.textContent = aberta ? 'Mostrar menos' : 'Mostrar tudo';
                    evento.currentTarget.setAttribute('aria-expanded', aberta);
                }
            }, 'Mostrar tudo'));
        }
        return Util.el('section', { class: 'secao', 'aria-labelledby': id }, cabecalho, lista);
    },

    vazio(icone, titulo, texto, acao) {
        return Util.el('div', { class: 'vazio' },
            Icones.svg(icone),
            Util.el('strong', {}, titulo),
            Util.el('p', {}, texto),
            acao ? Util.el('a', { class: 'botao botao-claro', href: acao.href }, acao.texto) : null);
    },

    // ---------- Lista de músicas ----------
    // opcoes.playlistPropria: mostra o botão de tirar a música da playlist.
    listaDeFaixas(ids, origem, { playlistPropria = null } = {}) {
        const musicas = ids.map(id => Catalogo.musica(id)).filter(Boolean);
        return Util.el('ol', { class: 'faixas' }, ...musicas.map((musica, i) => {
            const indice = Util.el('span', { class: 'faixa-indice' }, String(i + 1));
            const numero = Util.el('span', { class: 'faixa-numero' }, indice, this.botaoTocarMusica(musica, ids, origem, 'faixa-tocar'));

            const acoes = Util.el('div', { class: 'faixa-acoes' },
                this.botaoCurtir(musica),
                this.botaoIcone('adicionar', `Adicionar ${musica.titulo} a uma playlist`, () => this.escolherPlaylist(musica)));
            if (playlistPropria) {
                acoes.append(this.botaoIcone('remover', `Tirar ${musica.titulo} desta playlist`, () => {
                    Estado.removerDaPlaylist(playlistPropria.id, musica.id);
                    Util.notificar(`Removida de ${playlistPropria.nome}`);
                }));
            }

            const linha = Util.el('li', {
                class: 'faixa',
                // Dois cliques na linha tocam a música (como nos apps de desktop).
                ondblclick: evento => {
                    if (!evento.target.closest('a, button')) this.tocarDaLista(musica.id, ids, origem);
                }
            },
                numero,
                this.capaDaMusica(musica),
                Util.el('div', { class: 'faixa-info' },
                    Util.el('span', { class: 'faixa-titulo' }, musica.titulo),
                    Util.el('span', { class: 'faixa-artistas' }, ...this.linksDosArtistas(musica))),
                acoes);

            // No celular, tocar na linha já toca a música.
            linha.addEventListener('click', evento => {
                if (matchMedia('(hover: none)').matches && !evento.target.closest('a, button')) this.tocarDaLista(musica.id, ids, origem);
            });

            return this.observar(linha, elemento => {
                const atual = Player.atual === musica.id;
                elemento.classList.toggle('tocando', atual);
                const equalizador = numero.querySelector('.equalizador');
                if (atual && !equalizador) {
                    indice.replaceWith(Util.el('span', { class: 'equalizador faixa-indice', 'aria-hidden': 'true' }, Util.el('i'), Util.el('i'), Util.el('i')));
                } else if (!atual && equalizador) {
                    equalizador.replaceWith(indice);
                }
                numero.querySelector('.equalizador')?.classList.toggle('pausado', !Player.tocando);
            });
        }));
    },

    // ---------- Diálogos ----------
    abrirDialogo(...conteudo) {
        const dialogo = document.querySelector('#dialogo');
        dialogo.replaceChildren(...conteudo);
        dialogo.showModal();
        return dialogo;
    },

    fecharDialogo() {
        document.querySelector('#dialogo').close();
    },

    // Diálogo com um campo de nome (criar e renomear playlist).
    pedirNome({ titulo, valor = '', botao, aoConfirmar }) {
        const campo = Util.el('input', { type: 'text', id: 'campo-nome', name: 'nome', value: valor, maxlength: 80, autocomplete: 'off', placeholder: 'Minha playlist' });
        const form = Util.el('form', {
            onsubmit: evento => {
                evento.preventDefault();
                this.fecharDialogo();
                aoConfirmar(campo.value);
            }
        },
            Util.el('h2', {}, titulo),
            Util.el('label', { for: 'campo-nome' }, 'Nome'),
            campo,
            Util.el('div', { class: 'dialogo-botoes' },
                Util.el('button', { class: 'botao botao-texto', type: 'button', onclick: () => this.fecharDialogo() }, 'Cancelar'),
                Util.el('button', { class: 'botao botao-destaque', type: 'submit' }, botao)));
        this.abrirDialogo(form);
        campo.select();
    },

    confirmar({ titulo, texto, botao, aoConfirmar }) {
        this.abrirDialogo(
            Util.el('h2', {}, titulo),
            Util.el('p', {}, texto),
            Util.el('div', { class: 'dialogo-botoes' },
                Util.el('button', { class: 'botao botao-texto', type: 'button', onclick: () => this.fecharDialogo() }, 'Cancelar'),
                Util.el('button', { class: 'botao botao-destaque', type: 'button', onclick: () => { this.fecharDialogo(); aoConfirmar(); } }, botao)));
    },

    criarPlaylist(musicaInicial = null) {
        this.pedirNome({
            titulo: 'Criar playlist',
            valor: `Minha playlist nº ${Estado.playlists().length + 1}`,
            botao: 'Criar',
            aoConfirmar: nome => {
                const playlist = Estado.criarPlaylist(nome);
                if (musicaInicial) {
                    Estado.adicionarNaPlaylist(playlist.id, musicaInicial.id);
                    Util.notificar(`Adicionada a ${playlist.nome}`);
                } else {
                    location.hash = `#/playlist/${playlist.id}`;
                }
            }
        });
    },

    escolherPlaylist(musica) {
        const playlists = Estado.playlists();
        const opcoes = playlists.map(playlist => Util.el('button', {
            type: 'button',
            onclick: () => {
                this.fecharDialogo();
                const adicionou = Estado.adicionarNaPlaylist(playlist.id, musica.id);
                Util.notificar(adicionou ? `Adicionada a ${playlist.nome}` : `Essa música já está em ${playlist.nome}`);
            }
        },
            this.capaDaPlaylist(playlist),
            Util.el('span', {}, playlist.nome, Util.el('small', {}, Util.plural(playlist.musicas.length, 'música')))));

        this.abrirDialogo(
            Util.el('h2', {}, `Adicionar "${musica.titulo}"`),
            opcoes.length ? Util.el('div', { class: 'dialogo-lista' }, ...opcoes) : Util.el('p', { class: 'colecao-descricao' }, 'Você ainda não tem playlists.'),
            Util.el('div', { class: 'dialogo-botoes' },
                Util.el('button', { class: 'botao botao-texto', type: 'button', onclick: () => this.fecharDialogo() }, 'Cancelar'),
                Util.el('button', { class: 'botao botao-destaque', type: 'button', onclick: () => this.criarPlaylist(musica) }, Icones.svg('mais'), 'Nova playlist')));
    }
};

Player.eventos.addEventListener('mudou', () => Componentes.sincronizar());
Estado.ao('curtidas', () => Componentes.sincronizar());
