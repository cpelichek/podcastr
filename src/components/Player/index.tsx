import { useRef, useEffect } from "react";
import Image from "next/image";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";

import { usePlayer } from "../../contexts/PlayerContext";

import styles from "./styles.module.scss";

export function Player() {
  // Para conseguirmos manipular um elemento html de maneira imperativa, no js tradicional usaríamos document.getElementById("id").algumMetodoQueQueremosExecutar ou algo similar. No React, nós fazemos algo parecido com o uso de "Refs", uma referência para aquele elemento que queremos manipular. useRef() quando estamos tratando de criar referências para elementos html uma boa prática é sempre iniciar ela como null, e por estarmos usando typescript podemos tipar o useRef falando qual o tipo de elemento que vamos salvar/armazenar dentro do useRef, e quando estamos usando typescript com HTML todos os elementos HTML estão disponíveis de maneira global, ou seja toda a tipagem dos elementos estão disponíveis de forma global. Dessa forma, quando escrevemos useRef<HTMLAudioElement> , isso irá nos fornecer uma inteligência na hora que formos utilizar essa referência do audio (audioRef) para saber por exemplo que métodos tem lá dentro e o que podemos ou não podemos utilizar
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    hasPrevious,
    hasNext,
    togglePlay,
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
          <span>00:00</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ background: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>00:00</span>
        </div>

        {/* Podemos colocar nossa tag <audio /> em qualquer lugar da nossa aplicação, ela ficará "invisível" no DOM, escolhemos aqui pois assim fica mais próxima dos botões que controlam o que estamos ouvindo */}
        {/* Ao invés de um operador ternário, podemos fazer igual o exemplo abaixo quando queremos que esta à direita aconteça apenas se a expressão à esquerda for truthy, ou seja, avaliado como true no processo de coerção do valor */}
        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            autoPlay
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
          />
        )}

        <div className={styles.buttons}>
          <button type="button" disabled={!episode}>
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
          <button type="button" disabled={!episode}>
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
