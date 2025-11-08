import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { FaEllipsisV, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa'; 

type TransacaoInfo = {
    id: number;
    nome: string | null; 
    created_at: string;
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

type HistorySidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const HistoryItem: React.FC<{
    transacao: TransacaoInfo;
    onDelete: (id: number) => void;
    onRename: (id: number, newName: string) => void;
    onCloseSidebar: () => void;
    }> = ({ transacao, onDelete, onRename, onCloseSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(transacao.nome || '');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);

    const handleRenameClick = () => {
        setIsEditing(true);
        setIsDropdownOpen(false);
        setEditName(transacao.nome || `Processo #${transacao.id}`);
    };

    const handleSaveRename = () => {
        if (editName.trim()) {
        onRename(transacao.id, editName);
        setIsEditing(false);
        } else {
        toast.error("O nome não pode ficar vazio.");
        }
    };

    const handleDeleteClick = () => {
        if (window.confirm(`Tem certeza que deseja excluir "${transacao.nome || `Processo #${transacao.id}`}"?`)) {
        onDelete(transacao.id);
        setIsDropdownOpen(false);
        }
    };

    return (
        <div className="sidebar-item">
        {isEditing ? (
            <>
            <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="sidebar-edit-input"
                autoFocus
            />
            <div className="sidebar-item-actions editing">
                <FaSave onClick={handleSaveRename} />
                <FaTimes onClick={() => setIsEditing(false)} />
            </div>
            </>
        ) : (
            <>
            <Link 
                to={`/principal/${transacao.id}`} 
                className="sidebar-link"
                onClick={onCloseSidebar}
            >
                {transacao.nome || `Processo #${transacao.id}`}
            </Link>
            <div className="sidebar-item-actions" ref={dropdownRef}>
                <FaEllipsisV onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                {isDropdownOpen && (
                <div className="sidebar-dropdown-menu">
                    <button onClick={handleRenameClick}><FaEdit /> Renomear</button>
                    <button onClick={handleDeleteClick} className="delete"><FaTrash /> Excluir</button>
                </div>
                )}
            </div>
            </>
        )}
        </div>
    );
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

    const handleRename = async (id: number, novoNome: string) => {
        try {
        const response = await fetchAPI(`http://localhost:8000/api/transacao/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ nome: novoNome })
        });
        if (!response.ok) throw new Error("Falha ao renomear.");
        toast.success("Processo renomeado!");
        setTransacoes(prev => prev.map(t => t.id === id ? { ...t, nome: novoNome } : t));
        } catch (err: any) {
        toast.error(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        try {
        const response = await fetchAPI(`http://localhost:8000/api/transacao/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Falha ao excluir.");
        toast.success("Processo excluído!");
        setTransacoes(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
        toast.error(err.message);
        }
    };

return (
    <>
        <div 
            className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
            onClick={onClose}
        ></div>
        
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
                <HistoryItem 
                    key={t.id}
                    transacao={t}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onCloseSidebar={onClose}
                />
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