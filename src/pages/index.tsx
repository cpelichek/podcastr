export default function Home(props) {
  console.log(props.episodes);
  return (
    <>
      <h1>🛸</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </>
  );
}

//API usando modelo SSR (Server Side Rendering)
export async function getServerSideProps() {
  //quando usamos o método getServerSideProps, o primeiro carregamento é feito pela camada do Next.js (que é o servidor Node.js da nossa aplicação), e não no browser da nossa aplicação. Então se olharmos no terminal onde estamos rodando o Next.js, veremos que os dados foram carregados e são exibidos, mas não são exibidos no console do browser, pois os dados foram carregados na camada de servidor, e não na camada de browser
  const response = await fetch("http://localhost:3333/episodes");
  const data = await response.json();

  return {
    props: {
      episodes: data,
    },
  };
}
