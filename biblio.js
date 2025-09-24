
// Livre (minimum requis)
const livre = {
    id: 1,
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    quantiteTotal: 3,
    quantiteDisponible: 2
};

// Utilisateur (minimum requis)
const utilisateur = {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@email.com"
};

// Emprunt (minimum requis)
const emprunt = {
    id: 1,
    utilisateurId: 1,
    livreId: 1,
    dateEmprunt: new Date().toLocaleDateString(),
    statut: "actif" // "actif" ou "retourné"
};



// Données globales (à déclarer au début)

let livres = [];
let utilisateurs = [];
let emprunts = [];
let prochainIdLivre = 1;
let prochainIdUtilisateur = 1;
let prochainIdEmprunt = 1;

//Livres

// === Helpers LocalStorage ===
const LS_KEY = "livres";
const LS_ID  = "prochainIdLivre";

function getLivres() {
  return JSON.parse(localStorage.getItem(LS_KEY)) || [];
}
function setLivres(livres) {
  localStorage.setItem(LS_KEY, JSON.stringify(livres));
}
function getNextId() {
  const n = Number(localStorage.getItem(LS_ID)) || 1;
  localStorage.setItem(LS_ID, String(n + 1));
  return n;
}

// === Ajouter / mettre à jour un livre ===
function ajouterLivre(titre, auteur, quantite) {
  // Validation
  const q = Number(quantite);
  if (!titre || !auteur || !Number.isFinite(q) || q <= 0) {
    return { succes: false, message: "Tous les champs sont requis et la quantité doit être > 0." };
  }

  // Option : normaliser pour éviter les doublons "1984" vs "1984 "
  const T = titre.trim();
  const A = auteur.trim();

  const livres = getLivres();

  // Chercher si le livre existe déjà (même titre + auteur)
  const existant = livres.find(l => l.titre === T && l.auteur === A);

  if (existant) {
    existant.quantiteDisponible = (existant.quantiteDisponible || 0) + q;
    existant.quantiteTotal      = (existant.quantiteTotal || 0) + q;
    setLivres(livres);
    return { succes: true, message: "Livre trouvé : stocks mis à jour." };
  }

  // Créer le nouveau livre
  const nouveauLivre = {
    id: getNextId(),
    titre: T,
    auteur: A,
    quantiteTotal: q,
    quantiteDisponible: q,
  };

  livres.push(nouveauLivre);
  setLivres(livres);

  return { succes: true, message: "Nouveau livre ajouté à la bibliothèque." };
}

// === Affichage ===
function afficherLivres() {
  const conteneur = document.getElementById("liste-livres");
  if (!conteneur) return;
  conteneur.innerHTML = "";

  const livres = getLivres();
  livres.forEach(livre => {
    const ligne = document.createElement("div");
    ligne.textContent = `${livre.titre} — ${livre.auteur} (disponibles : ${livre.quantiteDisponible ?? 0}) l'id du livre ${livre.id}`;
    conteneur.appendChild(ligne);
  });
}

function supprimerLivre(id) {
    // Supprimer un livre par son ID
    if (!id){
        return {succes: false, message:"il faut imperativement rrentre l id du livre que vous voulez supprimer "}
    }
    const idtemp = id.trim();
    const livres = getLivres();
    let existant = livres.find(livre=>livre.id === idtemp);
    if(!existant){
        console.log("le livre n existe pas dans la base");
        return {succes :false, message:"le livre n existe pas dans la base "};
    }
    idtodelete = livres.indexOf(idtemp);
    livres.splice(idtemp,1);
    setLivres(livres);
    return {success : true, message: "element supprimer"}
}


// === Helpers LocalStorage ===
const US_KEY = "utilisateurs";     // plus clair au pluriel
const US_ID  = "prochainIdUtilisateur";

function getUtilisateurs() {
  return JSON.parse(localStorage.getItem(US_KEY)) || [];
}
function setUtilisateurs(utilisateurs) {
  localStorage.setItem(US_KEY, JSON.stringify(utilisateurs));
}
function getNextIdUser() {
  const n = Number(localStorage.getItem(US_ID)) || 1;
  localStorage.setItem(US_ID, String(n + 1));
  return n;
}

