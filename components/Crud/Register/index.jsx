import { useEffect, useState } from 'react';
import styles from './Register.module.css';
import { PencilIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

function Register({ setOpen, update, updateCategorias }) {
    const [showCadCategoria, setShowCadCategoria] = useState(false); // false
    const [inptCadCategoria, setInptCadCategoria] = useState('');
    const [rendCategoriaDB, setRendCategoriaDB] = useState([]);
    const [btnDesactive, setBtnDesactive] = useState(false);

    const [dadosInputs, setDadosInputs] = useState({
        capa: "",
        titulo: "",
        bio: "",
        fonte: "",
        categoria: "",
        qtdCapitulos: ""
    })

    const toastRegisterCategories = () => toast.success(`Categoria ${inptCadCategoria} cadastrada com sucesso!`);
    const toastDeleteRegisterCategoria = () => toast.success(`Categoria deletada com sucesso!`)
    const toastRegisterMangas = () => toast.success(`Mangá ${dadosInputs.titulo} cadastrada com sucesso!`);

    const dadosRendCategoriaDB = async () => {
        fetch('/api/categories')
            .then(response => response.json())
            .then(data => {
                setRendCategoriaDB(data)
            })
    }

    useEffect(() => {
        dadosRendCategoriaDB()
    }, []);

    useEffect(() => {
        const { capa, titulo, fonte, categoria, qtdCapitulos } = dadosInputs;
        if (capa && titulo && fonte && categoria && qtdCapitulos) {
            setBtnDesactive(true);
        } else {
            setBtnDesactive(false);
        }
    }, [dadosInputs]);

    const handleCadCategoria = (e) => {
        if (e.key === "Enter") {

            fetch("/api/categories", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ categoria: inptCadCategoria })
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data.mesage);
                    toastRegisterCategories();
                    setInptCadCategoria('');
                    dadosRendCategoriaDB();
                    update();
                    updateCategorias();
                })
                .catch(error => {
                    console.error("Erro ao cadastrar categoria", error);
                })
        }
    }

    const handDeleteCategoria = (id) => {
        fetch(`/api/categories?id=${id}`, {
            method: "DELETE",
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    dadosRendCategoriaDB();
                    toastDeleteRegisterCategoria();
                    update();
                    updateCategorias();
                    // console.log("categoria deletada:", data.mesage);
                }
            })
            .catch(error => {
                console.error("Erro ao deletar categoria:", error);
            })
    }

    // Função para lidar com o upload da imagem e converter para base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Quando a imagem for carregada, salva a base64 no estado
                setDadosInputs((prev) => ({
                    ...prev,
                    capa: reader.result
                }));
            };
            reader.readAsDataURL(file); // Converte a imagem para base64
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await fetch('/api/mangas', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosInputs)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    update();
                    toastRegisterMangas();
                    // console.log(data.mesage);
                    setDadosInputs(
                        {
                            capa: '',
                            categoria: '',
                            fonte: '',
                            qtdCapitulos: '',
                            titulo: '',
                            bio: ''
                        }
                    )
                }

                // Limpar o campo de input de arquivo (capa)
                const fileInput = document.getElementById(`fileinput`);
                fileInput.value = "";
            })
            .catch(error => {
                console.error("Erro ao cadastrar mangá.", error);
            })
    }

    return (
        <section className={styles.container}>

            <div
                className={styles.cadCategoria}
                style={{
                    width: showCadCategoria ? 'auto' : null
                }}
            >
                <span
                    onClick={() => setShowCadCategoria(!showCadCategoria)}
                    style={{
                        backgroundColor: showCadCategoria ? '#86eff6' : null,
                        color: showCadCategoria ? '#0b2123' : null
                    }}
                >Cadastrar Categoria
                </span>
                
                <article>
                    <label>
                        Categoria:
                        <input
                            type="text"
                            placeholder='Digite a categoria'
                            value={inptCadCategoria}
                            onChange={(e) => setInptCadCategoria(e.target.value)}
                            onKeyDown={(e) => handleCadCategoria(e)}
                        />
                    </label>
                    <table>
                        <thead>
                            <tr>
                                <th>nome categoria</th>
                                <th>action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rendCategoriaDB.length > 0 ? (
                                    rendCategoriaDB.map(categoria => (
                                        <tr key={categoria.id}>
                                            <td>{categoria.categoria}</td>
                                            <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                {/* <PencilIcon width={16} height={16} color='yellow' /> */}
                                                <TrashIcon onClick={() => handDeleteCategoria(categoria.id)} width={15} height={15} color='red' />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                fontSize: '.65rem',
                                                fontStyle: 'italic',
                                                textAlign: 'center'
                                            }}
                                        >Sem categorias cadastradas</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </article>
            </div>

            <div className={styles.boxForm}>

                <form onSubmit={handleRegister}>

                    <div className={styles.headerForm}>
                        <span>Cadastrar Mangás</span>
                        <span onClick={() => setOpen(false)}></span>
                    </div>

                    <div className={styles.mainForm}>

                        <label className={styles.lbl_titulo}>
                            Capa:
                            <input onChange={handleImageChange} id='fileinput' type="file" required />
                        </label>

                        <label className={styles.lbl}>
                            Titulo:
                            <input onChange={(e) => setDadosInputs((prev) => ({ ...prev, titulo: e.target.value }))} value={dadosInputs.titulo} type="text" required placeholder="Digite o titulo do mangá" />
                        </label>

                        <label className={styles.lbl}>
                            Bio:
                            <textarea
                                cols="20"
                                rows="5"
                                placeholder='Digite uma bio'
                                className={styles.txtarea}
                                value={dadosInputs.bio}
                                onChange={(e) => setDadosInputs((prev) => ({...prev, bio: e.target.value}))}
                            ></textarea>
                        </label>

                        <label className={styles.lbl}>
                            Fonte:
                            <input onChange={(e) => setDadosInputs((prev) => ({ ...prev, fonte: e.target.value }))} value={dadosInputs.fonte} type="text" placeholder="Digite a fonte do mangá" />
                        </label>

                        <label className={styles.lbl}>
                            Categoria:
                            <select onChange={(e) => setDadosInputs((prev) => ({ ...prev, categoria: e.target.value }))} value={dadosInputs.categoria} required>
                                <option disabled value="">Selecione uma categoria</option>
                                {
                                    rendCategoriaDB.map(category => (
                                        <option key={category.id} value={category.categoria}>{category.categoria}</option>
                                    ))
                                }
                            </select>
                        </label>

                        <label className={styles.lbl}>
                            Total de capítulos:
                            <input
                                onChange={(e) => setDadosInputs((prev) => ({ ...prev, qtdCapitulos: e.target.value }))}
                                value={dadosInputs.qtdCapitulos}
                                type="number"
                                placeholder="Digite o total de capítulos do mangá"
                            />
                        </label>

                    </div>

                    <div className={styles.footerForm}>
                        <button
                            disabled={!btnDesactive}
                            className={!btnDesactive ? styles.btnDesactive : styles.btnActive}
                            type="submit"
                        >Cadastrar</button>
                    </div>

                </form>

            </div>

        </section>
    )
}

export default Register;