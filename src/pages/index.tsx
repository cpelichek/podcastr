import { GetStaticProps } from "next";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from "./home.module.scss";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  description: string;
  url: string;
};

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  // console.log(`Últimos episódios: ${JSON.stringify(latestEpisodes)}`);
  // console.log(`Demais episódios: ${JSON.stringify(allEpisodes)}`);
  return (
    <div className={styles.homePage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos episódios 🚀</h2>
        <ul>
          {latestEpisodes.map((episode) => {
            // nós sempre usamos map para renderizar html repetitivo
            return (
              <li key={episode.id}>
                <Image // this is a next component which optimizes some image features automatically for us, like width and height, which affects quality; note that this ain't necessary for our svg images, because they are very light
                  width={192} // in this case, we want to display images with 64 x 64 px, but we set the w and h to x3 that size because of retina displays, otherwise for those our image would be pixelated, which is sign of bad quality
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                />

                <div className={styles.episodeDetails}>
                  <a href={episode.url}>{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}></section>
    </div>
  );
}

//API usando modelo SSG (Static Site Generation) e tipagem do typescript
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), "d MMM yy", {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      description: episode.description,
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};
