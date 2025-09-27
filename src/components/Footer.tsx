import centrops from "../assets/Centro_Paula_Souza.png";
import adalove from "../assets/AdaLove.png";

function Footer() {
  return (
    <footer className="app-footer">
      <img
        src={centrops}
        alt="Logo Centro Paula Souza"
        className="footer-logo"
      />
      <div className="developed-by">
        <p>Developed by</p>
        <img src={adalove} alt="Logo AdaLove" className="dalove" />
      </div>
    </footer>
  );
}

export default Footer;
