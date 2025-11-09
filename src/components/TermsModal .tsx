import React from 'react';
import '../index.css';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
    title?: string;
}

const TermsModal: React.FC<TermsModalProps> = ({
    isOpen,
    onClose,
    isDarkMode = false,
    title = "Termos e Condições de Uso"
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`modal-overlay ${isDarkMode ? 'dark-mode' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`modal-content ${isDarkMode ? 'dark-mode' : ''}`}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <section>
                        <h3>1. Aceitação dos Termos</h3>
                        <p>
                            Ao acessar e utilizar o <b>Sistema AdaTech</b>, o usuário concorda em cumprir estes Termos e Condições de Uso.
                            O acesso é restrito aos colaboradores autorizados da <b>Tecsys</b> e destina-se exclusivamente a fins operacionais internos.
                        </p>

                        <h3>2. Finalidade do Sistema</h3>
                        <p>
                            O sistema tem como objetivo automatizar a geração de instruções de importação, otimizando o preenchimento de informações técnicas e fiscais de produtos importados.
                            <br />
                            Seu uso é voltado para apoiar o trabalho de despachantes aduaneiros e profissionais responsáveis pela classificação fiscal de mercadorias.
                        </p>

                        <h3>3. Responsabilidades do Usuário</h3>
                        <ul>
                            <li>Garantir que as informações inseridas sejam verdadeiras, completas e atualizadas;</li>
                            <li>Utilizar o sistema apenas para fins profissionais relacionados às atividades da <b>Tecsys</b>;</li>
                            <li>Manter a confidencialidade das credenciais de acesso;</li>
                            <li>Não divulgar, copiar ou reproduzir dados gerados pelo sistema sem autorização da empresa.</li>
                        </ul>

                        <h3>4. Responsabilidades da Equipe de Desenvolvimento</h3>
                        <p>
                            Por se tratar de um projeto acadêmico, a <b>Equipe Adalove</b> não se responsabiliza por danos diretos ou indiretos decorrentes do uso indevido do sistema.
                            <br />
                            O ambiente pode conter limitações e funcionalidades em desenvolvimento.
                        </p>

                        <h3>5. Propriedade Intelectual</h3>
                        <p>
                            Todo o conteúdo, código-fonte e design do <b>Sistema AdaTech</b> são de uso exclusivo da <b>Tecsys</b> e da <b>Equipe Adalove</b> responsável pelo projeto, não sendo permitida sua reprodução ou modificação sem autorização prévia.
                        </p>

                        <h3>6. Alterações e Atualizações</h3>
                        <p>
                            A <b>Tecsys</b> e a <b>Equipe Adalove</b> poderão atualizar o sistema ou estes Termos a qualquer momento, visando aprimorar sua segurança e funcionalidade.
                            <br />
                            O uso continuado implica na aceitação das novas condições.
                        </p>

                        <h3>7. Encerramento de Acesso</h3>
                        <p>
                            A <b>Tecsys</b> reserva-se o direito de suspender ou encerrar o acesso de qualquer usuário que viole estes Termos ou utilize o sistema de forma inadequada.
                        </p>
                    </section>
                </div>


                <div className="modal-footer">
                    <button className="accept-button" onClick={onClose}>
                        Entendi e Concordo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;