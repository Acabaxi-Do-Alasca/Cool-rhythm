// Uma função por rota. Cada uma devolve os elementos que vão para o <main>.
// As rotas ficam em app.js.
const Paginas = {
    inicio() {
        const destaques = SECOES.destaques.map(Catalogo.artista);
        const minhas = Estado.playlists();

        return [
            Util.el('h1', { class: 'saudacao' }, Util.saudacao()),
            Util.el('div', { class: 'atalhos' }, ...destaques.map(artista => Componentes.atalho({
                href: `#/artista/${artista.id}`,
                capa: Componentes.capa({ imagem: artista.imagem, nome: artista.nome, matiz: Componentes.matiz(artista.id) }),
                nome: artista.nome,
                botao: Componentes.botaoTocarColecao(`artista:${artista.id}`, artista.nome)
            }))),
            Util.el('div', { style: { height: 'var(--esp-6)' } }),
            minhas.length ? Componentes.secao('Suas playlists', minhas.map(playlist => Componentes.cartaoPlaylist(playlist)), { expansivel: true }) : null,
            Componentes.secao('Foco', SECOES.foco.map(id => Componentes.cartaoPlaylist(Catalogo.playlist(id)))),
            Componentes.secao('Playlists do Cool Rhythm', SECOES.coolRhythm.map(id => Componentes.cartaoPlaylist(Catalogo.playlist(id))), { expansivel: true }),
            Componentes.secao('Novos lançamentos',
                SECOES.lancamentos.map(id => Componentes.cartaoMusica(Catalogo.musica(id), SECOES.lancamentos, 'lancamentos')),
                { expansivel: true, larga: true })
        ];
    },

    buscar(parametros) {
        const resultados = Util.el('div');
        const campo = Util.el('input', {
            type: 'search',
            id: 'campo-busca',
            value: parametros.get('q') || '',
            placeholder: 'O que você quer ouvir?',
            autocomplete: 'off',
            'aria-label': 'Buscar músicas, artistas e playlists',
            oninput: () => {
                // Guarda o termo no endereço sem redesenhar a página inteira.
                const termo = campo.value.trim();
                history.replaceState(null, '', termo ? `#/buscar?q=${encodeURIComponent(termo)}` : '#/buscar');
                desenhar();
            }
        });

        const desenhar = () => {
            const termo = campo.value.trim();
            if (!termo) {
                resultados.replaceChildren(Componentes.secao('Navegar por todas', Util.el('div', { class: 'generos' },
                    ...PLAYLISTS.map(playlist => Util.el('a', { class: 'genero', href: `#/playlist/${playlist.id}`, style: { '--matiz': playlist.matiz } }, playlist.nome)))));
                return;
            }

            const { musicas, artistas, playlists } = Catalogo.buscar(termo);
            if (!musicas.length && !artistas.length && !playlists.length) {
                resultados.replaceChildren(Componentes.vazio('busca', `Nenhum resultado para "${termo}"`, 'Confira se a palavra está certa ou tente o nome de um artista.'));
                return;
            }
            const ids = musicas.slice(0, 10).map(musica => musica.id);
            resultados.replaceChildren(...[
                ids.length ? Componentes.secao('Músicas', Componentes.listaDeFaixas(ids, `busca:${termo}`)) : null,
                artistas.length ? Componentes.secao('Artistas', artistas.map(artista => Componentes.cartaoArtista(artista))) : null,
                playlists.length ? Componentes.secao('Playlists', playlists.map(playlist => Componentes.cartaoPlaylist(playlist))) : null
            ].filter(Boolean));
        };
        desenhar();

        return [
            Util.el('h1', { class: 'oculto' }, 'Buscar'),
            Util.el('div', { class: 'campo-busca', role: 'search' }, Icones.svg('busca'), campo),
            resultados
        ];
    },

    biblioteca() {
        const minhas = Estado.playlists();
        const artistas = ARTISTAS.filter(artista => artista.imagem);
        return [
            Util.el('div', { class: 'secao-cabecalho', style: { margin: 'var(--esp-4) 0 var(--esp-5)' } },
                Util.el('h1', { class: 'saudacao', style: { margin: 0 } }, 'Sua Biblioteca'),
                Util.el('button', { class: 'botao botao-contorno', type: 'button', onclick: () => Componentes.criarPlaylist() }, Icones.svg('mais'), 'Criar playlist')),
            Componentes.secao('Suas playlists', [Componentes.cartaoCurtidas(), ...minhas.map(playlist => Componentes.cartaoPlaylist(playlist))]),
            Componentes.secao('Playlists do Cool Rhythm', PLAYLISTS.map(playlist => Componentes.cartaoPlaylist(playlist))),
            Componentes.secao('Artistas', artistas.map(artista => Componentes.cartaoArtista(artista)))
        ];
    },

    curtidas() {
        const ids = Estado.curtidas();
        return [
            this.topo({
                capa: Componentes.capaDasCurtidas(),
                tipo: 'Playlist',
                titulo: 'Músicas curtidas',
                meta: Util.plural(ids.length, 'música'),
                matiz: 45
            }),
            this.acoes(45, ids.length ? Componentes.botaoTocarColecao('curtidas', 'Músicas curtidas', 'botao-play-grande') : null),
            ids.length
                ? Componentes.listaDeFaixas(ids, 'curtidas')
                : Componentes.vazio('coracao', 'As músicas que você curtir aparecem aqui', 'Toque no coração ao lado de uma música para guardá-la.', { href: '#/buscar', texto: 'Buscar músicas' })
        ];
    },

    playlist(id) {
        const playlist = Catalogo.qualquerPlaylist(id);
        if (!playlist) return this.naoEncontrada('Essa playlist não existe mais.');
        const chave = `playlist:${playlist.id}`;
        const tem = playlist.musicas.length > 0;

        const acoes = [tem ? Componentes.botaoTocarColecao(chave, playlist.nome, 'botao-play-grande') : null];
        if (playlist.propria) {
            acoes.push(
                Componentes.botaoIcone('lapis', 'Renomear playlist', () => Componentes.pedirNome({
                    titulo: 'Renomear playlist', valor: playlist.nome, botao: 'Salvar',
                    aoConfirmar: nome => Estado.renomearPlaylist(playlist.id, nome)
                })),
                Componentes.botaoIcone('lixeira', 'Excluir playlist', () => Componentes.confirmar({
                    titulo: 'Excluir playlist?',
                    texto: `"${playlist.nome}" sai da sua biblioteca. As músicas continuam no catálogo.`,
                    botao: 'Excluir',
                    aoConfirmar: () => {
                        if (Player.origem === chave) Player.origem = null;
                        Estado.excluirPlaylist(playlist.id);
                        Util.notificar('Playlist excluída');
                        location.hash = '#/biblioteca';
                    }
                })));
        }

        return [
            this.topo({
                capa: Componentes.capaDaPlaylist(playlist),
                tipo: playlist.propria ? 'Sua playlist' : 'Playlist',
                titulo: playlist.nome,
                descricao: playlist.descricao,
                meta: `${playlist.propria ? 'Você' : 'Cool Rhythm'} · ${Util.plural(playlist.musicas.length, 'música')}`,
                matiz: playlist.matiz
            }),
            this.acoes(playlist.matiz, ...acoes),
            tem
                ? Componentes.listaDeFaixas(playlist.musicas, chave, { playlistPropria: playlist.propria ? playlist : null })
                : Componentes.vazio('nota', 'Essa playlist está vazia', 'Use o botão + ao lado de qualquer música para colocá-la aqui.', { href: '#/buscar', texto: 'Buscar músicas' })
        ];
    },

    artista(id) {
        const artista = Catalogo.artista(id);
        if (!artista) return this.naoEncontrada('Não encontramos esse artista.');
        const ids = Catalogo.musicasDoArtista(id).map(musica => musica.id);
        const aparece = [...PLAYLISTS].filter(playlist => playlist.musicas.some(musica => ids.includes(musica)));

        return [
            this.topo({
                capa: Componentes.capaDoArtista(artista),
                tipo: 'Artista',
                titulo: artista.nome,
                descricao: artista.genero,
                meta: Util.plural(ids.length, 'música'),
                matiz: Componentes.matiz(artista.id)
            }),
            this.acoes(Componentes.matiz(artista.id), ids.length ? Componentes.botaoTocarColecao(`artista:${id}`, artista.nome, 'botao-play-grande') : null),
            ids.length
                ? Componentes.secao('Populares', Componentes.listaDeFaixas(ids, `artista:${id}`))
                : Componentes.vazio('nota', `Ainda não há músicas de ${artista.nome} no catálogo`, 'Elas vão aparecer aqui assim que forem adicionadas.'),
            aparece.length ? Componentes.secao('Aparece em', aparece.map(playlist => Componentes.cartaoPlaylist(playlist))) : null
        ];
    },

    naoEncontrada(texto = 'O endereço que você abriu não existe.') {
        return [Componentes.vazio('busca', 'Página não encontrada', texto, { href: '#/', texto: 'Voltar ao início' })];
    },

    // ---------- Partes das páginas de coleção ----------
    topo({ capa, tipo, titulo, descricao, meta, matiz }) {
        return Util.el('header', { class: 'colecao-topo', style: { '--matiz': matiz } },
            capa,
            Util.el('div', {},
                Util.el('p', { class: 'colecao-tipo' }, tipo),
                Util.el('h1', {}, titulo),
                descricao ? Util.el('p', { class: 'colecao-descricao' }, descricao) : null,
                Util.el('p', { class: 'colecao-meta' }, meta)));
    },

    acoes(matiz, ...botoes) {
        return Util.el('div', { class: 'colecao-acoes', style: { '--matiz': matiz } }, ...botoes);
    }
};
