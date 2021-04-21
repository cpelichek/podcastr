import { GetStaticProps } from "next";

// para de fato passarmos a usar typescript, fazemos a tipagem das props
type HomeProps = {
  episodes: Array<{
    //indicamos não apenas que episodes é do tipo Array, o que seria vago, mas que dentro desse Array esperamos encontrar objetos.
    id: string; //por sua vez, esses objetos esperamos num certo formato, com propriedades de determinados tipos.
    title: string;
    members: string[];
    // ...
  }>;
};

export default function Home(props) {
  console.log(props.episodes);
  return (
    <>
      <h1>🛸</h1>
      {/* <p>{JSON.stringify(props.episodes)}</p> */}
    </>
  );
}

//API usando modelo SSG (Static Site Generation)
// Assim que o primeiro usuário final acessa essa página, criamos uma versão estática dela, ou seja um html, e servimos ela para todos que a acessarem a partir de então - não importa quantas pessoas acessarem, elas receberão o mesmo conteúdo. Essa estratégia é boa quando não precisamos atualizar o conteúdo a cada instante, logo não queremos sobrecarregar nosso servidor com requisições à página e gastar recursos desnecessariamente, que é um problema da estratégia SSR que testamos antes. Com SSG nossa página será atualizada apenas quando quisermos que o servidor a renderize novamente, pode ser a cada tantos minutos ou até mesmo dias, um intervalo de tempo escolhido por nós para atender nossas necessidades, e nossa página fica muito mais performática.
export const getStaticProps: GetStaticProps = async () => {
  //transformamos em arrow function, e mais importante do que isso tipamos a função, fazendo ela deixar de ser simples JS e passar a ser typescript. Uma das vantagens é por exemplo podemos apagar o return abaixo e com o comando Ctrl + barraDeEspaço nós iremos receber sugestões do que é válido como retorno dessa função.
  //trocamos de getServerSideProps
  const response = await fetch("http://localhost:3333/episodes");
  const data = await response.json();

  return {
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8, //adicionamos revalidate, que recebe um número em segundos com a frequência com que queremos gerar uma nova versão dessa página
  };
};
// O recurso de Static Site Generation só funciona em produção, então precisamos criar uma build do projeto para simular a aplicação rodando em produção: para isso no terminal rodamos os comando yarn build e yarn start, e já no log do yarn build nós podemos verificar se nossa página está sendo gerada usando a estratégia SSG ou não
// Nós podemos atestar o funcionamento da nossa estratégia em Developer Tools na aba Network, ou ainda no próprio terminal onde estivermos rodando nosso servidor mockado (pelo comando yarn server) pois se ao recarregarmos a página não obtivemos novo input do json-server significa que ele não precisou servir novamente, ou seja a página não precisou fazer uma nova requisição, pois ela já havia sido gerada com os dados inclusos -- resumindo, após a primeira vez que a página é gerada, nenhuma outra requisição foi feita, porque nenhuma outra chamada à API foi feita. Esse é um dos diferenciais do Next.js e um dos maiores avanços na área de front-end dos últimos anos.
