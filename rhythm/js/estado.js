// Dados do usuário guardados no localStorage (chaves "coolrhythm:*"):
// músicas curtidas, playlists criadas e preferências do player.
// Quem precisa saber de mudanças escuta com Estado.ao('curtidas', fn).
const Estado = {
    eventos: new EventTarget(),

    ler(chave, padrao) {
        try {
            const valor = localStorage.getItem(`coolrhythm:${chave}`);
            return valor == null ? padrao : JSON.parse(valor);
        } catch {
            return padrao;
        }
    },

    gravar(chave, valor) {
        try {
            localStorage.setItem(`coolrhythm:${chave}`, JSON.stringify(valor));
        } catch {
            // Navegação anônima ou armazenamento cheio: segue funcionando só nesta aba.
        }
    },

    ao(evento, funcao) {
        this.eventos.addEventListener(evento, funcao);
    },

    avisar(evento) {
        this.eventos.dispatchEvent(new Event(evento));
    },

    // ---------- Curtidas ----------
    curtidas() {
        return this.ler('curtidas', []).filter(id => Catalogo.musica(id));
    },

    curtida(id) {
        return this.curtidas().includes(id);
    },

    alternarCurtida(id) {
        const curtidas = this.curtidas();
        const agora = !curtidas.includes(id);
        // A mais recente fica no topo da lista.
        this.gravar('curtidas', agora ? [id, ...curtidas] : curtidas.filter(item => item !== id));
        this.avisar('curtidas');
        return agora;
    },

    // ---------- Playlists do usuário ----------
    playlists() {
        return this.ler('playlists', []).map(playlist => ({ ...playlist, propria: true }));
    },

    playlist(id) {
        return this.playlists().find(playlist => playlist.id === id);
    },

    salvarPlaylists(playlists) {
        this.gravar('playlists', playlists.map(({ propria, ...resto }) => resto));
        this.avisar('playlists');
    },

    criarPlaylist(nome) {
        const playlists = this.playlists();
        const playlist = {
            id: `minha-${Date.now().toString(36)}`,
            nome: nome.trim() || `Minha playlist nº ${playlists.length + 1}`,
            descricao: '',
            matiz: Math.floor(Math.random() * 360),
            musicas: [],
            propria: true
        };
        this.salvarPlaylists([playlist, ...playlists]);
        return playlist;
    },

    renomearPlaylist(id, nome) {
        this.salvarPlaylists(this.playlists().map(playlist =>
            playlist.id === id ? { ...playlist, nome: nome.trim() || playlist.nome } : playlist));
    },

    excluirPlaylist(id) {
        this.salvarPlaylists(this.playlists().filter(playlist => playlist.id !== id));
    },

    // Devolve false se a música já estava na playlist.
    adicionarNaPlaylist(id, musicaId) {
        let adicionou = false;
        this.salvarPlaylists(this.playlists().map(playlist => {
            if (playlist.id !== id || playlist.musicas.includes(musicaId)) return playlist;
            adicionou = true;
            return { ...playlist, musicas: [...playlist.musicas, musicaId] };
        }));
        return adicionou;
    },

    removerDaPlaylist(id, musicaId) {
        this.salvarPlaylists(this.playlists().map(playlist =>
            playlist.id === id ? { ...playlist, musicas: playlist.musicas.filter(item => item !== musicaId) } : playlist));
    },

    // ---------- Preferências do player ----------
    preferencias() {
        return { volume: .7, mudo: false, aleatorio: false, repetir: false, ultima: null, ...this.ler('player', {}) };
    },

    salvarPreferencias(mudancas) {
        this.gravar('player', { ...this.preferencias(), ...mudancas });
    }
};
