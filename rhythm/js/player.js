// Player: fila de músicas, controles e barra de progresso. O som vem do
// Sintetizador; aqui fica só a lógica de "o que toca agora".
// Avisa mudanças com o evento "mudou" em Player.eventos.
const Player = {
    eventos: new EventTarget(),
    fila: [],            // ids na ordem em que vão tocar
    filaOriginal: [],    // ordem da lista, para desligar o aleatório
    indice: -1,
    origem: null,        // de onde veio a fila, ex.: "playlist:rap"
    tocando: false,
    posicao: 0,
    arrastando: false,
    relogio: null,
    elementos: {},

    get atual() {
        return this.fila[this.indice] || null;
    },

    montar() {
        const prefs = Estado.preferencias();
        this.aleatorio = prefs.aleatorio;
        this.repetir = prefs.repetir;
        this.mudo = prefs.mudo;
        this.volume = prefs.volume;
        Sintetizador.definirVolume(this.mudo ? 0 : this.volume);

        const e = this.elementos;
        e.capa = Util.el('div', { class: 'capa' });
        e.titulo = Util.el('a', { class: 'player-titulo' }, 'Nada tocando');
        e.artistas = Util.el('span', { class: 'player-artistas' }, 'Escolha uma música para ouvir');
        e.curtir = Componentes.botaoIcone('coracao', 'Curtir', () => {
            const curtiu = Estado.alternarCurtida(this.atual);
            Util.notificar(curtiu ? 'Adicionada às Músicas curtidas' : 'Removida das Músicas curtidas');
        }, 'botao-curtir');

        e.aleatorio = Componentes.botaoIcone('aleatorio', 'Ordem aleatória', () => this.alternarAleatorio());
        e.anterior = Componentes.botaoIcone('anterior', 'Anterior', () => this.anterior());
        e.tocar = Util.el('button', { class: 'player-tocar', type: 'button', onclick: () => this.alternar() });
        e.proxima = Componentes.botaoIcone('proxima', 'Próxima', () => this.proxima());
        e.repetir = Componentes.botaoIcone('repetir', 'Repetir a lista', () => this.alternarRepetir());

        e.tempo = Util.el('span', {}, '0:00');
        e.progresso = Util.el('input', {
            class: 'barra', type: 'range', min: 0, max: Sintetizador.DURACAO, step: .1, value: 0,
            'aria-label': 'Posição da música',
            oninput: () => {
                this.arrastando = true;
                this.desenharProgresso(Number(e.progresso.value));
            },
            onchange: () => {
                this.arrastando = false;
                this.buscar(Number(e.progresso.value));
            }
        });
        e.duracao = Util.el('span', {}, Util.formatarTempo(Sintetizador.DURACAO));

        e.mudo = Componentes.botaoIcone('volume', 'Silenciar', () => this.alternarMudo());
        e.volume = Util.el('input', {
            class: 'barra player-volume', type: 'range', min: 0, max: 1, step: .01, value: this.volume,
            'aria-label': 'Volume',
            oninput: () => this.definirVolume(Number(e.volume.value))
        });

        document.querySelector('#player').append(
            Util.el('div', { class: 'player-musica' }, e.capa, Util.el('div', { class: 'player-info' }, e.titulo, e.artistas), e.curtir),
            Util.el('div', { class: 'player-centro' },
                Util.el('div', { class: 'player-controles' }, e.aleatorio, e.anterior, e.tocar, e.proxima, e.repetir),
                Util.el('div', { class: 'player-progresso' }, e.tempo, e.progresso, e.duracao)),
            Util.el('div', { class: 'player-extra' },
                Util.el('span', { class: 'selo', title: 'Não há arquivos de áudio: cada música toca uma prévia de 30 segundos criada pelo navegador.' }, 'Prévia gerada'),
                e.mudo, e.volume));

        Estado.ao('curtidas', () => this.desenharCurtida());

        // Volta com a última música ouvida, pausada no começo.
        if (prefs.ultima && Catalogo.musica(prefs.ultima)) this.carregarFila([prefs.ultima], 0, null);
        this.desenhar();
    },

    // ---------- Ações ----------
    tocarLista(ids, { origem = null, comecarEm = 0 } = {}) {
        if (!ids.length) return;
        this.carregarFila(ids, comecarEm, origem);
        this.iniciar(0);
    },

    carregarFila(ids, comecarEm, origem) {
        this.filaOriginal = [...ids];
        this.origem = origem;
        if (this.aleatorio) {
            const primeira = ids[comecarEm];
            this.fila = [primeira, ...Util.embaralhar(ids.filter((_, i) => i !== comecarEm))];
            this.indice = 0;
        } else {
            this.fila = [...ids];
            this.indice = comecarEm;
        }
        Sintetizador.carregar(Catalogo.musica(this.atual));
        this.posicao = 0;
    },

    iniciar(desde) {
        if (!this.atual) return;
        try {
            Sintetizador.tocar(desde);
        } catch (erro) {
            Util.notificar(erro.message);
            return;
        }
        this.posicao = desde;
        this.tocando = true;
        clearInterval(this.relogio);
        this.relogio = setInterval(() => this.passarTempo(), 100);
        Estado.salvarPreferencias({ ultima: this.atual });
        this.desenhar();
    },

    pausar() {
        if (!this.tocando) return;
        this.posicao = Sintetizador.posicao();
        Sintetizador.parar();
        this.tocando = false;
        clearInterval(this.relogio);
        this.desenhar();
    },

    alternar() {
        if (this.tocando) this.pausar();
        else this.iniciar(this.posicao >= Sintetizador.DURACAO ? 0 : this.posicao);
    },

    irPara(indice, tocar = true) {
        this.indice = indice;
        Sintetizador.carregar(Catalogo.musica(this.atual));
        this.posicao = 0;
        if (tocar) this.iniciar(0);
        else {
            this.tocando = false;
            clearInterval(this.relogio);
            this.desenhar();
        }
    },

    proxima() {
        if (this.indice < this.fila.length - 1) this.irPara(this.indice + 1, true);
        else if (this.repetir) this.irPara(0, true);
    },

    // Como nos apps de música: depois de 3 s, "anterior" volta ao começo da mesma.
    anterior() {
        const posicao = this.tocando ? Sintetizador.posicao() : this.posicao;
        if (posicao > 3 || this.indice === 0) this.buscar(0);
        else this.irPara(this.indice - 1, this.tocando);
    },

    buscar(segundos) {
        this.posicao = Math.min(segundos, Sintetizador.DURACAO);
        if (this.tocando) this.iniciar(this.posicao);
        else this.desenhar();
    },

    passarTempo() {
        if (!this.tocando) return;
        const posicao = Sintetizador.posicao();
        if (posicao >= Sintetizador.DURACAO) {
            this.terminou();
            return;
        }
        if (!this.arrastando) this.desenharProgresso(posicao);
    },

    terminou() {
        if (this.indice < this.fila.length - 1) this.irPara(this.indice + 1, true);
        else if (this.repetir) this.irPara(0, true);
        else {
            // Fim da fila: volta para o começo, pausado.
            Sintetizador.parar();
            this.irPara(this.indice, false);
        }
    },

    alternarAleatorio() {
        this.aleatorio = !this.aleatorio;
        Estado.salvarPreferencias({ aleatorio: this.aleatorio });
        if (this.atual) {
            const atual = this.atual;
            if (this.aleatorio) {
                this.fila = [atual, ...Util.embaralhar(this.filaOriginal.filter(id => id !== atual))];
                this.indice = 0;
            } else {
                this.fila = [...this.filaOriginal];
                this.indice = this.fila.indexOf(atual);
            }
        }
        this.desenhar();
    },

    alternarRepetir() {
        this.repetir = !this.repetir;
        Estado.salvarPreferencias({ repetir: this.repetir });
        this.desenhar();
    },

    definirVolume(volume) {
        this.volume = volume;
        this.mudo = volume === 0;
        Sintetizador.definirVolume(volume);
        Estado.salvarPreferencias({ volume, mudo: this.mudo });
        this.desenharVolume();
    },

    alternarMudo() {
        this.mudo = !this.mudo;
        if (!this.mudo && this.volume === 0) this.volume = .5;
        Sintetizador.definirVolume(this.mudo ? 0 : this.volume);
        Estado.salvarPreferencias({ mudo: this.mudo, volume: this.volume });
        this.desenharVolume();
    },

    // ---------- Tela ----------
    desenhar() {
        const e = this.elementos;
        const musica = Catalogo.musica(this.atual);

        if (musica && e.capa.dataset.musica !== musica.id) {
            const capa = Componentes.capaDaMusica(musica);
            capa.dataset.musica = musica.id;
            e.capa.replaceWith(capa);
            e.capa = capa;
        }
        if (musica) {
            e.titulo.textContent = musica.titulo;
            e.titulo.href = `#/artista/${musica.artistas[0]}`;
            e.artistas.replaceChildren(...Componentes.linksDosArtistas(musica));
        }

        e.tocar.replaceChildren(Icones.svg(this.tocando ? 'pausa' : 'play'));
        e.tocar.setAttribute('aria-label', this.tocando ? 'Pausar' : 'Tocar');
        e.tocar.disabled = !musica;
        e.anterior.disabled = !musica;
        e.proxima.disabled = !musica || (this.indice >= this.fila.length - 1 && !this.repetir);
        e.progresso.disabled = !musica;
        e.curtir.hidden = !musica;
        e.aleatorio.setAttribute('aria-pressed', this.aleatorio);
        e.repetir.setAttribute('aria-pressed', this.repetir);

        this.desenharCurtida();
        this.desenharProgresso(this.tocando ? Sintetizador.posicao() : this.posicao);
        this.desenharVolume();
        document.title = musica && this.tocando ? `${musica.titulo} · ${Catalogo.nomesDosArtistas(musica)}` : 'Cool Rhythm';
        this.eventos.dispatchEvent(new Event('mudou'));
    },

    desenharCurtida() {
        if (!this.atual) return;
        const curtida = Estado.curtida(this.atual);
        this.elementos.curtir.setAttribute('aria-pressed', curtida);
        this.elementos.curtir.setAttribute('aria-label', curtida ? 'Remover das Músicas curtidas' : 'Curtir');
    },

    desenharProgresso(posicao) {
        const e = this.elementos;
        e.progresso.value = posicao;
        e.progresso.style.setProperty('--preenchido', `${(posicao / Sintetizador.DURACAO) * 100}%`);
        e.tempo.textContent = Util.formatarTempo(posicao);
    },

    desenharVolume() {
        const e = this.elementos;
        const volume = this.mudo ? 0 : this.volume;
        e.volume.value = volume;
        e.volume.style.setProperty('--preenchido', `${volume * 100}%`);
        e.mudo.replaceChildren(Icones.svg(volume === 0 ? 'mudo' : 'volume'));
        e.mudo.setAttribute('aria-label', volume === 0 ? 'Ativar som' : 'Silenciar');
    }
};
