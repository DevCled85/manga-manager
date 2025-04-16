// components/Card.jsx

import styles from './Card.module.css';
import { HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import UniqueCard from './UniqueCard';

function Card({ mangas, categoriasAtivas, showUerRoot, update, showUniqueCard, setShowUniqueCard, handleFavoritos, favoritos }) {
	const [categorias, setCategorias] = useState([]);
	// const [favoritos, setFavoritos] = useState(new Set());

	// Extrai as categorias únicas dos mangás, filtrando apenas as que possuem valor válido
	const arrCategorias = () => {
		const filtrarCategorias = mangas
			.map(manga => manga.categoria)
			.filter(categoria => categoria && categoria.trim() !== '' && categoriasAtivas.includes(categoria));
		const uniqueCategorias = [...new Set(filtrarCategorias)];

		setCategorias(uniqueCategorias);
	};

	// Função para favoritar ou desfavoritar um mangá
	// const handleFavoritos = async (id) => {
	// 	// console.log("Favoritar chamado", id);
	// 	try {
	// 		const isFavorited = favoritos.has(id);
	// 		const newFavoritos = new Set(favoritos);

	// 		if (isFavorited) {
	// 			newFavoritos.delete(id);
	// 		} else {
	// 			newFavoritos.add(id);
	// 		}

	// 		setFavoritos(newFavoritos); // Apenas altera o estado

	// 		// Enviar requisição ao backend
	// 		const response = await fetch(`/api/mangas?id=${id}`, {
	// 			method: 'PATCH',
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify({ favoritos: !isFavorited }) // Certifique-se de que o backend espera esse nome
	// 		});

	// 		const data = await response.json();

	// 		if (data.success) {
	// 			toast.success(data.message);
	// 		} else {
	// 			throw new Error(data.message);
	// 		}
	// 	} catch (error) {
	// 		console.error('Erro ao favoritar o mangá:', error);
	// 		toast.error("Erro ao favoritar o mangá.");
	// 	}
	// };

	const handleDeleteManga = (id) => {
		fetch(`/api/mangas?id=${id}`, {
			method: "DELETE",
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					toast.success(data.message);
					update();
				}
			})
			.catch(error => {
				console.error("Erro ao deletar categoria:", error);
			});
	};

	const handleUniqueCard_view = (id) => {
		if (id) {
			setShowUniqueCard({ open: true, id }); // Usa a função do componente pai
		}
	};

	// Atualiza as categorias sempre que a lista de mangás mudar
	useEffect(() => {
		if (mangas.length > 0) {
			arrCategorias();

			// Atualiza os favoritos com base no backend
			// setFavoritos(new Set(mangas.filter(manga => manga.favorito).map(manga => manga.id)));
		} else {
			setCategorias([]);
		}
	}, [mangas]);

	// Ordena os mangás por título (para as categorias normais)
	const sortedMangas = (mangasList) => {
		return mangasList.sort((a, b) => {
			if (a.titulo < b.titulo) return -1;
			if (a.titulo > b.titulo) return 1;
			return 0;
		});
	};

	// Computa os 10 últimos cadastrados com base na data de cadastro (supondo que a propriedade seja "data")
	const qtd_ultimosCadastrados = 20;
	const ultimosCadastrados = mangas.length
		? [...mangas]
			.sort((a, b) => new Date(b.data) - new Date(a.data))
			.slice(0, qtd_ultimosCadastrados)
		: [];

	return (
		<>
			{showUniqueCard.open &&
				<UniqueCard
					id={showUniqueCard.id}
					setOpen={setShowUniqueCard}
					update={update}
					handleFavoritos={handleFavoritos} // Passando a função para favoritar
					favoritos={favoritos} // Passando o estado de favoritos
				/>
			}

			{/* Seção fixa: Últimos cadastrados */}
			{ultimosCadastrados.length > 0 && (
				<section className={styles.boxCardCategoria}>
					<span className={styles.titleCategoria}>
						Últimos cadastrados
						<p>{ultimosCadastrados.length} items cadastrados</p>
					</span>
					<div className={styles.containerBoxCard}>
						{ultimosCadastrados.map(manga => (
							<div
								key={manga.id}
								className={styles.containerCard}
								onClick={() => handleUniqueCard_view(manga.id)}
							>
								<div className={styles.card}>
									<Image
										src={manga.imagem}
										width={100}
										height={100}
										unoptimized
										alt='capa'
										className={styles.imgCard}
									/>

									{showUerRoot && (
										<div className={styles.boxBtns}>
											<span>
												<TrashIcon
													width={25}
													color='#fff'
													onClick={() => handleDeleteManga(manga.id)}
												/>
											</span>
										</div>
									)}

									<span className={styles.overlow}></span>
									<div className={styles.boxTitleCategoria}>
										<span className={styles.qtdPag}>
											{manga.capitulosTotal} <i>páginas</i>
										</span>
										<span className={styles.title}>{manga.titulo}</span>
										<span className={styles.categoria}>{manga.status}</span>
									</div>
									<HeartIcon
										onClick={(e) => {
											e.stopPropagation();
											handleFavoritos(manga.id);
										}}
										className={`${styles.favoritos} ${favoritos.has(manga.id) ? styles.favInActive : ''}`}
									/>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Seção das demais categorias */}
			{categorias.map((category, index) => (
				<section key={index} className={styles.boxCardCategoria}>
					<span className={styles.titleCategoria}>
						{category}
						<p>{mangas.filter(manga => manga.categoria === category).length} items cadastrados</p>
					</span>

					<div className={styles.containerBoxCard}>
						{sortedMangas(mangas.filter(manga => manga.categoria === category))
							.map(manga => (
								<div
									key={manga.id}
									className={styles.containerCard}
									onClick={() => handleUniqueCard_view(manga.id)}
								>
									<div className={styles.card}>
										<Image
											src={manga.imagem}
											width={100}
											height={100}
											unoptimized
											alt='capa'
											className={styles.imgCard}
										/>

										{showUerRoot && (
											<div className={styles.boxBtns}>
												<span>
													<TrashIcon
														width={25}
														color='#fff'
														onClick={() => handleDeleteManga(manga.id)}
													/>
												</span>
											</div>
										)}

										<span className={styles.overlow}></span>
										<div className={styles.boxTitleCategoria}>
											<span className={styles.qtdPag}>
												{manga.capitulosTotal} <i>páginas</i>
											</span>
											<span className={styles.title}>{manga.titulo}</span>
											<span className={styles.categoria}>{manga.status}</span>
										</div>
										<HeartIcon
											onClick={(e) => {
												e.stopPropagation();
												handleFavoritos(manga.id);
											}}
											className={`${styles.favoritos} ${favoritos.has(manga.id) ? styles.favInActive : ''}`}
										/>
									</div>
								</div>
							))}
					</div>
				</section>
			))}
		</>
	);
}

export default Card;
