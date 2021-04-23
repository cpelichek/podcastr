// Context API é uma funcionalidade do React que permite compartilhar dados entre componentes da nossa aplicação
// Isso serve para lidar com o desafio de fazer um evento que acontece em um componente (um click em um botão "play", por exemplo) ser ouvido por outro componente (um aúdio começar a tocar)
import { createContext, ReactNode, useContext, useState } from "react";

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

type PlayerContextData = {
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  play: (episode: Episode) => void;
  playList: (list: Episode[], index: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
  clearPlayerState: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

// O valor default definido na chamada da função createContext() não é muito utilizado, serve mais para dar o formato que esperamos receber do value dos componentes envolvidos nesse contexto pelo "NomeDoContexto.Provider", exemplo: createContext({ episodeList: [], currentEpisodeIndex: 0, }) , porém nós usamos o createContext({} as PlayerContextData) que é um hack do typescript que "simula" ou "faz uma atribuição forçada" ao objeto, dizendo que esse {} tem a mesma estrutura que PlayerContextData, fazendo com que o PlayerContext tenha exatamente o formato do PlayerContextData. O bom disso é que quando formos importar os dados de dentro do player, quando fizermos uma desestruturação, exemplo const {  } = useContext(PlayerContext), nós podemos dentro do espaço em  {  } usar o atalho de teclado Ctrl+barraDeEspaço para enxergar o que é esperado dentro do PlayerContextData, no nosso caso episodeList e currentEpisodeIndex.
export const PlayerContext = createContext({} as PlayerContextData);

// Antes o PlayerContext.Provider estava inserido direto no _app.tsx, porém removemos de lá e colocamos aqui pensando que no futuro podemos ter mais de um contexto, por exemplo de autenticação de usuário, e assim é mais fácil de dar manutenção se não deixarmos diferentes contextos com suas variáveis e métodos misturados, e não passamos um value gigante dentro do app pois estamos agora abstraindo isso dentro do próprio contexto que estamos exportando. Tivemos também que alterar a extensão deste arquivo, de .ts para .tsx.
// Temos que passar um children dentro do PlayerContextProvider pois do contrário a tag seria fechada nela mesma e não poderíamos inserir html dentro. Também acrescentamos essa children, que é do tipo ReactNode, na tipagem do nosso Provider
type PlayerContextProviderProps = {
  children: ReactNode;
};

export function PlayerContextProvider({
  children,
}: PlayerContextProviderProps) {
  // pra conseguirmos modificar os valores de episodeList e currentEpisodeIndex, a primeira coisa que precisamos fazer é transformar esses valores em variáveis do estado, porque quando queremos alterar uma informação dentro do React e essa informação vai refletir na interface, isso não pode ser uma variável tradicional, tem que ser uma variável no estado.
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || currentEpisodeIndex + 1 < episodeList.length;

  function play(episode) {
    // método usado dentro da página de conteúdo de um episódio, ou seja, nossas páginas do [slug].tsx
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  function playList(list: Episode[], index: number) {
    // método usado dentro da página que contém uma playlist, no nosso caso a Home
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function togglePlay() {
    // método usado pelo listener onClick dos <button> tocar e pausar
    setIsPlaying(!isPlaying);
  }

  function toggleLoop() {
    // método usado pelo listener onClick do <button> repetir
    setIsLooping(!isLooping);
  }

  function toggleShuffle() {
    // método usado pelo listener onClick do <button> embaralhar
    setIsShuffling(!isShuffling);
  }

  function setPlayingState(state: boolean) {
    // método usado pelos listener onPlay e onPause do <audio>, que podem ser acessados por atalho de teclado
    setIsPlaying(state);
  }

  function clearPlayerState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  function playNext() {
    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(
        Math.random() * episodeList.length
      );
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    } else if (hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }

  function playPrevious() {
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        hasPrevious,
        hasNext,
        play,
        playList,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        clearPlayerState,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// escrevemos o export abaixo para otimizar a importação do useContext, que vem do React, e do PlayerContext, que é nosso componente
export const usePlayer = () => {
  return useContext(PlayerContext);
};
