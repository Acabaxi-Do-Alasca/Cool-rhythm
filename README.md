# Cool Rhythm

App de música inspirado nos grandes serviços de streaming, feito com HTML, CSS e JavaScript puro, sem frameworks e sem servidor.

- **Início** com saudação pela hora do dia, artistas em destaque, playlists de foco, playlists do Cool Rhythm e novos lançamentos
- **Player** fixo: tocar/pausar, anterior/próxima, ordem aleatória, repetir a lista, barra de progresso, volume e silenciar (a barra de espaço também toca e pausa)
- **Buscar** músicas, artistas e playlists enquanto digita, sem diferenciar acentos ("sofrencia" acha "Sofrência")
- **Músicas curtidas**: o coração ao lado de cada música guarda ela na sua lista
- **Suas playlists**: criar, renomear, excluir, adicionar e tirar músicas
- **Páginas de artista e de playlist**, com a lista de músicas e o botão de tocar tudo
- **Responsivo**: no celular o menu lateral vira uma barra de navegação embaixo e o player fica compacto

## Como rodar

Abra `rhythm/front/index.html` no navegador. Ou sirva a pasta (mais parecido com o GitHub Pages):

```bash
python -m http.server 8000
```

e acesse <http://localhost:8000>. O `index.html` da raiz redireciona para o app.

## De onde vem o som

O projeto não tem arquivos de áudio (as músicas do catálogo são de artistas reais e têm direitos autorais). No lugar delas, cada música toca uma **prévia de 30 segundos gerada no navegador** pela Web Audio API: a partir do id da música saem sempre o mesmo tom, andamento, acordes, melodia e bateria, e o `estilo` da música (piano, pop, rap, rock, eletrônico, samba, sertanejo, trilha) decide o clima. O código está em `rhythm/js/sintetizador.js`.

## Onde ficam os dados

O catálogo (artistas, músicas e playlists) é fixo, em `rhythm/js/catalogo.js`. O que é do usuário (curtidas, playlists criadas, volume e última música ouvida) fica no `localStorage` do navegador, nas chaves `coolrhythm:*`. Cada navegador tem seus próprios dados, e limpar os dados do site apaga tudo.

**Inscrever-se** e **Entrar** ainda não têm tela: mostram um aviso de "próxima versão".

## Estrutura

```
index.html              redireciona para rhythm/front/index.html (útil no GitHub Pages)
rhythm/
  front/index.html      a única página; o conteúdo muda conforme o endereço (#/buscar, #/playlist/rap...)
  styles/
    tokens.css          cores, fontes, espaços e medidas (mude a identidade aqui)
    base.css            reset, tipografia e acessibilidade
    layout.css          menu lateral, barra do topo, área de conteúdo e navegação do celular
    componentes.css     botões, capas, cartões, lista de músicas, busca, diálogos e avisos
    player.css          player fixo embaixo
  js/
    util.js, icones.js  funções de apoio e ícones em SVG
    catalogo.js         artistas, músicas, playlists e o que aparece em cada seção do início
    estado.js           curtidas, playlists do usuário e preferências no localStorage
    sintetizador.js     gera e toca as prévias
    player.js           fila de músicas e controles do player
    componentes.js      peças de tela reaproveitadas (cartões, lista de músicas, diálogos)
    paginas.js          uma função por página
    layout.js           monta o menu lateral e a navegação do celular
    app.js              rotas e atalhos de teclado
  img/                  logo e fotos dos artistas e lançamentos
```

As páginas usam endereços com `#` para funcionar abrindo o arquivo direto e para a música continuar tocando enquanto você navega.

## Como mexer

- **Nova música**: adicione em `MUSICAS` (`catalogo.js`) com o id dos artistas. A página do artista acha as músicas dele sozinha. A `imagem` é opcional: sem ela a música usa a foto do artista ou uma capa gerada.
- **Nova playlist**: adicione em `PLAYLISTS` com um `matiz` (0 a 360) para a cor da capa, e coloque o id em `SECOES.coolRhythm` ou `SECOES.foco` para aparecer no início.
- **Nova página**: crie a função em `paginas.js` e a rota em `ROTAS` (`app.js`); para entrar no menu, adicione em `NAVEGACAO` (`layout.js`).
- **Nova identidade visual**: troque as cores em `styles/tokens.css` e o `img/logo.png`. O dourado atual (`--destaque`) foi tirado do logo.

## Pendências conhecidas

- Zedlav Nomar ainda não tem músicas no catálogo, então a página do artista aparece vazia.
- As fotos de artistas e lançamentos são pequenas (cerca de 90 a 135 px) e ficam um pouco borradas nas capas grandes; vale trocar por versões maiores.
