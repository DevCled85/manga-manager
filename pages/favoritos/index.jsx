import Navbar from '@/components/Navbar';
import styles from './Favoritos.module.css';
import Footer from '@/components/Footer';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import UniqueCard from '@/components/Card/UniqueCard';

function Favoritos() {
    const [mangasFavoritos, setMangasFavoritos] = useState([]);
    const [showUniqueCard, setShowUniqueCard] = useState({ open: false, id: '' });

    const buscarManga = async () => {
        try {
            const response = await fetch('/api/mangas');
            const data = await response.json();

            const favoritas = data.filter(mf => mf.favorito)
            setMangasFavoritos(favoritas)

        } catch (error) {
            console.error('Erro ao buscar mangas:', error);
        }
    }

    // Dentro do componente Favoritos:
    const handleFavoritos = async (id) => {
        try {
            // Envia a requisição para o backend
            const response = await fetch(`/api/mangas?id=${id}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favoritos: false }) // Remove dos favoritos
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Removido dos favoritos!");
                buscarManga(); // Atualiza a lista local
            } else {
                toast.error(data.message || "Erro ao atualizar favorito.");
            }
        } catch (error) {
            console.error("Erro ao favoritar:", error);
            toast.error("Erro ao atualizar favorito.");
        }
    };

    useEffect(() => {
        buscarManga()
    }, [])

    return (
        <div className={styles.containerFavoritos}>
            <div className={styles.compContainer}>
                <Navbar />

                <div className={styles.boxFavoritos}>

                    <div className={styles.headerFavoritos}>
                        Favoritos
                        <p>
                            {mangasFavoritos?.length || 0} favorito
                            {mangasFavoritos?.length !== 1 && 's'}
                        </p>
                    </div>

                    <div className={styles.mainFavoritos}>

                        {
                            mangasFavoritos.length > 0 ? (
                                mangasFavoritos.map(manga => (

                                    <div
                                        key={manga.id}
                                        className={styles.cardFavoritos}
                                        onClick={() => setShowUniqueCard({ open: true, id: manga.id })}
                                    // onClick={() => toast.info("Falta implementar essa função")}
                                    >

                                        <div className={styles.img}>
                                            <img src={manga.imagem} alt="capa" />
                                        </div>
                                        <b>{manga.titulo}</b>
                                        <p>Categoria:<b>{manga.categoria}</b></p>
                                        <span>
                                            <p className={styles.txtCap}>Capitulos totais: <b>{manga.capitulosTotal}</b></p>
                                            <p className={styles.txtCap}>Capitulos Lidos: <b>{manga.capitulosLidos}</b></p>
                                            <p className={styles.txtCap}>Capitulos Restam: <b>{manga.capitulosTotal - manga.capitulosLidos}</b></p>
                                        </span>

                                        <HeartIcon
                                            width={30}
                                            height={30}
                                            className={`${styles.icoFavorito} ${manga.favorito ? styles.favoritado : ''}`}
                                            
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFavoritos(manga.id)
                                            }} // Chamando a função aqui
                                        />
                                    </div>
                                ))
                            ) : (
                                <span className={styles.semManga}>Sem mangás favoritas...</span>
                            )
                        }


                    </div>

                </div>

                {showUniqueCard.open && (
                    <UniqueCard
                        id={showUniqueCard.id}
                        setOpen={setShowUniqueCard} // Função para fechar o modal
                        update={buscarManga} // Atualiza a lista após mudanças
                        handleFavoritos={handleFavoritos} // Função para favoritar/desfavoritar
                        favoritos={new Set(mangasFavoritos.map(m => m.id))} // Passa os IDs dos favoritos
                    />
                )}

                <Footer />
            </div>
        </div>
    )
}

export default Favoritos;