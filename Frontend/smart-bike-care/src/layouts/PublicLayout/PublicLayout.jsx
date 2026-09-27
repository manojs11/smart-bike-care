import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./PublicLayout.css";

function PublicLayout({ children }) {

  return (
    <div className="public-layout">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;