// === CRUD Utilisateurs ===
function ajouterUtilisateur(nom, prenom, email) {
  // Validation basique + normalisation
  const N = (nom ?? "").trim();
  const P = (prenom ?? "").trim();
  const E = (email ?? "").trim().toLowerCase();

  if (!N || !P || !E) {
    return { succes: false, message: "Tous les champs sont requis." };
  }

  const utilisateurs = getUtilisateurs();

  // Unicité de l'email (insensible à la casse/espaces)
  const existant = utilisateurs.find(u => (u.email || "").toLowerCase() === E);
  if (existant) {
    return { succes: false, message: "Cet email est déjà utilisé." };
  }

  const nouvelUtilisateur = {
    id: getNextIdUser(),
    nom: N,
    prenom: P,
    email: E,
  };

  utilisateurs.push(nouvelUtilisateur);
  setUtilisateurs(utilisateurs);

  return { succes: true, message: "L'utilisateur a été ajouté à la bibliothèque." };
}

function afficherUtilisateurs() {
  const conteneur = document.getElementById("liste-utilisateurs");
  if (!conteneur) return; // sécurité si l'élément n'existe pas

  conteneur.innerHTML = "";
  const utilisateurs = getUtilisateurs();

  utilisateurs.forEach(utilisateur => {
    const ligne = document.createElement("div");
    ligne.textContent = `${utilisateur.prenom} ${utilisateur.nom} (email: ${utilisateur.email}) (id utilisateur: ${utilisateur.id})`;
    conteneur.appendChild(ligne);
  });
}

function supprimerUtilisateur(id) {
  // id peut arriver en string depuis le DOM
  const ID = Number(id);
  if (!Number.isFinite(ID)) {
    return { succes: false, message: "ID invalide." };
  }

  const utilisateurs = getUtilisateurs();
  const index = utilisateurs.findIndex(u => u.id === ID);

  if (index === -1) {
    return { succes: false, message: "L'utilisateur n'existe pas dans la base." };
  }

  utilisateurs.splice(index, 1);
  setUtilisateurs(utilisateurs);

  return { succes: true, message: "Utilisateur supprimé." };
}

// Emprunts
// Helpers cohérents
const EM_KEY = "emprunts";
const EM_ID  = "prochainIdEmprunt";

function getEmprunts() {
  return JSON.parse(localStorage.getItem(EM_KEY)) || [];
}
function setEmprunts(emprunts) {
  localStorage.setItem(EM_KEY, JSON.stringify(emprunts));
}
function getNextIdEmprunt() {
  const n = Number(localStorage.getItem(EM_ID)) || 1;
  localStorage.setItem(EM_ID, String(n + 1));
  return n;
}

// emprunter
function emprunterLivre(utilisateurId, livreId) {
  const uid = Number(utilisateurId);
  const bid = Number(livreId);
  if (!Number.isFinite(uid) || !Number.isFinite(bid)) {
    return { succes: false, message: "IDs utilisateur et livre requis." };
  }

  // vérifier utilisateur
  const utilisateurs = getUtilisateurs(); // <- doit exister
  const user = utilisateurs.find(u => u.id === uid);
  if (!user) return { succes: false, message: "L'utilisateur n'existe pas dans la base." };

  // vérifier livre
  const livres = getLivres(); // <- doit exister
  const book = livres.find(l => l.id === bid);
  if (!book) return { succes: false, message: "Le livre n'existe pas dans la base." };
  if ((book.quantiteDisponible ?? 0) < 1) {
    return { succes: false, message: "Il ne reste plus d'exemplaire de ce livre." };
  }

  // (optionnel) empêcher doublon d'emprunt actif
  const emprunts = getEmprunts();
  const deja = emprunts.find(e => e.utilisateurId === uid && e.livreId === bid && e.statut === "actif");
  if (deja) return { succes: false, message: "Cet utilisateur a déjà ce livre en emprunt." };

  // décrémenter stock + enregistrer emprunt
  book.quantiteDisponible -= 1;
  setLivres(livres); // <- doit exister

  const nouvelEmprunt = {
    id: getNextIdEmprunt(),
    utilisateurId: uid,
    livreId: bid,
    dateEmprunt: new Date().toISOString(),
    statut: "actif"
  };
  emprunts.push(nouvelEmprunt);
  setEmprunts(emprunts);

  return { succes: true, message: `Le livre "${book.titre}" a été emprunté avec succès.`, emprunt: nouvelEmprunt };
}


