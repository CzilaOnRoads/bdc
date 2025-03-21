import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./styles.css";
import logo from "./logo.png";

export default function BonDeCommande() {
  const [typeDocument, setTypeDocument] = useState("Bon de commande");
  const [dateSaisie, setDateSaisie] = useState(null);
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [articles, setArticles] = useState([]);

  const handleFirstInput = () => {
    if (!dateSaisie) {
      setDateSaisie(new Date());
    }
  };

  const ajouterArticle = () => {
    setArticles([...articles, { reference: "", quantite: 1, prixHT: 0, remise: 0 }]);
  };

  const mettreAJourArticle = (index, field, value) => {
    const newArticles = [...articles];
    newArticles[index][field] = field === "reference" ? value : Number(value) || 0;
    setArticles(newArticles);
  };

  const supprimerArticle = (index) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const calculerTotalArticle = (article) => {
    return ((article.prixHT - (article.prixHT * article.remise / 100)) * article.quantite).toFixed(2);
  };

  const totalGeneralHT = articles.reduce((total, article) => total + parseFloat(calculerTotalArticle(article)), 0);
  const totalTTC = (totalGeneralHT * 1.2).toFixed(2);

  const genererPDF = () => {
    const doc = new jsPDF();
    const dateGeneration = new Date();
    const dateSaisieFormatee = dateSaisie
      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(dateSaisie)
      : "Non renseignée";
    const dateGenerationFormatee = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(dateGeneration);

    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, "PNG", 10, 5, 50, 20);
      doc.setFontSize(16);
      doc.text(typeDocument, 105, 35, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Entreprise: ${entreprise}`, 10, 50);
      doc.text(`Email: ${email}`, 10, 60);
      doc.text(`Date de création: ${dateGenerationFormatee}`, 10, 70);

      autoTable(doc, {
        startY: 90,
        head: [["Référence", "Quantité", "Prix HT (€)", "Remise (%)", "Total (€)"]],
        body: articles.map((article) => [
          article.reference,
          article.quantite,
          article.prixHT.toFixed(2),
          article.remise,
          calculerTotalArticle(article),
        ]),
        theme: "grid",
      });

      const positionY = doc.lastAutoTable.finalY + 10;
      doc.text(`Total HT: ${totalGeneralHT.toFixed(2)} €`, 10, positionY);
      doc.text(`Total TTC: ${totalTTC} €`, 10, positionY + 10);

      const nomEntreprise = entreprise.trim() !== "" ? entreprise.replace(/\s+/g, "_") : "document";
      doc.save(`${typeDocument.replace(/\s+/g, "_")}_${nomEntreprise}.pdf`);
    };

    img.onerror = () => {
      console.error("Erreur de chargement du logo.");
      alert("Impossible de charger le logo.");
    };
  };

  return (
    <div className="container">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo de l'entreprise" className="h-16" />
      </div>
      <h1>{typeDocument}</h1>

      {/* Sélection du type de document */}
      <div className="form-group">
        <label>Type de document :</label>
        <select
          className="input-field"
          value={typeDocument}
          onChange={(e) => setTypeDocument(e.target.value)}
        >
          <option value="Bon de commande">Bon de commande</option>
          <option value="Bon de livraison">Bon de livraison</option>
        </select>
      </div>

      {/* Champs Entreprise et Email */}
      <div className="form-group">
        <input
          className="input-field"
          type="text"
          placeholder="Nom de l'entreprise"
          value={entreprise}
          onChange={(e) => {
            setEntreprise(e.target.value);
            handleFirstInput();
          }}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            handleFirstInput();
          }}
        />
      </div>

      {/* Tableau des articles */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Quantité</th>
              <th>Prix HT (€)</th>
              <th>Remise (%)</th>
              <th>Total (€)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <tr key={index}>
                <td>
                  <input
                    className="table-input"
                    type="text"
                    value={article.reference}
                    onChange={(e) => mettreAJourArticle(index, "reference", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    min="1"
                    value={article.quantite}
                    onChange={(e) => mettreAJourArticle(index, "quantite", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    min="0"
                    value={article.prixHT}
                    onChange={(e) => mettreAJourArticle(index, "prixHT", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    min="0"
                    value={article.remise}
                    onChange={(e) => mettreAJourArticle(index, "remise", e.target.value)}
                  />
                </td>
                <td className="total-cell">{calculerTotalArticle(article)} €</td>
                <td>
                  <button className="delete-btn" onClick={() => supprimerArticle(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bouton pour ajouter un article */}
      <div className="button-container">
        <button className="btn add-btn" onClick={ajouterArticle}>
          Ajouter un article
        </button>
      </div>

      {/* Totaux */}
      <div className="total-container">
        <h2>Total HT: {totalGeneralHT.toFixed(2)} €</h2>
        <div className="total-box">Total TTC: {totalTTC} €</div>
      </div>

      {/* Bouton Générer PDF */}
      <div className="button-container">
        <button className="btn pdf-btn" onClick={genererPDF}>
          Générer PDF
        </button>
      </div>
    </div>
  );
}
