import { GetStaticProps } from "next";
import { api } from "../services/api";

type Episode = {
  id: string;
  title: string;
  members: string[];
  // ...
};

type HomeProps = {
  episodes: Episode[];
};

export default function Home(props: HomeProps) {
  console.log(props.episodes);
  return (
    <>
      <h1>🛸</h1>
      {/* <p>{JSON.stringify(props.episodes)}</p> */}
    </>
  );
}

//API usando modelo SSG (Static Site Generation) e tipagem do typescript
export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });
  const data = await response.data;

  return {
    props: {
      episodes: data,
    },
    revalidate: 60,
  };
};