function retournerLivre(empruntId) {
  const EID = Number(empruntId);
  if (!Number.isFinite(EID)) {
    return { succes: false, message: "L'id d'emprunt est requis et doit être un nombre." };
  }

  const emprunts = getEmprunts();     // <- lit depuis localStorage
  const livres   = getLivres();       // <- lit depuis localStorage

  // Trouver l'emprunt
  const emprunt = emprunts.find(e => e.id === EID);
  if (!emprunt) {
    return { succes: false, message: "L'emprunt n'existe pas dans la base." };
  }

  if (emprunt.statut === "retourne" || emprunt.statut === "retourné") {
    return { succes: false, message: "Le livre a déjà été retourné." };
  }

  // Marquer comme retourné + date de retour
  emprunt.statut = "retourne";                 // éviter les accents en code
  emprunt.dateRetour = new Date().toISOString();

  // Ré-incrémenter le stock du livre
  const book = livres.find(l => l.id === emprunt.livreId);
  if (book) {
    book.quantiteDisponible = (book.quantiteDisponible ?? 0) + 1;
    setLivres(livres);                         // sauver les livres MAJ
  }

  setEmprunts(emprunts);                       // sauver les emprunts MAJ

  return { succes: true, message: "Le livre a été retourné avec succès." };
}

function afficherEmprunts() {
  const cont = document.getElementById("liste-emprunts");
  if (!cont) return;

  const emprunts     = getEmprunts();
  const utilisateurs = getUtilisateurs();
  const livres       = getLivres();

  cont.innerHTML = "";

  emprunts
    .filter(e => e.statut === "actif")
    .forEach(e => {
      const utilisateur = utilisateurs.find(u => u.id === e.utilisateurId);
      const livre = livres.find(l => l.id === e.livreId);

      const ligne = document.createElement("div");
      const empruntLabel = `emprunts.id "${e.id}"`;
      const userLabel = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}  Utilisateurid #${e.utilisateurId}` : `Utilisateur #${e.utilisateurId}`;
      const livreLabel = livre ? `"${livre.titre}" Livre #${e.livreId}` : `Livre #${e.livreId}`;
      const date = e.dateEmprunt ? new Date(e.dateEmprunt).toLocaleDateString() : "(date inconnue)";

      ligne.textContent = `${userLabel} a emprunté ${livreLabel} le ${date} et l'id de l'emprunt est ${empruntLabel}`;
      cont.appendChild(ligne);
    });
}



// Gestion du formulaire d'ajout de livre
document.getElementById("form-livre").addEventListener("submit", gestionajoutLivre);
function gestionajoutLivre(event) {
if (event)
    { 
        event.preventDefault(); // Empêche le rechargement de la page
    }
  const titre = document.getElementById("titre").value;
  console.log(titre);
  const auteur = document.getElementById("auteur").value;
  console.log(auteur);
  const quantite = document.getElementById("quantite").value;
  console.log(quantite);

const resultat = ajouterLivre(titre, auteur, parseInt(quantite));
console.log(resultat.message);
afficherLivres();
}

// Gestion du formulaire d'ajout d'utilisateur
document.getElementById("utilisateurs").addEventListener("submit",gestionajoutUtilisateur);
function gestionajoutUtilisateur(event) {
 
    if (event)
        { 
            event.preventDefault(); // Empêche le rechargement de la page
        }   
        const nom = document.getElementById("nom").value;
        console.log(nom);
        const prenom = document.getElementById("prenom").value;
        console.log(prenom);
        const email = document.getElementById("email").value;
        console.log(email);
    const resultat = ajouterUtilisateur(nom, prenom, email);
    afficherUtilisateurs();
    console.log(resultat.message);
    }   
// Gestion du formulaire d'emprunt de livre
document.getElementById("form-emprunt").addEventListener("submit",gestionEmpruntLivre)
function gestionEmpruntLivre(event) {
    if (event)
        { 
            event.preventDefault(); // Empêche le rechargement de la page
        }
        const utilisateurId = document.getElementById("id-utilisateur").value;
        console.log(utilisateurId);
        const livreId = document.getElementById("id-livre").value;
        console.log(livreId);
    const resultat = emprunterLivre(parseInt(utilisateurId), parseInt(livreId));
    afficherEmprunts();
    console.log(resultat.message);
    }
// Gestion du formulaire de retour de livre
document.getElementById("form-retour").addEventListener("submit",gestionRetourLivre)
function gestionRetourLivre(event) {
    if (event)  
        { 
            event.preventDefault(); // Empêche le rechargement de la page
        }
        const empruntId = document.getElementById("id-emprunt").value;
        console.log(empruntId);
    const resultat = retournerLivre(parseInt(empruntId));
    console.log(resultat.message);
    afficherEmprunts();
    }
//ajouter d ecouteur sur les boutons pour deplier les formulaire
const btn = document.getElementById("deplilivre");
const formliv = document.getElementById("form-livre");

btn.addEventListener("click",()=> {
    if(formliv.style.display === "none"){
        formliv.style.display = "grid"; 
    }else{
        formliv.style.display = "none";
    }
});