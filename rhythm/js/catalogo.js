// Catálogo fixo do app: artistas, músicas e playlists do Cool Rhythm.
// Para incluir uma música, adicione-a em MUSICAS com o id dos artistas;
// a página do artista encontra as músicas dele sozinha.
//
// "estilo" escolhe o andamento e o timbre da prévia gerada no navegador
// (veja js/sintetizador.js). "imagem" é opcional: sem ela a música usa a
// foto do artista ou uma capa gerada.
const ARTISTAS = [
    { id: 'bruno-mars', nome: 'Bruno Mars', genero: 'Pop · R&B', imagem: 'bruno-mars.png' },
    { id: 'eminem', nome: 'Eminem', genero: 'Rap', imagem: 'eminem.png' },
    { id: 'pentakill', nome: 'Pentakill', genero: 'Heavy metal', imagem: 'pentakill.png' },
    { id: 'zedlav-nomar', nome: 'Zedlav Nomar', genero: '', imagem: 'zedlav-nomar.png' },
    { id: 'celldweller', nome: 'Celldweller', genero: 'Eletrônico · Rock industrial', imagem: 'celldweller.png' },
    { id: 'seu-jorge', nome: 'Seu Jorge', genero: 'MPB · Samba', imagem: 'seu-jorge.png' },
    { id: 'simone-mendes', nome: 'Simone Mendes', genero: 'Sertanejo' },
    { id: 'ludmilla', nome: 'Ludmilla', genero: 'Pagode · Funk' },
    { id: 'maiara-maraisa', nome: 'Maiara & Maraisa', genero: 'Sertanejo' },
    { id: 'henrique-juliano', nome: 'Henrique & Juliano', genero: 'Sertanejo' },
    { id: 'rosalia', nome: 'Rosalía', genero: 'Pop' },
    { id: 'rauw-alejandro', nome: 'Rauw Alejandro', genero: 'Reggaeton' },
    { id: 'ed-sheeran', nome: 'Ed Sheeran', genero: 'Pop' },
    { id: 'filipe-ret', nome: 'Filipe Ret', genero: 'Rap' },
    { id: 'dallas', nome: 'Dallas', genero: 'Rap' },
    { id: 'mark-ronson', nome: 'Mark Ronson', genero: 'Pop · Funk' },
    { id: 'idina-menzel', nome: 'Idina Menzel', genero: 'Trilha sonora' },
    { id: 'aulii-cravalho', nome: "Auli'i Cravalho", genero: 'Trilha sonora' },
    { id: 'elenco-encanto', nome: 'Elenco de Encanto', genero: 'Trilha sonora' },
    { id: 'samuel-e-wright', nome: 'Samuel E. Wright', genero: 'Trilha sonora' },
    { id: 'michael-jackson', nome: 'Michael Jackson', genero: 'Pop' },
    { id: 'a-ha', nome: 'a-ha', genero: 'Synth-pop' },
    { id: 'journey', nome: 'Journey', genero: 'Rock' },
    { id: 'guns-n-roses', nome: "Guns N' Roses", genero: 'Hard rock' },
    { id: 'queen', nome: 'Queen', genero: 'Rock' },
    { id: 'led-zeppelin', nome: 'Led Zeppelin', genero: 'Rock' },
    { id: 'eagles', nome: 'Eagles', genero: 'Rock' },
    { id: 'debussy', nome: 'Claude Debussy', genero: 'Clássica' },
    { id: 'beethoven', nome: 'Ludwig van Beethoven', genero: 'Clássica' },
    { id: 'pachelbel', nome: 'Johann Pachelbel', genero: 'Clássica' },
    { id: 'satie', nome: 'Erik Satie', genero: 'Clássica' },
    { id: 'ludovico-einaudi', nome: 'Ludovico Einaudi', genero: 'Piano' },
    { id: 'chitaozinho-xororo', nome: 'Chitãozinho & Xororó', genero: 'Sertanejo' },
    { id: 'the-weeknd', nome: 'The Weeknd', genero: 'Pop · R&B' }
];

