function FormSection() {
  return (
    <section className="data-preview-section">
      <h2>Pré-visualização dos dados:</h2>
      <form className="data-form">
        <div className="form-group">
          <label htmlFor="manufacturer-name">Nome do Fabricante:</label>
          <input id="manufacturer-name" type="text" className="form-input" />
          <p className="form-note">
            O fabricante "ABC" será adicionado ao banco de dados!
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="manufacturer-address">Endereço do Fabricante:</label>
          <input id="manufacturer-address" type="text" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="part-number">Part-Number:</label>
          <input id="part-number" type="text" className="form-input" />
        </div>
        <div className="form-group description-group">
          <label htmlFor="description">Descrição:</label>
          <textarea id="description" className="form-textarea"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="ncm-code">Código NCM:</label>
          <input id="ncm-code" type="text" className="form-input" />
        </div>
      </form>
      <p className="editable-note">É possível editar os campos!</p>
    </section>
  );
}

export default FormSection;
