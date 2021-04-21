import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";
import Link from "next/link";
// import { useRouter } from "next/router";   // ao invés disto estamos usando GetStaticPaths, já que estamos fazendo "páginas estáticas de forma dinâmica"
import { GetStaticPaths, GetStaticProps } from "next";

import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";

/**
 * O Next.js faz automaticamente um roteamento baseado nos arquivos que temos no folder pages, isso recebe o nome de file system rooting, que significa que os arquivos .tsx que não começam com _ presentes na pasta pages são os arquivos que formam as rotas da aplicação
 * Para as urls dos nossos episódios, podemos seguir duas estratégias, uma é incluir parâmetros, algo como /episode?id... , ou podemos fazer uso do que é conhecido como "slug", que ficaria por exemplo da seguinte forma /episode/episode-name
 * Para nosso roteamento iremos usar slug. Por isso criamos uma pasta, cujo nome irá compor a url, e dentro dela criamos um arquivo com nome qualquer entre colchetes, então neste caso temos a rota /episode/ e qualquer texto que colocarmos depois irá renderizar o conteúdo deste arquivo [slug].tsx
 */

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

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button">
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      {/* <div className={styles.description}>{episode.description}</div> */}
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
      {/* Por motivos de segurança (no caso evitar injeção de html), o React por padrão não converte um texto que ele recebe em uma estrutura que possa ser exibida em tela. Para obrigar o React a introduzir o html recebido pela api direto no DOM, precisamos fazer, como no caso acima, uma div fechada nela mesma, ou seja <div/> , e acrescentar nela a propriedade dangerouslySetInnerHTML com o objeto html que queremos. É perigoso fazer isso quando não sabemos de onde estão vindo nossos dados, pois alguém malicioso pode hackear nossa página. Como estamos recebendo nossos dados de um servidor mockado (nosso server.json, que é estático) estamos seguros */}
    </div>
  );
}

// GetStaticPaths é obrigatório para trabalharmos com "páginas estáticas dinâmicas"
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  //ctx aqui significa context, precisamos passar essa variável pois não podemos incluir o useRouter, por se tratar de um react-hook, ou seja, uma função que só pode existir dentro do componente
  const { slug } = ctx.params; // este { slug } é exatamente o nome deste arquivo [slug].tsx
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: { episode },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
