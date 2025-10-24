import type { ProcessedItem } from "../types";

type FormSectionProps = {
  item: ProcessedItem;
  index: number;
  onItemChange: (index: number, field: keyof ProcessedItem, value: string) => void;
};

function FormSection({ item, index, onItemChange }: FormSectionProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onItemChange(index, name as keyof ProcessedItem, value);
  };

  return (
    <div className="data-preview-section">

      <form className="data-form">
        <div className="form-group">
          <label htmlFor={`manufacturer-name-${index}`}>Nome do Fabricante:</label>
          <input
            id={`manufacturer-name-${index}`}
            name="fabricante"
            type="text"
            className="form-input"
            value={item.fabricante}
            onChange={handleChange}
          />
          {item.is_new_manufacturer && (
            <p className="form-note">
              O fabricante "{item.fabricante}" será adicionado ao banco de dados!
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor={`manufacturer-address-${index}`}>Endereço do Fabricante:</label>
          <input
            id={`manufacturer-address-${index}`}
            name="localizacao"
            type="text"
            className="form-input"
            value={item.localizacao}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`part-number-final-${index}`}>Part-Number:</label>
          <input
            id={`part-number-final-${index}`}
            name="partnumber"
            type="text"
            className="form-input"
            value={item.partnumber}
            readOnly
          />
        </div>
        <div className="form-group description-group">
          <label htmlFor={`description-${index}`}>Descrição:</label>
          <textarea
            id={`description-${index}`}
            name="descricao"
            className="form-textarea"
            value={item.descricao}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor={`ncm-code-${index}`}>Código NCM:</label>
          <input
            id={`ncm-code-${index}`}
            name="ncm"
            type="text"
            className="form-input"
            value={item.ncm}
            onChange={handleChange}
          />
        </div>
      </form>
    </div>

  );
}

export default FormSection;