const MUSICAS = [
    // Novos lançamentos
    { id: 'oi-erro', titulo: 'Oi Erro', artistas: ['simone-mendes'], estilo: 'sertanejo', imagem: 'oi-erro.png' },
    { id: 'brigas-demais', titulo: 'Brigas Demais', artistas: ['ludmilla'], estilo: 'samba', imagem: 'brigas-demais.png' },
    { id: 'escape', titulo: 'Escape', artistas: ['maiara-maraisa'], estilo: 'sertanejo', imagem: 'escape.png' },
    { id: 'rancorosa', titulo: 'Rancorosa', artistas: ['henrique-juliano'], estilo: 'sertanejo', imagem: 'rancorosa.png' },
    { id: 'beso', titulo: 'Beso', artistas: ['rosalia', 'rauw-alejandro'], estilo: 'pop', imagem: 'beso.png' },
    { id: 'eyes-closed', titulo: 'Eyes Closed', artistas: ['ed-sheeran'], estilo: 'pop', imagem: 'eyes-closed.png' },
    { id: 'deus-perdoa', titulo: 'Deus Perdoa', artistas: ['filipe-ret', 'dallas'], estilo: 'rap', imagem: 'deus-perdoa.png' },

    // Artistas em destaque
    { id: 'just-the-way-you-are', titulo: 'Just the Way You Are', artistas: ['bruno-mars'], estilo: 'pop' },
    { id: 'locked-out-of-heaven', titulo: 'Locked Out of Heaven', artistas: ['bruno-mars'], estilo: 'pop' },
    { id: 'thats-what-i-like', titulo: "That's What I Like", artistas: ['bruno-mars'], estilo: 'pop' },
    { id: '24k-magic', titulo: '24K Magic', artistas: ['bruno-mars'], estilo: 'pop' },
    { id: 'uptown-funk', titulo: 'Uptown Funk', artistas: ['mark-ronson', 'bruno-mars'], estilo: 'pop' },
    { id: 'lose-yourself', titulo: 'Lose Yourself', artistas: ['eminem'], estilo: 'rap' },
    { id: 'without-me', titulo: 'Without Me', artistas: ['eminem'], estilo: 'rap' },
    { id: 'the-real-slim-shady', titulo: 'The Real Slim Shady', artistas: ['eminem'], estilo: 'rap' },
    { id: 'mockingbird', titulo: 'Mockingbird', artistas: ['eminem'], estilo: 'rap' },
    { id: 'mortal-reminder', titulo: 'Mortal Reminder', artistas: ['pentakill'], estilo: 'rock' },
    { id: 'lightbringer', titulo: 'Lightbringer', artistas: ['pentakill'], estilo: 'rock' },
    { id: 'deathfire-grasp', titulo: 'Deathfire Grasp', artistas: ['pentakill'], estilo: 'rock' },
    { id: 'switchback', titulo: 'Switchback', artistas: ['celldweller'], estilo: 'eletronico' },
    { id: 'own-little-world', titulo: 'Own Little World', artistas: ['celldweller'], estilo: 'eletronico' },
    { id: 'frozen', titulo: 'Frozen', artistas: ['celldweller'], estilo: 'eletronico' },
    { id: 'burguesinha', titulo: 'Burguesinha', artistas: ['seu-jorge'], estilo: 'samba' },
    { id: 'carolina', titulo: 'Carolina', artistas: ['seu-jorge'], estilo: 'samba' },
    { id: 'amiga-da-minha-mulher', titulo: 'Amiga da Minha Mulher', artistas: ['seu-jorge'], estilo: 'samba' },
    { id: 'mina-do-condominio', titulo: 'Mina do Condomínio', artistas: ['seu-jorge'], estilo: 'samba' },

    // Playlists
    { id: 'let-it-go', titulo: 'Let It Go', artistas: ['idina-menzel'], estilo: 'trilha' },
    { id: 'how-far-ill-go', titulo: "How Far I'll Go", artistas: ['aulii-cravalho'], estilo: 'trilha' },
    { id: 'we-dont-talk-about-bruno', titulo: "We Don't Talk About Bruno", artistas: ['elenco-encanto'], estilo: 'trilha' },
    { id: 'under-the-sea', titulo: 'Under the Sea', artistas: ['samuel-e-wright'], estilo: 'trilha' },
    { id: 'billie-jean', titulo: 'Billie Jean', artistas: ['michael-jackson'], estilo: 'pop' },
    { id: 'take-on-me', titulo: 'Take On Me', artistas: ['a-ha'], estilo: 'eletronico' },
    { id: 'dont-stop-believin', titulo: "Don't Stop Believin'", artistas: ['journey'], estilo: 'rock' },
    { id: 'sweet-child-o-mine', titulo: "Sweet Child O' Mine", artistas: ['guns-n-roses'], estilo: 'rock' },
    { id: 'bohemian-rhapsody', titulo: 'Bohemian Rhapsody', artistas: ['queen'], estilo: 'rock' },
    { id: 'stairway-to-heaven', titulo: 'Stairway to Heaven', artistas: ['led-zeppelin'], estilo: 'rock' },
    { id: 'hotel-california', titulo: 'Hotel California', artistas: ['eagles'], estilo: 'rock' },
    { id: 'clair-de-lune', titulo: 'Clair de Lune', artistas: ['debussy'], estilo: 'piano' },
    { id: 'fur-elise', titulo: 'Für Elise', artistas: ['beethoven'], estilo: 'piano' },
    { id: 'canone-em-re', titulo: 'Cânone em Ré', artistas: ['pachelbel'], estilo: 'piano' },
    { id: 'gymnopedie-1', titulo: 'Gymnopédie nº 1', artistas: ['satie'], estilo: 'piano' },
    { id: 'nuvole-bianche', titulo: 'Nuvole Bianche', artistas: ['ludovico-einaudi'], estilo: 'piano' },
    { id: 'experience', titulo: 'Experience', artistas: ['ludovico-einaudi'], estilo: 'piano' },
    { id: 'evidencias', titulo: 'Evidências', artistas: ['chitaozinho-xororo'], estilo: 'sertanejo' },
    { id: 'blinding-lights', titulo: 'Blinding Lights', artistas: ['the-weeknd'], estilo: 'eletronico' },
    { id: 'shape-of-you', titulo: 'Shape of You', artistas: ['ed-sheeran'], estilo: 'pop' }
];

