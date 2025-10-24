import type { ExtractedItem } from "../types";

type ExtractionFormProps = {
    item: ExtractedItem;
    index: number;
    onItemChange: (index: number, field: keyof ExtractedItem, value: string) => void;
};

function ExtractionFormSection({ item, index, onItemChange }: ExtractionFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onItemChange(index, name as keyof ExtractedItem, value);
};

return (
    <div className="data-preview-section extraction-form">
        <form className="data-form-extraction">
            <div className="form-group">
                <label htmlFor={`partnumber-${index}`}>Part-Number:</label>
                <input
                id={`partnumber-${index}`}
                name="partnumber"
                type="text"
                className="form-input"
                value={item.partnumber}
                onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor={`descricao_raw-${index}`}>Descrição Extraída:</label>
                <textarea
                id={`descricao_raw-${index}`}
                name="descricao_raw"
                className="form-textarea-small"
                value={item.descricao_raw}
                onChange={handleChange}
                ></textarea>
            </div>
        </form>
    </div>
);
}

export default ExtractionFormSection;