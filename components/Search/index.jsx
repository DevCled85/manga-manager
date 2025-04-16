import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom'; // Importação correta de createPortal
import styles from './Search.module.css';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import Navbar from '../Navbar';
import UniqueCard from '../Card/UniqueCard';

function Search({ closing, toggleSearch, setShowUniqueCard, showUniqueCard }) {
    const searchRef = useRef(null);
    const [mangaFull, setMangaFull] = useState([]);
    const [itemFiltros, setItemFiltros] = useState([]);
    const [filtroSelectded, setFiltroSelectded] = useState("selecionar");
    const [pesquisaInput, setPesquisaInput] = useState("");
    const [resultados, setResultados] = useState([]);
    // const [showUniqueCard, setShowUniqueCard] = useState({ open: false, id: '' });

    // Fecha o componente ao clicar fora, exceto se o UniqueCard estiver aberto
    useEffect(() => {
        function handleClickOutside(event) {
            // Verifica se o clique foi fora do Search e não no UniqueCard
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                !event.target.closest(`.${styles.card_search}`) && // Ignora cliques nos cards do Search
                !event.target.closest('.unique-card-container') // Ignora cliques no UniqueCard
            ) {
                toggleSearch(); // Fecha o Search
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closing, showUniqueCard.open]);

    const buscarManga = async () => {
        try {
            const response = await fetch('/api/mangas');
            if (!response.ok) throw new Error('Erro ao buscar os mangás.');

            const dataFull_db = await response.json();
            setMangaFull(dataFull_db);

            const filtros = Array.from(new Set(dataFull_db.filter(m => m.status).map(m => m.status.trim()).filter(Boolean)));
            setItemFiltros(["titulo", "todos", "categoria", "favorito", "fonte", ...filtros]);
        } catch (error) {
            console.error(error);
            setMangaFull([]);
        }
    };

    useEffect(() => {
        buscarManga();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [pesquisaInput, filtroSelectded]);

    const handleSearch = () => {
        const qtdLengthPesquisa = 3;
        if (!mangaFull.length) return;

        let filtrado = mangaFull;
        const filtrosIndesejados = ["titulo", "categoria", "favorito", "fonte"];
        const filtrosArr = itemFiltros.filter(filtrado => !filtrosIndesejados.includes(filtrado));

        if (filtroSelectded === "todos") {
            filtrado = mangaFull;
        } else if (filtroSelectded === "favorito") {
            filtrado = mangaFull.filter(manga => manga.favorito === true);
        } else if (filtrosArr.includes(filtroSelectded)) {
            filtrado = mangaFull.filter(manga => manga.status === filtroSelectded);
        } else if (pesquisaInput.length >= qtdLengthPesquisa) {
            if (["titulo", "categoria", "fonte"].includes(filtroSelectded)) {
                filtrado = mangaFull.filter(manga => manga[filtroSelectded]?.toLowerCase().includes(pesquisaInput.toLowerCase()));
            }
        } else {
            filtrado = [];
        }
        setResultados(filtrado);
    };

    // Fecha o Search e abre o UniqueCard
    const handleOpenUniqueCard = (id) => {
        setShowUniqueCard({ open: true, id: id }); // Usa a função do componente pai
        toggleSearch(); // Fecha o Search
    };

    // Verifica se o portal-root existe antes de renderizar
    const portalRoot = typeof document !== 'undefined' ? document.getElementById('portal-root') : null;

    return (
        <>
            {/* Renderiza o UniqueCard via portal (gerenciado pelo Home) */}
            {showUniqueCard.open = true && portalRoot &&
                createPortal(
                    <UniqueCard
                        id={showUniqueCard.id}
                        update={buscarManga}
                        setOpen={setShowUniqueCard}
                    />,
                    portalRoot
                )
            }

            <section
                className={`${styles.containerSearch} ${closing ? styles.closing : ''}`}
                style={{ backgroundColor: closing ? 'transparent' : null }}
            >
                <div className={styles.componentSearch_container}>
                    <Navbar />
                    <div ref={searchRef} className={styles.componentSearch}>
                        <div className={styles.boxSearch}>
                            <div className={styles.boxOne}>
                                <div className={styles.boxIcoSearch_}>
                                    <MagnifyingGlassIcon className={styles.icoBuscador} />
                                </div>
                                <input
                                    type="search"
                                    placeholder='Digite sua pesquisa...'
                                    onChange={(e) => setPesquisaInput(e.target.value)}
                                    value={pesquisaInput}
                                />
                            </div>
                            <span className={styles.separatorVertical}></span>
                            <div className={styles.boxTwo}>
                                Filtrar Busca:
                                <select defaultValue="selecionar" onChange={(e) => setFiltroSelectded(e.target.value)}>
                                    <option value="selecionar">selecionar</option>
                                    {itemFiltros.map(filtro => (
                                        <option key={filtro} value={filtro}>{filtro}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <span className={styles.separator}></span>

                        <div className={styles.resultado}>
                            {resultados.length > 0 ? (
                                resultados.map(r => (
                                    <div
                                        className={styles.card_search}
                                        key={r.id}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Impede a propagação do evento
                                            handleOpenUniqueCard(r.id); // Abre o UniqueCard
                                        }} // Fecha o Search e abre o UniqueCard
                                    >
                                        <div className={styles.boxIMG_search}>
                                            <img src={r.imagem} alt="capa" />
                                            <span>{r.titulo}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span>Sem resultados</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Search;