// "matiz" (0 a 360) é a cor da capa gerada e do topo da página da playlist.
const PLAYLISTS = [
    { id: 'disney', nome: 'Músicas da Disney', matiz: 205, descricao: 'Para cantar junto com as animações.',
        musicas: ['let-it-go', 'how-far-ill-go', 'we-dont-talk-about-bruno', 'under-the-sea'] },
    { id: 'sertanejo-sofrencia', nome: 'Sertanejo Sofrência', matiz: 20, descricao: 'Modão para chorar no copo.',
        musicas: ['oi-erro', 'escape', 'rancorosa', 'evidencias'] },
    { id: 'rap', nome: 'Rap', matiz: 0, descricao: 'Rimas pesadas, nacionais e gringas.',
        musicas: ['lose-yourself', 'without-me', 'deus-perdoa', 'the-real-slim-shady', 'mockingbird'] },
    { id: 'pop', nome: 'Pop', matiz: 320, descricao: 'Os refrões que não saem da cabeça.',
        musicas: ['eyes-closed', 'beso', 'thats-what-i-like', 'uptown-funk', 'shape-of-you', 'just-the-way-you-are'] },
    { id: 'rock-classico', nome: 'Rock Clássico', matiz: 270, descricao: 'Os solos que atravessaram gerações.',
        musicas: ['bohemian-rhapsody', 'stairway-to-heaven', 'hotel-california', 'sweet-child-o-mine'] },
    { id: 'mais-tocadas', nome: 'As mais tocadas no mundo', matiz: 140, descricao: 'O que o planeta está ouvindo.',
        musicas: ['blinding-lights', 'shape-of-you', 'uptown-funk', 'billie-jean', 'lose-yourself'] },
    { id: 'anos-80', nome: 'Mix dos anos 80', matiz: 290, descricao: 'Sintetizador, cabelo armado e muita energia.',
        musicas: ['billie-jean', 'take-on-me', 'dont-stop-believin', 'sweet-child-o-mine'] },
    { id: 'classicas', nome: 'Clássicas', matiz: 35, descricao: 'Os grandes compositores para ouvir com calma.',
        musicas: ['clair-de-lune', 'fur-elise', 'canone-em-re', 'gymnopedie-1'] },
    { id: 'piano-tranquilo', nome: 'Piano Tranquilo', matiz: 190, descricao: 'Relaxe com peças suaves de piano.',
        musicas: ['nuvole-bianche', 'experience', 'gymnopedie-1', 'clair-de-lune'] },
    { id: 'eletronico-foco', nome: 'Eletrônico para Focar', matiz: 230, descricao: 'Batida constante para não perder o ritmo.',
        musicas: ['switchback', 'own-little-world', 'frozen', 'take-on-me'] }
];

