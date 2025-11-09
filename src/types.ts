export type ExtractedItem = {
    partnumber: string;
    descricao_raw: string;
};

export type ProcessedItem = {
    partnumber: string;
    fabricante: string;
    localizacao: string;
    ncm: string;
    descricao: string;
    is_new_manufacturer: boolean;
};


