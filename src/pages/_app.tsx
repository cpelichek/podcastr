import "../styles/global.scss";
import { useState } from "react";

import { Header } from "../components/Header";
import { Player } from "../components/Player";
import { PlayerContext } from "../contexts/PlayerContext";

import styles from "../styles/app.module.scss";

function MyApp({ Component, pageProps }) {
  // pra conseguirmos modificar os valores de episodeList e currentEpisodeIndex, a primeira coisa que precisamos fazer é transformar esses valores em variáveis do estado, porque quando queremos alterar uma informação dentro do React e essa informação vai refletir na interface, isso não pode ser uma variável tradicional, tem que ser uma variável no estado.
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  function play(episode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
  }

  return (
    <PlayerContext.Provider value={{ episodeList, currentEpisodeIndex, play }}>
      <div className={styles.wrapper}>
        <main>
          <Header />
          <Component {...pageProps} /> {/* Conteúdo da nossa página */}
        </main>
        <Player />
      </div>
    </PlayerContext.Provider>
  );
}

export default MyApp;