// O que aparece em cada seção da página inicial.
const SECOES = {
    destaques: ['bruno-mars', 'eminem', 'pentakill', 'zedlav-nomar', 'celldweller', 'seu-jorge'],
    foco: ['piano-tranquilo', 'eletronico-foco', 'classicas'],
    coolRhythm: ['disney', 'sertanejo-sofrencia', 'rap', 'pop', 'rock-classico', 'mais-tocadas', 'anos-80', 'classicas'],
    lancamentos: ['oi-erro', 'brigas-demais', 'escape', 'rancorosa', 'beso', 'eyes-closed', 'deus-perdoa']
};

const Catalogo = {
    artista: id => ARTISTAS.find(artista => artista.id === id),
    musica: id => MUSICAS.find(musica => musica.id === id),
    playlist: id => PLAYLISTS.find(playlist => playlist.id === id),

    musicasDoArtista: id => MUSICAS.filter(musica => musica.artistas.includes(id)),

    nomesDosArtistas: musica => musica.artistas.map(id => Catalogo.artista(id)?.nome).filter(Boolean).join(', '),

    // Imagem da música, ou a do primeiro artista que tiver foto.
    imagemDaMusica(musica) {
        if (musica.imagem) return musica.imagem;
        return musica.artistas.map(id => Catalogo.artista(id)?.imagem).find(Boolean) || null;
    },

    // Playlist do catálogo ou criada pelo usuário.
    qualquerPlaylist: id => Catalogo.playlist(id) || Estado.playlist(id),

    // Ids das músicas de uma coleção: "playlist:rap", "artista:eminem", "curtidas".
    musicasDaColecao(chave) {
        const [tipo, id] = chave.split(':');
        if (tipo === 'curtidas') return Estado.curtidas();
        if (tipo === 'artista') return Catalogo.musicasDoArtista(id).map(musica => musica.id);
        if (tipo === 'playlist') return Catalogo.qualquerPlaylist(id)?.musicas || [];
        if (tipo === 'lancamentos') return SECOES.lancamentos;
        return [];
    },

    buscar(termo) {
        const alvo = Util.normalizar(termo);
        if (!alvo) return { musicas: [], artistas: [], playlists: [] };
        const contem = texto => Util.normalizar(texto).includes(alvo);
        return {
            musicas: MUSICAS.filter(musica => contem(musica.titulo) || contem(Catalogo.nomesDosArtistas(musica))),
            artistas: ARTISTAS.filter(artista => contem(artista.nome) || contem(artista.genero)),
            playlists: [...Estado.playlists(), ...PLAYLISTS].filter(playlist => contem(playlist.nome) || contem(playlist.descricao || ''))
        };
    }
};
