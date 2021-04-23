// Context API é uma funcionalidade do React que permite compartilhar dados entre componentes da nossa aplicação
// Isso serve para lidar com o desafio de fazer um evento que acontece em um componente (um click em um botão "play", por exemplo) ser ouvido por outro componente (um aúdio começar a tocar)
import { createContext, ReactNode, useState } from "react";

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
  play: (episode: Episode) => void;
  togglePlay: () => void;
  setPlayingState: (state: boolean) => void;
};

// O valor default definido na chamada da função createContext() não é muito utilizado, serve mais para dar o formato que esperamos receber do value dos componentes envolvidos nesse contexto pelo "NomeDoContexto.Provider", exemplo: createContext({ episodeList: [], currentEpisodeIndex: 0, }) , porém nós usamos o createContext({} as PlayerContextData) que é um hack do typescript que "simula" ou "faz uma atribuição forçada" ao objeto, dizendo que esse {} tem a mesma estrutura que PlayerContextData, fazendo com que o PlayerContext tenha exatamente o formato do PlayerContextData. O bom disso é que quando formos importar os dados de dentro do player, quando fizermos uma desestruturação, exemplo const {  } = useContext(PlayerContext), nós podemos dentro do espaço em  {  } usar o atalho de teclado Ctrl+barraDeEspaço para enxergar o que é esperado dentro do PlayerContextData, no nosso caso episodeList e currentEpisodeIndex.
export const PlayerContext = createContext({} as PlayerContextData);

// Antes o PlayerContext.Provider estava inserido direto no _app.tsx, porém removemos de lá e colocamos aqui pensando que no futuro podemos ter mais de um contexto, por exemplo de autenticação de usuário, e assim é mais fácil de dar manutenção se não deixarmos diferentes contextos com suas variáveis e métodos misturados, e não passamos um value gigante dentro do app pois estamos agora abstraindo isso dentro do próprio contexto que estamos exportando. Tivemos também que alterar a extensão deste arquivo, de .ts para .tsx.
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

  function play(episode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        play,
        isPlaying,
        togglePlay,
        setPlayingState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
