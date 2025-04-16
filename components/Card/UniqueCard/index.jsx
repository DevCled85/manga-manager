import { useEffect, useState } from 'react';
import styles from './UniqueCard.module.css';
// import Image from 'next/image';
import { HeartIcon, PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

function UniqueCard({ id, setOpen, update, handleFavoritos, favoritos }) {
    const [manga, setManga] = useState(null);
    const [campoEditar, setCampoEditar] = useState("");
    const [showUploadsComp, setShowUploadsComp] = useState(false);
    const [selectedCommentsIndex, setSelectedCommentsIndex] = useState(null)
    const [editingIndex, setEditingIndex] = useState("");
    const [updateDadosInput, setUpdateDadosInput] = useState({
        titulo: "",
        capa: "",
        bio: "",
        fonte: "",
        status: "",
        detalhes: "",
        comentarios: "",
        editCommets: "",
        db_comentarios: ""
    });
    const [isHovered, setIsHovered] = useState({ edit: false, delete: false });

    // const isFavotited = favoritos.has(id);
    const isFavotited = favoritos ? favoritos.has(id) : false;
    // const isFavotited = favoritos && favoritos.has ? favoritos.has(id) : false;

    const handleClickEditComp = (campo) => {
        setCampoEditar(campo);
        setShowUploadsComp(true);
    };

    const handleClickComment = (index) => {
        // Altera o indice do comentario clicado
        setSelectedCommentsIndex(selectedCommentsIndex === index ? null : index);
    }

    // Função para lidar com o upload da imagem e converter para base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Quando a imagem for carregada, salva a base64 no estado
                setUpdateDadosInput((prev) => ({
                    ...prev,
                    capa: reader.result
                }));
            };
            reader.readAsDataURL(file); // Converte a imagem para base64
        }
    };

    const handleUpdateDados = async (e) => {
        e.preventDefault();

        if (campoEditar === "editCommets") {
            await handleEditComment(editingIndex)
            return;
        }

        try {
            // Validação para comentários vazios
            if (campoEditar === 'comentarios' && !updateDadosInput.comentarios.trim()) {
                toast.warn("O comentário não pode estar vazio.");
                return;
            }

            // Busca os dados atuais do mangá
            const mangaResponse = await fetch(`/api/mangas?id=${id}`);
            const mangaData = await mangaResponse.json();

            if (!mangaData.length) {
                toast.error("Mangá não encontrado");
                return;
            }

            // Lógica específica para comentários
            let updatedComments = [...mangaData[0].comentario];
            if (campoEditar === 'comentarios' && updateDadosInput.comentarios) {
                // Cria uma data ajustada para o fuso horário de Amazonas
                const now = new Date();
                const offsetAmazonas = 4 * 60 * 60 * 1000; // 4 horas em milissegundos
                const dataAmazonas = new Date(now.getTime() - offsetAmazonas);

                updatedComments.push({
                    comment: updateDadosInput.comentarios,
                    date: dataAmazonas.toISOString()
                        .replace("T", " ")
                        .substring(0, 19)
                });
            }

            // Prepara os dados para envio (todos os campos + comentários atualizados)
            const dataToSend = {
                ...updateDadosInput, // Inclui titulo, bio, fonte, etc.
                comentarios: campoEditar === 'comentarios' ? updatedComments : mangaData[0].comentario
            };

            // Remove campos vazios ou não modificados
            const filteredData = Object.fromEntries(
                Object.entries(dataToSend).filter(([_, value]) => value !== "" && value !== null)
            );

            // Envia para a API
            const response = await fetch(`/api/mangas?id=${id}`, {
                method: 'PATCH',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(filteredData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowUploadsComp(false);
                toast.success(data.message || "Dados atualizados com sucesso!");

                // Atualiza os dados locais
                buscarManga();
                update();

                // Reseta os campos
                setUpdateDadosInput({
                    titulo: "",
                    bio: "",
                    fonte: "",
                    status: "",
                    detalhes: "",
                    comentarios: "",
                    commentsdb: []
                });
            } else {
                toast.error(data.error || "Erro ao atualizar mangá.");
            }
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    const handleEditComment = async (index) => {

        if (!updateDadosInput.editCommets.trim()) return toast.error("Digite algo.")

        try {
            // Buscar o manga
            const mangaResponse = await fetch(`/api/mangas?id=${id}`);
            const mangaData = await mangaResponse.json();

            if (!mangaData.length) {
                toast.error("Mangá não encontrado");
                return;
            }

            const now = new Date();
            const offsetAmazonas = 4 * 60 * 60 * 1000; // 4 horas em milissegundos
            const dataAmazonas = new Date(now.getTime() - offsetAmazonas);

            // Criar uma cópia do array de comentários
            const updateComments = [...mangaData[0].comentario];

            // Atualizar o comentário específico
            updateComments[index] = {
                ...updateComments[index],
                comment: updateDadosInput.editCommets,
                date: dataAmazonas.toISOString().replace("T", " ").substring(0, 19)
            }

            // Criar o objeto atualizado do mangá
            const updateManga = {
                ...mangaData[0],
                comentario: updateComments
            };

            // Atualizar o backend com a alteração
            const response = await fetch(`/api/mangas?id=${id}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comentarios: updateComments })
            });

            if (response.ok) {
                toast.success("Comentário atualizado com sucesso!");
                buscarManga();
                update();
                setShowUploadsComp(false);
                setUpdateDadosInput(prev => ({ ...prev, editCommets: "" })); // Limpa o input
            } else {
                toast.error("Erro ao atualizar comentário!")
            }

        } catch (error) {
            console.error("Erro ao atualizar comentário!:", error);
            toast.error("Erro ao atualizar comentário!");
        }

    }

    const handleDeleteComment = async (index) => {
        try {
            // Buscar o manga
            const mangaResponse = await fetch(`/api/mangas?id=${id}`);
            const mangaData = await mangaResponse.json();

            if (!mangaData.length) {
                toast.error("Mangá não encontrado");
                return;
            }

            const updateComments = [...mangaData[0].comentario]; // Copia os comentários
            updateComments.splice(index, 1); // Remove o comentário pelo índice

            // Atualiza o banco de dados
            const response = await fetch(`/api/mangas?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comentarios: updateComments })
            });

            const data = await response.json();

            if (response.ok) {
                setManga((prev) => ({ ...prev, comentarios: updateComments })); // Atualiza o estado local com os comentários modificados
                toast.success("Comentário excluído com sucesso!");

                buscarManga();
                update();
            } else {
                toast.error(data.error || "Erro ao excluir comentário");
            }

        } catch (error) {
            console.error("Erro ao excluir o comentário:", error);
            toast.error("Erro ao excluir comentário");
        }
    }

    const buscarManga = async () => {
        try {
            const response = await fetch('/api/mangas');
            const data = await response.json();
            const mangaEncontrado = data.find(m => m.id === id);
            setManga(mangaEncontrado);
        } catch (error) {
            console.error("Erro ao buscar manga:", error);
        }
    };

    const handleCloseBoxUnique = () => {
        setOpen({ open: false, id: '' }); // Fecha o UniqueCard
        update(); // Atualiza a lista de mangás, se necessário
    };

    useEffect(() => {
        if (manga) {
            setUpdateDadosInput(prev => ({
                ...prev,
                titulo: manga.titulo || "",
                bio: manga.bio || "",
                fonte: manga.fonte || "",
                status: manga.status || "",
                detalhes: manga.detalhes || "",
                comentarios: "",
                commentsdb: manga.commentsdb || []
            }));
        }
    }, [manga])

    useEffect(() => {
        buscarManga();
    }, [id]);

    if (!manga) return "";

    return (
        <section className={styles.containerUniqueCard}>
            <div className={styles.boxUniqueCard}>
                <div className={styles.UniqueCard_header}>
                    {manga.imagem ? (
                        <img src={manga.imagem} alt="capa" onClick={() => handleClickEditComp("capa")} />
                    ) : (
                        <p>Imagem não disponível</p>
                    )}
                </div>

                <div className={styles.UniqueCard_main} onClick={() => handleClickEditComp("titulo")}>
                    {manga.titulo}
                    <span>
                        <p>{manga.categoria}</p>
                        <p>Cadastrado em {manga.data}</p>
                    </span>
                </div>

                <div className={styles.detaisEngrenage}>
                    <div onClick={() => handleClickEditComp("bio")}>
                        Bio: <span>{manga.bio || 'Não disponível'}</span>
                    </div>

                    <div onClick={() => handleClickEditComp("fonte")}>
                        Fonte: <span>{manga.fonte || 'Não disponível'}</span>
                    </div>

                    <div onClick={() => handleClickEditComp("detalhes")}>
                        Detalhes:
                        <div>
                            <p>Capítulos: <b>{manga.capitulosTotal}</b></p>
                            <p>|</p>
                            <p className={styles.capLidos}><b>{manga.capitulosLidos}</b> lidos</p>
                            <p>|</p>
                            <p><b>{manga.capitulosTotal - manga.capitulosLidos}</b> Restantes</p>
                        </div>
                    </div>

                    <div onClick={() => handleClickEditComp("status")}>
                        Status: <span style={{ textTransform: 'capitalize' }}>{manga.status}</span>
                    </div>

                    <div>
                        <span>Comentários:
                            <PlusCircleIcon
                                onClick={() => handleClickEditComp("comentarios")}
                                width={30}
                            />
                            <p className={styles.qtdComents}>
                                {manga.comentario?.length || 0} comentário
                                {manga.comentario?.length !== 1 && 's'}
                            </p>
                        </span>
                        <div>
                            {
                                manga.comentario?.length > 0 ? (
                                    manga.comentario.map((comentario, index) => (
                                        <span
                                            key={index}
                                            onClick={(e) => {
                                                handleClickComment(index);
                                            }}
                                        >
                                            <span>{comentario.comment}</span>
                                            <div style={{ display: 'flex', flexDirection: 'row', padding: '0', gap: '30px', justifyContent: 'flex-end', width: '100%' }}>
                                                {selectedCommentsIndex === index && ( // Verifica se o comentário clicado é o que está armazenado no estado
                                                    <>
                                                        <PencilIcon
                                                            onMouseEnter={() => setIsHovered(prev => ({ ...prev, edit: true }))}
                                                            onMouseLeave={() => setIsHovered(prev => ({ ...prev, edit: false }))}
                                                            style={{
                                                                backgroundColor: isHovered.edit ? 'yellow' : 'transparent',
                                                                cursor: 'pointer',
                                                                borderRadius: '5px',
                                                                padding: '5px',
                                                                color: isHovered.edit ? '#242424' : 'yellow'
                                                            }}
                                                            width={25}
                                                            color='yellow'
                                                            onClick={() => {
                                                                setUpdateDadosInput(prev => ({
                                                                    ...prev,
                                                                    editCommets: comentario.comment
                                                                }))
                                                                handleClickEditComp('editCommets')
                                                                setEditingIndex(index)
                                                            }}
                                                        />
                                                        <TrashIcon
                                                            onMouseEnter={() => setIsHovered(prev => ({ ...prev, delete: true }))}
                                                            onMouseLeave={() => setIsHovered(prev => ({ ...prev, delete: false }))}
                                                            style={{
                                                                backgroundColor: isHovered.delete ? 'red' : 'transparent',
                                                                cursor: 'pointer',
                                                                borderRadius: '5px',
                                                                padding: '5px',
                                                                color: isHovered.delete ? '#242424' : 'red'
                                                            }}
                                                            width={25}
                                                            color='yellow'
                                                            onClick={() => handleDeleteComment(index)}
                                                        />
                                                    </>
                                                )}
                                                <p>{comentario.date}</p>
                                            </div>
                                        </span>
                                    ))
                                ) : (
                                    <span>Sem comentário ...</span>
                                )
                            }
                        </div>
                    </div>
                </div>

                <HeartIcon
                    onClick={(e) => {
                        e.stopPropagation();
                        handleFavoritos(id);
                    }}
                    className={
                        `${isFavotited ? styles.favoritos_ativo : styles.favoritos_inativo}`
                    }
                />

                <div className={styles.close} onClick={handleCloseBoxUnique}></div>
            </div>

            {showUploadsComp && (
                // <section className={`${styles.containerUniqueCard} unique-card-container`}>
                <section className={`${styles.CompUploadsInputs_container} unique-card-container`}>
                    <form onSubmit={handleUpdateDados}>
                        <label>
                            {campoEditar === "capa" && 'Capa:'}
                            {campoEditar === "titulo" && 'Título:'}
                            {campoEditar === "fonte" && 'Fonte:'}
                            {campoEditar === "detalhes" && 'Detalhes:'}
                            {campoEditar === "comentarios" && 'Comentários:'}
                            {campoEditar === "bio" && 'Bio:'}
                            {campoEditar === "status" && 'Status:'}
                            {campoEditar === "editCommets" && 'Editar comentário:'}

                            {campoEditar === "capa" && <input onChange={handleImageChange} type="file" />}
                            {campoEditar === "bio" && (
                                <textarea
                                    rows={10}
                                    cols={30}
                                    style={{ resize: 'none', outlineColor: '#E7792B', border: '0', padding: '10px', borderRadius: '5px' }}
                                    placeholder='Digite a sua bio'
                                    value={updateDadosInput.bio}
                                    onChange={(e) => setUpdateDadosInput(prev => ({ ...prev, bio: e.target.value }))}
                                ></textarea>
                            )}
                            {campoEditar === "status" && (
                                <select
                                    value={updateDadosInput.status || manga.status}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '5px',
                                        textTransform: 'capitalize'
                                    }}
                                    onChange={(e) => setUpdateDadosInput(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    {/* Status atual como opção desativada */}
                                    <option disabled>{manga.status}</option>

                                    {/* Renderiza apenas os status diferentes do atual */}
                                    {["não iniciada", "em andamento", "em atualização", "concluida"]
                                        .filter(status => status !== manga?.status) // Remove duplicatas
                                        .map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                </select>
                            )}
                            {!(campoEditar === "capa" || campoEditar === "bio" || campoEditar === "status"
                                || campoEditar === "detalhes" || campoEditar === "editCommets") && (
                                    <input
                                        value={updateDadosInput[campoEditar] || manga[campoEditar] || ""}
                                        onChange={(e) => setUpdateDadosInput(prev => ({ ...prev, [campoEditar]: e.target.value }))}
                                        // required
                                        type="text"
                                        placeholder={
                                            updateDadosInput[campoEditar] || manga[campoEditar] || "Digite seu comentário"
                                        }
                                    />
                                )}
                            {campoEditar === "editCommets" && (
                                <input
                                    value={updateDadosInput.editCommets}
                                    onChange={(e) => setUpdateDadosInput(prev => ({ ...prev, editCommets: e.target.value }))}
                                    type="text"
                                    placeholder={updateDadosInput.editCommets}
                                />
                            )}
                            {campoEditar === "detalhes" && (
                                <input
                                    type="number"
                                    min={0}
                                    max={manga?.capitulosTotal}
                                    value={
                                        updateDadosInput.detalhes !== undefined
                                            ? updateDadosInput.detalhes
                                            : manga.capitulosLidos ?? 0  // Agora sempre mostra o valor correto
                                    }
                                    onChange={(e) => {
                                        let novoValor = e.target.value;

                                        if (novoValor === "") {
                                            setUpdateDadosInput(prev => ({
                                                ...prev,
                                                detalhes: "",
                                                status: manga?.status
                                            }));
                                            return;
                                        } else if (novoValor === "0") {
                                            setUpdateDadosInput(prev => ({
                                                ...prev,
                                                detalhes: novoValor,
                                                status: "não iniciada"
                                            }));
                                            return;
                                        }
                                        novoValor = Number(novoValor); // Converte para número
                                        setUpdateDadosInput(prev => ({
                                            ...prev,
                                            detalhes: novoValor,
                                            status:
                                                novoValor === 0 ? "não iniciada" :
                                                    novoValor >= manga?.capitulosTotal ? "concluida" :
                                                        "em andamento"
                                        }));
                                    }}
                                    placeholder={
                                        manga?.capitulosLidos !== undefined && manga?.capitulosLidos !== null
                                            ? `${manga.capitulosLidos} ${manga.capitulosLidos <= 1 ? "Capítulo lido" : "Capítulos lidos"}`
                                            : "Digite a quantidade de capítulos lidos"
                                    }
                                />
                            )}
                            <div>
                                <button onClick={() => setShowUploadsComp(false)} type='button'>Cancelar</button>
                                <button type='submit'>Salvar</button>
                            </div>
                        </label>
                    </form>
                </section>
            )}
        </section>
    );
}

export default UniqueCard;