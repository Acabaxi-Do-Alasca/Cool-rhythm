// Gera e toca, com a Web Audio API, uma prévia de 30 segundos para cada
// música. Não há arquivos de áudio no projeto: a partir do id da música
// sai sempre a mesma composição (tom, andamento, acordes, melodia e
// bateria), e o "estilo" do catálogo decide o clima.
const Sintetizador = {
    DURACAO: 30,

    // bpm: faixa de andamento; tonalidade: chance de ser menor;
    // timbres: onda de cada camada (null = camada desligada).
    ESTILOS: {
        piano: { bpm: [64, 78], menor: .5, melodia: 'piano', baixo: null, acordes: 'piano', bateria: null, arpejo: true },
        pop: { bpm: [100, 118], menor: .3, melodia: 'triangle', baixo: 'triangle', acordes: 'pad', bateria: 'pop' },
        rap: { bpm: [84, 94], menor: .9, melodia: 'sine', baixo: 'sine', acordes: 'pad', bateria: 'rap', esparsa: true },
        rock: { bpm: [110, 132], menor: .6, melodia: 'sawtooth', baixo: 'sawtooth', acordes: 'sawtooth', bateria: 'rock' },
        eletronico: { bpm: [118, 128], menor: .7, melodia: 'square', baixo: 'sawtooth', acordes: 'pad', bateria: 'eletronico' },
        samba: { bpm: [92, 104], menor: .2, melodia: 'triangle', baixo: 'triangle', acordes: 'piano', bateria: 'samba' },
        sertanejo: { bpm: [76, 92], menor: .4, melodia: 'triangle', baixo: 'triangle', acordes: 'piano', bateria: 'sertanejo' },
        trilha: { bpm: [88, 104], menor: .2, melodia: 'triangle', baixo: 'sine', acordes: 'pad', bateria: 'leve', arpejo: true }
    },

    // Batidas por compasso de 4 tempos (posição em tempos).
    BATERIAS: {
        pop: { bumbo: [0, 2, 2.5], caixa: [1, 3], chimbal: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5] },
        rap: { bumbo: [0, .75, 2.5], caixa: [1, 3], chimbal: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5] },
        rock: { bumbo: [0, 1.5, 2], caixa: [1, 3], chimbal: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5] },
        eletronico: { bumbo: [0, 1, 2, 3], caixa: [1, 3], chimbal: [.5, 1.5, 2.5, 3.5] },
        samba: { bumbo: [1, 3], caixa: [], chimbal: [0, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75] },
        sertanejo: { bumbo: [0, 2], caixa: [1, 3], chimbal: [.5, 1.5, 2.5, 3.5] },
        leve: { bumbo: [0], caixa: [], chimbal: [1, 3] }
    },

    ESCALA_MAIOR: [0, 2, 4, 5, 7, 9, 11],
    ESCALA_MENOR: [0, 2, 3, 5, 7, 8, 10],
    // Graus da escala (0 = tônica), um acorde por compasso.
    PROGRESSOES_MAIORES: [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 4], [5, 3, 0, 4]],
    PROGRESSOES_MENORES: [[0, 5, 2, 6], [0, 3, 4, 0], [0, 6, 5, 6], [0, 5, 3, 4]],

    contexto: null,
    saida: null,
    barramento: null,
    ruido: null,
    composicao: null,
    agendador: null,
    proximoEvento: 0,
    inicioNoContexto: 0,
    inicioNaMusica: 0,
    volume: .7,

    preparar() {
        if (this.contexto) return;
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) throw new Error('Este navegador não toca áudio gerado.');
        this.contexto = new Contexto();
        this.saida = this.contexto.createGain();
        this.saida.gain.value = this.volume * .5;
        this.saida.connect(this.contexto.destination);

        // Um segundo de ruído branco, reaproveitado pela caixa e pelo chimbal.
        const amostras = this.contexto.sampleRate;
        this.ruido = this.contexto.createBuffer(1, amostras, amostras);
        const canal = this.ruido.getChannelData(0);
        for (let i = 0; i < amostras; i++) canal[i] = Math.random() * 2 - 1;
    },

    definirVolume(volume) {
        this.volume = volume;
        if (this.saida) this.saida.gain.setTargetAtTime(volume * .5, this.contexto.currentTime, .02);
    },

    carregar(musica) {
        this.parar();
        this.composicao = this.compor(musica);
    },

    tocar(desde = 0) {
        this.preparar();
        if (this.contexto.state === 'suspended') this.contexto.resume();
        this.parar();

        this.barramento = this.contexto.createGain();
        this.barramento.connect(this.saida);
        this.inicioNoContexto = this.contexto.currentTime + .05;
        this.inicioNaMusica = desde;

        // Entrada suave e saída em fade nos últimos 2 segundos.
        const ganho = this.barramento.gain;
        ganho.setValueAtTime(0, this.inicioNoContexto);
        ganho.linearRampToValueAtTime(1, this.inicioNoContexto + .15);
        const fimDaMusica = this.inicioNoContexto + (this.DURACAO - desde);
        if (this.DURACAO - desde > 2) ganho.setValueAtTime(1, fimDaMusica - 2);
        ganho.linearRampToValueAtTime(0, fimDaMusica);

        const eventos = this.composicao.eventos;
        this.proximoEvento = eventos.findIndex(evento => evento.t >= desde);
        if (this.proximoEvento < 0) this.proximoEvento = eventos.length;
        this.agendar();
        this.agendador = setInterval(() => this.agendar(), 200);
    },

    // Agenda só o próximo pedaço (1,5 s) para pausar e pular sem atraso.
    agendar() {
        const eventos = this.composicao.eventos;
        const limite = this.posicao() + 1.5;
        while (this.proximoEvento < eventos.length && eventos[this.proximoEvento].t < limite) {
            const evento = eventos[this.proximoEvento++];
            const quando = this.inicioNoContexto + (evento.t - this.inicioNaMusica);
            if (evento.tipo === 'nota') this.nota(evento, quando);
            else this.batida(evento.tipo, quando, evento.volume);
        }
    },

    parar() {
        clearInterval(this.agendador);
        this.agendador = null;
        if (this.barramento) {
            const barramento = this.barramento;
            barramento.gain.cancelScheduledValues(this.contexto.currentTime);
            barramento.gain.setTargetAtTime(0, this.contexto.currentTime, .015);
            setTimeout(() => barramento.disconnect(), 120);
            this.barramento = null;
        }
    },

    // Segundos tocados desde o começo da prévia.
    posicao() {
        if (!this.barramento) return this.inicioNaMusica;
        return Math.max(this.inicioNaMusica, this.inicioNaMusica + this.contexto.currentTime - this.inicioNoContexto);
    },

    // ---------- Composição ----------
    compor(musica) {
        const sorteio = this.sorteador(Util.semente(musica.id));
        const estilo = this.ESTILOS[musica.estilo] || this.ESTILOS.pop;
        const menor = sorteio() < estilo.menor;
        const escala = menor ? this.ESCALA_MENOR : this.ESCALA_MAIOR;
        const progressoes = menor ? this.PROGRESSOES_MENORES : this.PROGRESSOES_MAIORES;
        const progressao = progressoes[Math.floor(sorteio() * progressoes.length)];
        const tonica = 55 + Math.floor(sorteio() * 9);   // de Sol a Mi, em MIDI
        const bpm = estilo.bpm[0] + Math.floor(sorteio() * (estilo.bpm[1] - estilo.bpm[0] + 1));
        const tempo = 60 / bpm;
        const compassos = Math.ceil(this.DURACAO / (tempo * 4));

        // Grau da escala (pode passar de 7) -> nota MIDI
        const notaDoGrau = grau => tonica + escala[((grau % 7) + 7) % 7] + 12 * Math.floor(grau / 7);

        // Um desenho rítmico para a melodia, repetido com variações.
        const ritmo = Array.from({ length: 8 }, (_, i) => sorteio() < (i % 2 === 0 ? .75 : (estilo.esparsa ? .15 : .4)));
        const eventos = [];
        let grauMelodia = 7 + Math.floor(sorteio() * 3);

        for (let compasso = 0; compasso < compassos; compasso++) {
            const inicio = compasso * 4 * tempo;
            const grau = progressao[compasso % progressao.length];
            const acorde = [grau, grau + 2, grau + 4].map(notaDoGrau);

            // Acordes
            if (estilo.acordes === 'piano') {
                for (const batida of [0, 2]) {
                    acorde.forEach(nota => eventos.push({ tipo: 'nota', t: inicio + batida * tempo, dur: tempo * 1.8, midi: nota, timbre: 'piano', volume: .07 }));
                }
            } else if (estilo.acordes) {
                acorde.forEach(nota => eventos.push({ tipo: 'nota', t: inicio, dur: tempo * 4, midi: nota, timbre: estilo.acordes, volume: estilo.acordes === 'pad' ? .05 : .025 }));
            }

            // Arpejo (piano e trilha) ou melodia
            if (estilo.arpejo) {
                const subida = [0, 1, 2, 1, 0, 1, 2, 3].map(passo => notaDoGrau(grau + 7 + passo * 2));
                subida.forEach((nota, i) => eventos.push({ tipo: 'nota', t: inicio + i * tempo / 2, dur: tempo, midi: nota, timbre: 'piano', volume: .09 }));
            }
            if (!estilo.arpejo || compasso % 2 === 1) {
                // A melodia tira folga a cada 4 compassos, como uma frase.
                if (compasso % 4 !== 3 || estilo.arpejo) {
                    ritmo.forEach((toca, i) => {
                        if (!toca || (compasso % 2 === 1 && sorteio() < .25)) return;
                        grauMelodia += Math.round((sorteio() - .5) * 4);
                        grauMelodia = Math.min(13, Math.max(5, grauMelodia));
                        // Nos tempos fortes, puxa a melodia para uma nota do acorde.
                        if (i % 4 === 0) grauMelodia = grau + 7 + [0, 2, 4][Math.floor(sorteio() * 3)];
                        eventos.push({ tipo: 'nota', t: inicio + i * tempo / 2, dur: tempo * .45, midi: notaDoGrau(grauMelodia) + 12, timbre: estilo.melodia, volume: estilo.melodia === 'square' || estilo.melodia === 'sawtooth' ? .035 : .07 });
                    });
                }
            }

            // Baixo
            if (estilo.baixo) {
                const raiz = notaDoGrau(grau) - 24;
                const quinta = notaDoGrau(grau + 4) - 24;
                const batidas = {
                    rock: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(b => [b, raiz]),
                    eletronico: [.5, 1.5, 2.5, 3.5].map(b => [b, raiz]),
                    samba: [[0, raiz], [1.5, quinta], [2, raiz], [3.5, quinta]],
                    sertanejo: [[0, raiz], [1, quinta], [2, raiz], [3, quinta]],
                    rap: [[0, raiz], [.75, raiz], [2.5, quinta]]
                }[estilo.bateria] || [[0, raiz], [2, raiz], [3.5, quinta]];
                batidas.forEach(([batida, nota]) => eventos.push({ tipo: 'nota', t: inicio + batida * tempo, dur: tempo * .9, midi: nota, timbre: 'baixo-' + estilo.baixo, volume: .16 }));
            }

            // Bateria (entra a partir do segundo compasso)
            const bateria = this.BATERIAS[estilo.bateria];
            if (bateria && compasso > 0) {
                bateria.bumbo.forEach(b => eventos.push({ tipo: 'bumbo', t: inicio + b * tempo, volume: .9 }));
                bateria.caixa.forEach(b => eventos.push({ tipo: 'caixa', t: inicio + b * tempo, volume: .35 }));
                bateria.chimbal.forEach((b, i) => eventos.push({ tipo: 'chimbal', t: inicio + b * tempo, volume: i % 2 === 0 ? .12 : .07 }));
            }
        }

        return {
            bpm,
            eventos: eventos.filter(evento => evento.t < this.DURACAO).sort((a, b) => a.t - b.t)
        };
    },

    // Gerador pseudoaleatório com semente (mulberry32).
    sorteador(semente) {
        return () => {
            semente = (semente + 0x6D2B79F5) | 0;
            let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    // ---------- Instrumentos ----------
    nota(evento, quando) {
        const ctx = this.contexto;
        const frequencia = 440 * Math.pow(2, (evento.midi - 69) / 12);
        const ganho = ctx.createGain();
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.connect(ganho);
        ganho.connect(this.barramento);

        const osciladores = [];
        let fim = quando + evento.dur;
        const g = ganho.gain;
        g.setValueAtTime(0, quando);

        if (evento.timbre === 'piano') {
            // Ataque rápido e decaimento longo, com um harmônico por cima.
            filtro.frequency.value = 3000;
            osciladores.push(this.oscilador('triangle', frequencia), this.oscilador('sine', frequencia * 2, .3));
            g.linearRampToValueAtTime(evento.volume, quando + .008);
            fim = quando + evento.dur + .9;
            g.exponentialRampToValueAtTime(.0001, fim);
        } else if (evento.timbre === 'pad') {
            filtro.frequency.value = 1400;
            osciladores.push(this.oscilador('triangle', frequencia), this.oscilador('sine', frequencia * 1.003));
            g.linearRampToValueAtTime(evento.volume, quando + .25);
            g.setValueAtTime(evento.volume, fim - .2);
            g.linearRampToValueAtTime(0, fim);
        } else if (evento.timbre.startsWith('baixo-')) {
            filtro.frequency.value = 600;
            osciladores.push(this.oscilador(evento.timbre.slice(6), frequencia));
            g.linearRampToValueAtTime(evento.volume, quando + .01);
            g.exponentialRampToValueAtTime(.0001, fim);
        } else {
            filtro.frequency.value = evento.timbre === 'sine' ? 4000 : 2600;
            osciladores.push(this.oscilador(evento.timbre, frequencia));
            g.linearRampToValueAtTime(evento.volume, quando + .015);
            g.setTargetAtTime(evento.volume * .6, quando + .05, .1);
            g.linearRampToValueAtTime(0, fim);
        }

        for (const { oscilador, ganho: mistura } of osciladores) {
            mistura.connect(filtro);
            oscilador.start(quando);
            oscilador.stop(fim + .05);
        }
    },

    oscilador(tipo, frequencia, volume = 1) {
        const oscilador = this.contexto.createOscillator();
        oscilador.type = tipo;
        oscilador.frequency.value = frequencia;
        const ganho = this.contexto.createGain();
        ganho.gain.value = volume;
        oscilador.connect(ganho);
        return { oscilador, ganho };
    },

    batida(tipo, quando, volume) {
        const ctx = this.contexto;
        const ganho = ctx.createGain();
        ganho.connect(this.barramento);

        if (tipo === 'bumbo') {
            // Seno que despenca de grave para mais grave.
            const oscilador = ctx.createOscillator();
            oscilador.frequency.setValueAtTime(140, quando);
            oscilador.frequency.exponentialRampToValueAtTime(42, quando + .12);
            ganho.gain.setValueAtTime(volume, quando);
            ganho.gain.exponentialRampToValueAtTime(.0001, quando + .35);
            oscilador.connect(ganho);
            oscilador.start(quando);
            oscilador.stop(quando + .4);
            return;
        }

        // Caixa e chimbal: ruído filtrado com envelope curto.
        const fonte = ctx.createBufferSource();
        fonte.buffer = this.ruido;
        const filtro = ctx.createBiquadFilter();
        filtro.type = tipo === 'caixa' ? 'bandpass' : 'highpass';
        filtro.frequency.value = tipo === 'caixa' ? 1800 : 7500;
        const duracao = tipo === 'caixa' ? .18 : .05;
        ganho.gain.setValueAtTime(volume, quando);
        ganho.gain.exponentialRampToValueAtTime(.0001, quando + duracao);
        fonte.connect(filtro);
        filtro.connect(ganho);
        fonte.start(quando, Math.random() * .5);
        fonte.stop(quando + duracao + .02);
    }
};
