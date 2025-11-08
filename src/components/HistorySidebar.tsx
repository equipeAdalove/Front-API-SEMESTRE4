import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { FaEdit, FaPlus } from 'react-icons/fa'; 

type TransacaoInfo = {
    id: number;
    nome: string;
    created_at: string;
};

type HistorySidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const fetchAPI = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("authToken");
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = '/login'; 
        throw new Error("Sessão expirada. Faça login novamente.");
    }
    
    return response;
};


const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose }) => {
    const [transacoes, setTransacoes] = useState<TransacaoInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchTransacoes = async () => {
        setIsLoading(true);
        try {
        const response = await fetchAPI('http://localhost:8000/api/transacoes');
        if (!response.ok) {
            throw new Error('Falha ao buscar histórico.');
        }
        const data: TransacaoInfo[] = await response.json();
        setTransacoes(data);
        } catch (err: any) {
        toast.error(err.message);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
        fetchTransacoes();
        }
    }, [isOpen]);

    const handleNewProcess = () => {
        onClose(); 
        navigate('/principal'); 
    };
    
    const handleRename = async (id: number) => {
        const novoNome = prompt("Digite o novo nome para o processo:", 
        transacoes.find(t => t.id === id)?.nome
        );
        
        if (novoNome && novoNome.trim()) {
        try {
            const response = await fetchAPI(`http://localhost:8000/api/transacao/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ nome: novoNome })
            });
            if (!response.ok) throw new Error("Falha ao renomear.");
            toast.success("Processo renomeado!");
            fetchTransacoes(); 
        } catch (err: any) {
            toast.error(err.message);
        }
        }
    };
    
    // TODO: Função de Delete (ex: /api/transacao/{id} - Método DELETE)
    // const handleDelete = (id: number) => { ... }

    return (
        <>
        {/* Overlay (fundo escuro) */}
        <div 
            className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
            onClick={onClose}
        ></div>
        
        {/* Menu Sidebar */}
        <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
            <h3>Histórico de Processos</h3>
            <button onClick={handleNewProcess} className="new-process-btn">
                <FaPlus /> Novo Processo
            </button>
            </div>
            
            <div className="sidebar-list">
            {isLoading ? (
                <Loader />
            ) : (
                transacoes.map((t) => (
                <div key={t.id} className="sidebar-item">
                    <Link 
                    to={`/principal/${t.id}`} 
                    className="sidebar-link"
                    onClick={onClose} // Fecha a sidebar ao navegar
                    >
                    {t.nome || `Transacao #${t.id}`}
                    </Link>
                    <div className="sidebar-item-actions">
                    <FaEdit onClick={() => handleRename(t.id)} />
                    {/* <FaTrash onClick={() => handleDelete(t.id)} /> */}
                    </div>
                </div>
                ))
            )}
            {transacoes.length === 0 && !isLoading && (
                <p className="sidebar-empty">Nenhum processo encontrado.</p>
            )}
            </div>
        </div>
        </>
    );
};

export default HistorySidebar;