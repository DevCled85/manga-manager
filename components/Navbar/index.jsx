import { useState } from 'react';
import styles from './Navbar.module.css';
import {
    UserIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    HeartIcon,
    // Cog6ToothIcon
} from '@heroicons/react/24/outline'
import Register from '../Crud/Register';
import Card from '../Card';
import { useRouter } from 'next/router';
import Search from '../Search';

function Navbar({ update, updateCategorias, showUerRoot, setShowUerRoot, showUniqueCard, setShowUniqueCard }) {
    const [openRegister, setOpenRegister] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [closingSearch, setClosingSearch] = useState(false);

    const router = useRouter();

    // Função para nvegação
    const handleNavigate = (path) => {
        router.push(path); // Navega para a página especificada
    }

    // Verifica se estamos na página de favoritos
    const isFavoritePage = router.pathname === '/favoritos';

    const toggleSearch = () => {
        if (showSearch) {
            setClosingSearch(true); // Ativa a animação de fechamento

            setTimeout(() => {
                setShowSearch(false); // Remove o search da tela após a animação
                setClosingSearch(false); // Reseta o estado
            }, 500); // Tempo da animação (deve ser igual ao CSS)
        } else {
            setShowSearch(true);
            setClosingSearch(false); // Garante que a classe de fechamento não fique ativa
        }
    };

    return (
        <header className={styles.header}>
            <span className={styles.logoTxt} onClick={() => handleNavigate('/')}>Web registro de leituras 📚
            </span>

            {showUerRoot &&
                <span
                    className={styles.userRoot}
                    onClick={() => setShowUerRoot(!showUerRoot)}
                >Usuário Root</span>
            }

            <div>
                {!isFavoritePage && !showUerRoot && (
                    <UserPlusIcon
                        className={styles.btnOpt}
                        width={25}
                        onClick={() => setOpenRegister(true)}
                    />
                )}
                {openRegister && <Register setOpen={setOpenRegister} update={update} updateCategorias={updateCategorias} />}

                {/* campo de search */}
                {!isFavoritePage && !showUerRoot && (
                    <MagnifyingGlassIcon
                        width={25}
                        className={styles.icoSearch}
                        onClick={toggleSearch} // Alterado para usar toggleSearch
                    />
                )}
                {showSearch && <Search closing={closingSearch} toggleSearch={toggleSearch} setShowUniqueCard={setShowUniqueCard} showUniqueCard={showUniqueCard} />}

                {!showUerRoot && (
                    <HeartIcon
                        width={25}
                        className={styles.favorite}
                        onClick={() => handleNavigate('/favoritos')}
                    />
                )}

                {!isFavoritePage && !showUerRoot && (
                    <UserIcon
                        className={`${styles.btnOpt}`}
                        width={25}
                        onClick={() => setShowUerRoot(true)}
                        style={{
                            display: showUerRoot ? 'none' : null,
                        }}
                    />
                )}

            </div>
        </header>
    )
}

export default Navbar;