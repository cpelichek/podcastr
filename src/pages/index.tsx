// TODO: 1. Tornar o projeto responsivo, talvez eliminar a table do todos os episódios;
// TODO: 2. Transformar esse site num PWA (Progressive Web App), assim poderá ser rodado offline e como um app de celular. Para isso existe uma biblioteca chamada next-pwa que facilita essa configuração; O legal de um PWA é que ele permite transformar uma aplicação web em uma aplicação tanto mobile quanto desktop, onde ele tira a carcaça do browser e roda como um aplicativo mesmo, então você consegue converter facilmente a versão web para um app, quando você não quer criar inteiro um aplicativo nativo do zero ou que não tem tanta necessidade disso.
// TODO: 3. Temas alternativos, por exemplo tema escuro (exemplo de estilo o Omni Theme da rocketseat, pode procurar o repositório do github para ver as configurações, toda a paleta de cores)
// TODO: 4. Indo mais à fundo, poderia usar o Electron para transformar isto num app desktop, assim eliminando a necessidade de acessar um website para ouvir os podcasts
// TODO: 5. Quando o shuffle tá habilitado, e clicamos para tocar o episódio anterior, ele escolhe o episódio de forma aleatória, talvez mudar o comportamento do shuffle para uma playListShuffle que seja gerada a cada vez que habilitamos o shuffle, e essa playListShuffle quando existe substitui a playList, algo como (playListShuffle? || playList)
// TODO: 6. Acrescentar animação para a imagem dos headphones do Player girarem enquanto o aúdio estiver tocando
// TODO: 7. Substituir o json por algo que seja meu!
// TODO: 8. Criar um README.md, criar um notion e um whimsical com tudo que vimos neste projeto, para fixar esse conhecimento e poder fazê-lo novamente do começo ao fim

// importações de pacotes externos
import { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

// importações de funções internas
import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import { usePlayer } from "../contexts/PlayerContext";

// importações de css
import styles from "./home.module.scss";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
};

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  // console.log(`Últimos episódios: ${JSON.stringify(latestEpisodes)}`);
  // console.log(`Demais episódios: ${JSON.stringify(allEpisodes)}`);

  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes]; // nós copiamos as informações anteriores para assim estar de acordo com o "princípio da imutabilidade" do React

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos 🚀</h2>
        <ul>
          {latestEpisodes.map((episode, index) => {
            // nós sempre usamos map para renderizar html repetitivo
            return (
              <li key={episode.id}>
                <Image // this is a next component which optimizes some image features automatically for us, like width and height, which affects quality; note that this ain't necessary for our svg images, because they are very light
                  width={192} // in this case, we want to display images with 64 x 64 px, but we set the w and h to x3 that size because of retina displays, otherwise for those our image would be pixelated, which is sign of bad quality
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              {/* deixamos em branco pois é o th da imagem de thumbnail */}
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
              {/* deixamos em branco pois é o th da imagem do botão de play */}
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    {/* para inserir css inline usando React, primeiro abrimos chaves para indicar que estamos inserindo código JS, depois abrimos chaves novamente para indicar que estamos passando um objeto */}
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        playList(episodeList, index + latestEpisodes.length)
                      }
                    >
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
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
