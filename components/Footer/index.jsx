
function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            style={{
                backgroundColor: '#242424',
                padding: '15px',
            }}
        >
            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    color: '#ccc',
                    fontSize: '.9rem'
                }}
            >
                @Todos os direitos reservados {year}
            </span>
        </footer>
    )
}

export default Footer;