import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";

import { usePlayer } from "../../contexts/PlayerContext";

import styles from "./styles.module.scss";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

export function Player() {
  // Para conseguirmos manipular um elemento html de maneira imperativa, no js tradicional usaríamos document.getElementById("id").algumMetodoQueQueremosExecutar ou algo similar. No React, nós fazemos algo parecido com o uso de "Refs", uma referência para aquele elemento que queremos manipular. useRef() quando estamos tratando de criar referências para elementos html uma boa prática é sempre iniciar ela como null, e por estarmos usando typescript podemos tipar o useRef falando qual o tipo de elemento que vamos salvar/armazenar dentro do useRef, e quando estamos usando typescript com HTML todos os elementos HTML estão disponíveis de maneira global, ou seja toda a tipagem dos elementos estão disponíveis de forma global. Dessa forma, quando escrevemos useRef<HTMLAudioElement> , isso irá nos fornecer uma inteligência na hora que formos utilizar essa referência do audio (audioRef) para saber por exemplo que métodos tem lá dentro e o que podemos ou não podemos utilizar
  const audioRef = useRef<HTMLAudioElement>(null);

  // progress será nossa variável que indica o quanto já progredimos na trilha do audio que estamos tocando
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    hasPrevious,
    hasNext,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
  } = usePlayer();

  // useEffect é uma função de dentro do React que usamos para fazer efeitos colaterais, ou seja, "quando alguma coisa muda eu executo algo"
  useEffect(() => {
    // Como nossa audioRef pode começar com null, então verificamos se ela tem um valor dentro dela. Toda Ref no React tem dentro dela uma única propriedade chamada .current , que é o valor da referência.
    // Abaixo, se não tiver nenhum valor, não faça nada (se tentássemos executar alguma coisa daria erro)
    if (!audioRef.current) {
      return;
    }

    // Se isPlaying receber um novo valor e esse valor for truthy, pegamos podemos tocar ou pausar; esses métodos são do próprio HTMLAudioElement
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;
    audioRef.current.addEventListener("timeupdate", () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ""}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek} // essa propriedade controla o que acontece quando o usuário arrasta o handle do slider
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ background: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          {/* episode?.duration significa que verifica se tem episódio, e só se tiver é que acessa a duração do episódio; já o ?? 0 significa que, quando verificar que não tem episódio, passaremos 0 como parâmetro */}
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {/* Podemos colocar nossa tag <audio /> em qualquer lugar da nossa aplicação, ela ficará "invisível" no DOM, escolhemos aqui pois assim fica mais próxima dos botões que controlam o que estamos ouvindo */}
        {/* Ao invés de um operador ternário, podemos fazer igual o exemplo abaixo quando queremos que esta à direita aconteça apenas se a expressão à esquerda for truthy, ou seja, avaliado como true no processo de coerção do valor */}
        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button
            type="button"
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Pausar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button
            type="button"
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src="/play-next.svg" alt="Tocar próximo" />
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
