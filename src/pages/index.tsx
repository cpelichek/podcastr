import { useEffect } from "react";

export default function Home() {
  //API usando modelo SPA (Single Page Application)
  useEffect(() => {
    fetch("http://localhost:3333/episodes")
      .then((response) => response.json())
      .then((data) => console.log(data));
  }, []);
  // Tem o problema de não indexar para os Search Engines, robots e crawlers, pois a forma como fizemos acima está rodando no js do browser, então não virá montado do servidor, logo o robot não enxerga

  return <h1>🛸</h1>;
}
