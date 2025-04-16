import { useEffect, useState } from "react";
import Card from "@/components/Card";
import styles from "./styles.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createPortal } from "react-dom";
import UniqueCard from "@/components/Card/UniqueCard";
import { toast } from "react-toastify";

function Home() {
  const [mangas, setMangas] = useState([]);
  const [categoriasAtivas, setCategoriasAtivas] = useState([]);
  const [showUerRoot, setShowUerRoot] = useState(false);
  const [showUniqueCard, setShowUniqueCard] = useState({ open: false, id: '' }); // Estado centralizado
  const [favoritos, setFavoritos] = useState(new Set()); // Estado movido para Home

  // Função handleFavoritos movida para Home
  const handleFavoritos = async (id) => {
    try {
      const isFavorited = favoritos.has(id);
      const newFavoritos = new Set(favoritos);

      if (isFavorited) {
        newFavoritos.delete(id);
      } else {
        newFavoritos.add(id);
      }

      setFavoritos(newFavoritos); // Atualiza o estado em Home

      const response = await fetch(`/api/mangas?id=${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoritos: !isFavorited })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        renderMangas(); // Atualiza a lista de mangás
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast.error("Erro ao favoritar.");
      setFavoritos(new Set(favoritos)); // Reverte em caso de erro
    }
  };

  // Função renderMangas atualizada para inicializar favoritos
  const renderMangas = () => {
    fetch('/api/mangas')
      .then(res => res.json())
      .then(ret => {
        setMangas(ret);
        // Inicializa favoritos com dados da API
        const initialFavoritos = new Set(ret.filter(m => m.favorito).map(m => m.id));
        setFavoritos(initialFavoritos);
      })
      .catch(error => console.error("Erro ao buscar mangás:", error));
  };
  // const renderMangas = () => {
  //   fetch('/api/mangas')
  //     .then(res => res.json())
  //     .then(ret => {
  //       setMangas(ret);
  //     })
  //     .catch(error => console.error("Erro ao buscar mangás:", error));
  // };

  const renderCategorias = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(ret => {
        const active = ret.map(item => item.categoria)
        setCategoriasAtivas(active);
        renderMangas();
      })
      .catch(error => console.error("Erro ao buscar categorias:", error));
  }

  // useEffect para buscar os mangás ao carregar a página
  useEffect(() => {
    renderMangas();
    renderCategorias();
  }, []);

  return (
    <section className={styles.container}>
      <Navbar update={renderMangas} updateCategorias={renderCategorias} showUerRoot={showUerRoot} setShowUerRoot={setShowUerRoot} showUniqueCard={showUniqueCard} setShowUniqueCard={setShowUniqueCard} />
      <main className={styles.mainHome}>
        {mangas.length > 0 ? (
          // O componente Card recebe a lista de mangás e uma função para atualizar a lista
          <Card
            update={renderMangas}
            updateCategorias={renderCategorias}
            mangas={mangas}
            categoriasAtivas={categoriasAtivas}
            showUerRoot={showUerRoot}
            showUniqueCard={showUniqueCard}
            setShowUniqueCard={setShowUniqueCard} // Passa a função para abrir o UniqueCard
            handleFavoritos={handleFavoritos}
            favoritos={favoritos}
          />
        ) : (
          <span className={styles.notCadMangas}>Sem mangás cadastrados...</span>
        )}
      </main>
      <Footer />

      {/* Renderiza o UniqueCard via portal (independente do Search) */}
      {showUniqueCard.open && createPortal(
        <UniqueCard
          id={showUniqueCard.id}
          setOpen={setShowUniqueCard}
          update={renderMangas}
          handleFavoritos={handleFavoritos}
          favoritos={favoritos}
        />,
        document.getElementById('portal-root')
      )}
    </section>
  );
}

export default Home;
