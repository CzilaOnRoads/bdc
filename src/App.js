import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./styles.css"; // Assurez-vous que ce fichier est bien importé

export default function BonDeCommande() {
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [articles, setArticles] = useState([]);

  const ajouterArticle = () => {
    setArticles([...articles, { reference: "", prixHT: 0, quantite: 1, remise: 0 }]);
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

  const genererPDF = async () => {
    const doc = new jsPDF();
  
    // Ajouter le logo (remplace "logo.png" par ton vrai chemin)
    const img = new Image();
    img.src = "/logo.png"; // Assure-toi que le fichier est accessible dans /public/
    
    img.onload = function () {
      doc.addImage(img, "PNG", 10, 5, 50, 20); // Position X=10, Y=5, largeur=50, hauteur=20
  
      doc.setFontSize(16);
      doc.text("Bon de commande", 105, 35, null, null, "center"); // Ajuste la position sous le logo
    
      // Continuer la génération du PDF...
      doc.setFontSize(12);
      doc.text(`Entreprise: ${entreprise}`, 10, 50);
      doc.text(`Email: ${email}`, 10, 60);
  
      autoTable(doc, {
        startY: 70,
        head: [["Référence", "Prix HT (€)", "Quantité", "Remise (%)", "Total (€)"]],
        body: articles.map((article) => [
          article.reference,
          article.prixHT.toFixed(2),
          article.quantite,
          article.remise,
          calculerTotalArticle(article),
        ]),
        theme: "grid",
      });
  
      doc.text(`Total: ${totalGeneralHT.toFixed(2)} € HT`, 10, doc.lastAutoTable.finalY + 10);
      doc.text(`Total TTC: ${totalTTC} € TTC`, 10, doc.lastAutoTable.finalY + 20);
  
      // Sauvegarde du PDF
      doc.save("bon_de_commande.pdf");
    };
  };

  return (
    <div className="container">
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="Logo de l'entreprise" className="h-16" />
      </div>
      <h1>Bon de Commande</h1>

      {/* Champs Entreprise et Email */}
      <div className="form-group">
        <input
          className="input-field"
          type="text"
          placeholder="Nom de l'entreprise"
          value={entreprise}
          onChange={(e) => setEntreprise(e.target.value)}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Tableau des articles */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Prix HT (€)</th>
              <th>Quantité</th>
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
                    min="0"
                    value={article.prixHT}
                    onChange={(e) => mettreAJourArticle(index, "prixHT", e.target.value)}
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
