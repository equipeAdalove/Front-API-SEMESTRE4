import React from 'react';
import '../index.css';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
    title?: string;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({
    isOpen,
    onClose,
    isDarkMode = false,
    title = "Política de Privacidade"
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
                        <h3>1. Coleta de Dados</h3>
                        <p>O sistema coleta apenas os dados necessários para o seu funcionamento, incluindo:</p>
                        <ul>
                            <li>
                                Informações técnicas de itens importados (part number, descrição técnica do item,
                                NCM, nome e endereço do fabricante, incluindo o país de origem);
                            </li>
                            <li>Dados de login e identificação do colaborador autorizado.</li>
                        </ul>

                        <h3>2. Uso das Informações</h3>
                        <p>Os dados coletados são utilizados exclusivamente para:</p>
                        <ul>
                            <li>Geração automatizada das instruções aduaneiras;</li>
                            <li>Verificação fiscal e classificação de produtos;</li>
                            <li>Auditoria e rastreabilidade das ações realizadas no sistema.</li>
                        </ul>

                        <h3>3. Compartilhamento de Dados</h3>
                        <p>
                            As informações processadas não são compartilhadas com terceiros. Apenas usuários
                            autorizados da <b>Tecsys</b> e a equipe de suporte técnico do projeto têm acesso restrito às
                            informações, conforme necessidade operacional.
                        </p>

                        <h3>4. Armazenamento e Segurança</h3>
                        <p>
                            Os dados são armazenados em ambiente seguro, com acesso controlado. São adotadas
                            práticas de segurança digital adequadas para proteger as informações contra perda,
                            acesso indevido, alteração ou divulgação não autorizada.
                        </p>

                        <h3>5. Direitos dos Usuários</h3>
                        <p>
                            Os usuários podem solicitar a correção ou exclusão de seus dados pessoais, mediante
                            comunicação com o responsável interno da <b>Tecsys</b>. Como o sistema é de uso interno,
                            não há coleta de dados sensíveis ou informações de clientes externos.
                        </p>

                        <h3>6. Retenção de Dados</h3>
                        <p>
                            As informações são mantidas apenas pelo tempo necessário para cumprir a finalidade do
                            sistema e as exigências legais ou operacionais da <b>Tecsys</b>.
                        </p>

                        <h3>7. Alterações na Política</h3>
                        <p>
                            Esta política poderá ser atualizada a qualquer momento para refletir melhorias de
                            segurança, alterações legais ou operacionais. Recomenda-se que os usuários revisem
                            periodicamente o documento.
                        </p>

                        <h3>8. Contato</h3>
                        <p>
                            Dúvidas sobre privacidade ou segurança de dados podem ser encaminhadas ao setor
                            responsável da <b>Tecsys</b>.
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

export default PrivacyModal;