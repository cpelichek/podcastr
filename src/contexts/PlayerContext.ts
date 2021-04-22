import { createContext } from "react";

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
  play: (episode: Episode) => void;
};

export const PlayerContext = createContext({} as PlayerContextData); // O valor default definido na chamada da função createContext() não é muito utilizado, serve mais para dar o formato que esperamos receber do value dos componentes envolvidos nesse contexto pelo "NomeDoContexto.Provider", exemplo: createContext({ episodeList: [], currentEpisodeIndex: 0, }) , porém nós usamos o createContext({} as PlayerContextData) que é um hack do typescript que "simula" ou "faz uma atribuição forçada" ao objeto, dizendo que esse {} tem a mesma estrutura que PlayerContextData, fazendo com que o PlayerContext tenha exatamente o formato do PlayerContextData. O bom disso é que quando formos importar os dados de dentro do player, quando fizermos uma desestruturação, exemplo const {  } = useContext(PlayerContext), nós podemos dentro do espaço em  {  } usar o atalho de teclado Ctrl+barraDeEspaço para enxergar o que é esperado dentro do PlayerContextData, no nosso caso episodeList e currentEpisodeIndex.
