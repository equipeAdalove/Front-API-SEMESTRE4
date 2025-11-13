import React, { useState, useEffect, useRef, useMemo } from 'react'; // NOVO: Importa useMemo
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { FaEllipsisV, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa'; 

type TransacaoInfo = {
    id: number;
    nome: string | null; 
    created_at: string;
};

// Objeto auxiliar para os meses
const mesesDoAno = [
    { val: "1", nome: "Janeiro" },
    { val: "2", nome: "Fevereiro" },
    { val: "3", nome: "Março" },
    { val: "4", nome: "Abril" },
    { val: "5", nome: "Maio" },
    { val: "6", nome: "Junho" },
    { val: "7", nome: "Julho" },
    { val: "8", nome: "Agosto" },
    { val: "9", nome: "Setembro" },
    { val: "10", nome: "Outubro" },
    { val: "11", nome: "Novembro" },
    { val: "12", nome: "Dezembro" },
];

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
                {/* NOVO: Adiciona data formatada (opcional, mas ajuda) */}
                <span className="sidebar-item-date">
                    {new Date(transacao.created_at).toLocaleDateString()}
                </span>
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
    // ALTERADO: Renomeado para guardar a lista completa
    const [allTransacoes, setAllTransacoes] = useState<TransacaoInfo[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // NOVO: Estados para os filtros e anos disponíveis
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    const fetchTransacoes = async () => {
        setIsLoading(true);
        try {
        const response = await fetchAPI('http://localhost:8000/api/transacoes');
        if (!response.ok) {
            throw new Error('Falha ao buscar histórico.');
        }
        const data: TransacaoInfo[] = await response.json();
        setAllTransacoes(data); // ALTERADO: Seta a lista completa
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
    
    // NOVO: useEffect para extrair os anos disponíveis da lista de transações
    useEffect(() => {
        if (allTransacoes.length > 0) {
            const years = allTransacoes.map(t => 
                new Date(t.created_at).getFullYear().toString()
            );
            const uniqueYears = [...new Set(years)].sort((a, b) => b.localeCompare(a)); // Ordena do mais novo para o mais antigo
            setAvailableYears(uniqueYears);
        }
    }, [allTransacoes]);

    // NOVO: useMemo para aplicar os filtros
    const filteredTransacoes = useMemo(() => {
        return allTransacoes.filter(t => {
            const itemDate = new Date(t.created_at);
            const itemYear = itemDate.getFullYear().toString();
            const itemMonth = (itemDate.getMonth() + 1).toString(); // JS Date.getMonth() é 0-11

            // Se selectedYear não estiver setado (valor ' ') ou for igual, 'yearMatch' é true
            const yearMatch = !selectedYear || itemYear === selectedYear;
            // Se selectedMonth não estiver setado (valor ' ') ou for igual, 'monthMatch' é true
            const monthMatch = !selectedMonth || itemMonth === selectedMonth;

            return yearMatch && monthMatch;
        });
    }, [allTransacoes, selectedYear, selectedMonth]);

    const handleNewProcess = () => {
        onClose(); 
        navigate('/principal'); 
        // NOVO: Limpa os filtros ao criar um novo processo
        setSelectedYear('');
        setSelectedMonth('');
    };

    const handleRename = async (id: number, novoNome: string) => {
        try {
        const response = await fetchAPI(`http://localhost:8000/api/transacao/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ nome: novoNome })
        });
        if (!response.ok) throw new Error("Falha ao renomear.");
        toast.success("Processo renomeado!");
        // ALTERADO: Atualiza a lista completa
        setAllTransacoes(prev => prev.map(t => t.id === id ? { ...t, nome: novoNome } : t));
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
        // ALTERADO: Atualiza a lista completa
        setAllTransacoes(prev => prev.filter(t => t.id !== id));
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
                
                {/* NOVO: Seção de Filtros */}
                <div className="sidebar-filters">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="">Todos os Meses</option>
                        {mesesDoAno.map(mes => (
                            <option key={mes.val} value={mes.val}>{mes.nome}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">Todos os Anos</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                {/* Fim da Seção de Filtros */}

                <button onClick={handleNewProcess} className="new-process-btn">
                    <FaPlus /> Novo Processo
                </button>
            </div>
            
            <div className="sidebar-list">
            {isLoading ? (
                <Loader />
            ) : (
                // ALTERADO: Mapeia a lista filtrada
                filteredTransacoes.map((t) => (
                <HistoryItem 
                    key={t.id}
                    transacao={t}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onCloseSidebar={onClose}
                />
                ))
            )}
            {/* ALTERADO: Verifica a lista filtrada */}
            {filteredTransacoes.length === 0 && !isLoading && (
                <p className="sidebar-empty">
                    {allTransacoes.length > 0 ? "Nenhum processo encontrado para este filtro." : "Nenhum processo encontrado."}
                </p>
            )}
            </div>
        </div>
        </>
    );
};

export default HistorySidebar;