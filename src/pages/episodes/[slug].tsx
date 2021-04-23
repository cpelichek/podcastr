import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
// import { useRouter } from "next/router";   // ao invés disto estamos usando GetStaticPaths, já que estamos fazendo "páginas estáticas de forma dinâmica"
import { GetStaticPaths, GetStaticProps } from "next";

import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";
import { usePlayer } from "../../contexts/PlayerContext";

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
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
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
        <button type="button" onClick={() => play(episode)}>
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

// ISR - Incremental Static Regeneration:
// GetStaticPaths é obrigatório para trabalharmos com "páginas estáticas dinâmicas"
// O que queremos dizer com "páginas estáticas dinâmicas": o principal momento em que o Next.js vai gerar as páginas estáticas da aplicação, é no momento da build, porém resta a dúvida: se o Next.js roda o processo de gerar as páginas estáticas no momento do yarn build (que rodamos sempre que vamos jogar uma nova versão do nosso projeto online), como é que o Next.js vai construir uma versão estática da página de episódios, se no momento da build ele não sabe qual episódio existe, ou seja, para qual episódio queremos gerar uma página estática?
// Entra o slug e o GetStaticPaths. O [slug] do episódio é uma versão dinâmica. No momento da build, o Next.js não tem informação de quais episódios tem dentro da nossa página, dentro da nossa API, ele não sabe quais episódios ele precisa gerar de forma estática. Toda vez que estamos gerando de forma dinâmica uma página estática, ou seja, uma página estática que tem parâmetros dinâmicos, precisamos informar o método GetStaticPaths. Esse método retorna quais episódios (neste caso, já que episódio é o parâmetro que queremos retornar neste exemplo) queremos gerar de forma estática no momento da build.
// Como passamos o valor do parâmetro paths como um Array vazio, o Next.js entende que não irá gerar de forma estática nenhum episódio no momento da build; se houvéssemos retornado dentro desse Array um Objeto falando os nomes dos parâmetros, exemplo path: [ { params: { slug: "a-importancia-da-contribuicao-em-open-source" } } ] , teríamos gerado essa página estática que já estaria disponível para acesso no servidor, neste exemplo na /episodes/a-importancia-da-contribuicao-em-open-source
// O que acontece quando não passamos nenhum nenhum parâmetro dentro do paths: [] , é que o Next.js não vai gerar nenhum episódio de forma estática. O que determina o comportamento de quando uma pessoa acessa a página de um episódio que não foi gerado estáticamente, é o fallback. Se passamos fallback: false , uma pessoa que tente acessar uma página que não foi gerada no momento da build, ou seja, que tenha sido passada dentro dos paths, essa pessoa receberá uma página 404, ou seja não foi encontrado. Se passamos fallback: true , se uma pessoa acessar um episódio e esse episódio não foi gerado anteriormente de forma estática, ele irá tentar buscar os dados daquele episódio que a pessoa está acessando para criar uma página estática daquele episódio depois salvar em disco, mas o fallback true faz com que a requisição para buscar os dados do episódio (essa requisição que está dentro do getStaticProps, a chamada à API) aconteça pelo lado do Client, ou seja, pelo lado do browser - como isso demora um pouco a executar, por um determinado período de tempo os dados dessa variável episodes estarão vazios (nas nossas configurações do package.json estabelecemos por padrão que demore 750ms), então no momento da build podemos obter um erro pois o Next.js irá tentar pre-renderizar essa página de forma estática de forma automatizada mas ele vê que a variável episode está undefined e quando tenta acessar os dados desse episode, como episode.title, não tem nada dentro. Podemos corrigir isso de algumas formas, como importar de dentro do "next/router" o hook (ou seja, a função) useRouter, e dentro do componente fazermos const router = useRouter() e if (router.isFallback) { return <p>Carregando...</p> } , quando salvamos e damos build nesse momento o Next.js irá carregar os dados dessas páginas somente quando o usuário for acessá-las (pode ser quase imperceptível pois o Next.js já automaticamente tenta fazer o pre-fetch dos dados).
// A outra opção é o fallback: "blocking" , que veio com a versão 10 do Next.js (conferindo o github do Next.js estamos atualmente na v10.1.3 , então é bem recente), não iremos rodar a requisição na camada do client (browser), como o fallback true faz, mas na camada do next.js (node.js), então o que acontece é que quando a pessoa vai navegar por algum link ela só vai ser navegada para a tela quando os dados já tiverem sido carregados. Para questões de SEO, fallback: "blocking" é a melhor opção, pois se um crawler for acessar um conteúdo da nossa aplicação que ainda não foi gerado de forma estática, digamos que a página vai aguardar o conteúdo ser carregado pra então ser exibido.
// O que podemos fazer é por exemplo dar fetch nas nossas páginas mais acessadas e passá-las no paths: [] , e assim no momento da build vamos gerar estaticamente somente os mais acessados, e o restante se passarmos o fallback: "blocking" só será gerado de forma incremental conforme as pessoas forem acessando, ou seja, quando as pessoas acessam aquela página ela será gerada de forma estática.
// Esse conceito do fallback true e fallback blocking dentro do Next.js é chamado Incremental Static Regeneration (ISR). Ele permite gerar as páginas conforme as pessoas vão acessando e re-validar, ou seja, re-gerar páginas que estão obsoletas, ou seja, que estão com dados inválidos, por exemplo se tiver passado o período do revalidate e as informações dentro da página tiverem sido atualizadas.
// Abaixo estamos usando esses conceitos de ISR, e também Object literal property value shorthand para o paths: paths virar apenas paths.
export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
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
