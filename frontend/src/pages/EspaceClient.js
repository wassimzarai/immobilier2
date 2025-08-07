import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAnnonce } from '../api/annonce';
// Remplacement Card/Button par HTML natif car composants non trouvés
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import "./EspaceClient.css";

const API = "http://localhost:5000/api";

export default function EspaceClient() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Toast auto-hide 
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Charger les favoris à l’ouverture
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user) {
      fetch('http://localhost:5000/api/favoris', { headers: { 'x-auth-token': token } })
        .then(r => r.json())
        .then(setFavoris);
    }
  }, [user]);

  // Suppression d'une annonce
  async function handleDeleteAnnonce(annonceId) {
    try {
      await deleteAnnonce(annonceId);
      setAnnonces(annonces => annonces.filter(a => a._id !== annonceId));
      setToast({ visible: true, message: 'Annonce supprimée !', type: 'remove' });
    } catch (e) {
      setToast({ visible: true, message: (e?.response?.data?.msg || 'Erreur lors de la suppression'), type: 'remove' });
    }
  }

  // Toggle favori (ajout ou suppression)
  function handleToggleFavori(annonceId) {
    const token = localStorage.getItem('token');
    const isFavori = favoris.some(a => a._id === annonceId);
    fetch(`http://localhost:5000/api/favoris/${annonceId}`, {
      method: isFavori ? 'DELETE' : 'POST',
      headers: { 'x-auth-token': token }
    })
      .then(r => r.json())
      .then(() => {
        // Recharge les favoris après modification
        fetch('http://localhost:5000/api/favoris', { headers: { 'x-auth-token': token } })
          .then(r => r.json())
          .then(setFavoris);
        setToast({
          visible: true,
          message: isFavori ? 'Retiré des favoris !' : 'Ajouté aux favoris !',
          type: isFavori ? 'remove' : 'add'
        });
      });
  }

  const [annonces, setAnnonces] = useState([]);
  const [tab, setTab] = useState("performance");
  // Etats pour gestion des filtres et tab annonces
  const [annonceTab, setAnnonceTab] = useState("mes");
  const [searchVille, setSearchVille] = useState("");
  const [searchStatut, setSearchStatut] = useState("");
  const [searchType, setSearchType] = useState("");
  const [annoncesFiltrees, setAnnoncesFiltrees] = useState([]);

  // États pour formulaire profil avancé
  const [profileTab, setProfileTab] = useState("infos");
  const [photoPreview, setPhotoPreview] = useState("");
  const [profileNom, setProfileNom] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Pré-remplir infos profil à l'ouverture
  useEffect(() => {
    if (user) {
      setProfileNom(user.nom || "");
      setProfileEmail(user.email || "");
      setPhotoPreview(user.photoUrl || "");
    }
  }, [user]);

  // Handler photo
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Preview local immédiat
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    // Envoi backend
    const form = new FormData();
    form.append('photo', file);
    fetch(`${API}/utilisateur/photo`, {
      method: 'POST',
      headers: { 'x-auth-token': localStorage.getItem('token') },
      body: form
    })
      .then(r => r.json())
      .then(data => {
        if (data.photo) setUser(u => ({ ...u, photo: data.photo }));
      });
  }

  // Handler sauvegarde infos
  function handleProfileSave(e) {
    e.preventDefault();
    fetch(`${API}/utilisateur/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": localStorage.getItem("token") },
      body: JSON.stringify({ nom: profileNom, email: profileEmail })
    })
      .then(r => r.json())
      .then(data => alert("Profil mis à jour !"));
  }

  // Handler sauvegarde mot de passe
  function handlePasswordSave(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Les mots de passe ne correspondent pas");
    fetch(`${API}/utilisateur/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": localStorage.getItem("token") },
      body: JSON.stringify({ motDePasseActuel: currentPassword, nouveauMotDePasse: newPassword })
    })
      .then(r => r.json())
      .then(data => {
        if (data.msg && data.msg.toLowerCase().includes('incorrect')) alert(data.msg);
        else alert("Mot de passe mis à jour !");
      });
  }

  // Filtrage dynamique des annonces
  useEffect(() => {
    let filtered = annonces.filter(a => {
      if (annonceTab === 'archives' && !a.archivee) return false;
      if (annonceTab === 'mes' && a.archivee) return false;
      if (searchVille && !(a.emplacement?.ville?.toLowerCase().includes(searchVille.toLowerCase()) || a.emplacement?.quartier?.toLowerCase().includes(searchVille.toLowerCase()))) return false;
      if (searchStatut && a.statut !== searchStatut) return false;
      if (searchType && a.categorie !== searchType) return false;
      return true;
    });
    setAnnoncesFiltrees(filtered);
  }, [annonces, annonceTab, searchVille, searchStatut, searchType]);

  // Handler bouton recherche (optionnel, ici il ne fait que relancer le useEffect)
  function handleRechercheAnnonces(e) {
    e && e.preventDefault();
    // Le filtrage se fait déjà automatiquement
  }

  // Charger l'utilisateur une seule fois
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/utilisateur/me`, { headers: { "x-auth-token": token } })
      .then(r => r.json())
      .then(setUser);
  }, []);

  // Charger les annonces dès que user est dispo
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch(`${API}/annonces?userId=${user._id}`, { headers: { "x-auth-token": token } })
      .then(r => r.json())
      .then(setAnnonces);
  }, [user]);

  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <>
      {/* Toast favoris */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          background: toast.type === 'add' ? '#43a047' : '#ff9100',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 24,
          fontWeight: 600,
          fontSize: '1.15em',
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{fontSize:'1.5em'}}>{toast.type === 'add' ? '❤️' : '🤍'}</span>
          {toast.message}
        </div>
      )}

    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="espace-client-header">
        <div className="container mx-auto flex justify-between items-center">
          <div className="user-info">
            <div className="user-avatar">
             {user.photo ? (
               <img src={'http://localhost:5000/' + user.photo} alt="avatar" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',border:'2px solid #ff9100'}} />
             ) : (
               <User className="w-8 h-8" />
             )}
           </div>
            <div>
              <div className="font-semibold">{user.nom}</div>
              <div style={{ fontSize: '0.95em', color: '#e0e7ef' }}>{user.email}</div>
            </div>
          </div>
          <div className="espace-client-tabs">
            <button className={tab==="performance"?"active":""} onClick={()=>setTab("performance")}>Rapport de performance</button>
            <button className={tab==="annonces"?"active":""} onClick={()=>setTab("annonces")}>Mes annonces</button>
            <button className={tab==="compte"?"active":""} onClick={()=>setTab("compte")}>Mon compte</button>
            <button className={tab==="messages"?"active":""} onClick={()=>setTab("messages")}>Mes Messages</button>
            <button className={tab==="favoris"?"active":""} onClick={()=>setTab("favoris")}>Mes Favoris</button>
            <button className={tab==="notifications"?"active":""} onClick={()=>setTab("notifications")}>Notification</button>
            <button className={tab==="alertes"?"active":""} onClick={()=>setTab("alertes")}>Alertes</button>
            <button className="ml-4 border px-3 py-2" onClick={() => {localStorage.removeItem("token"); window.location.href = "/login"}}><LogOut className="w-4 h-4 mr-2" />Déconnexion</button>
          </div>
        </div>
      </header>

      {/* Onglets */}
      <main className="max-w-6xl mx-auto py-10">
        {tab === "performance" && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-8 text-center" style={{color:'#174ea6'}}>Rapport de performance</h2>
            <div className="rapport-performance-grid">
              <div className="rapport-performance-card">
                <div className="value">0</div>
                <div className="label">Annonces imprimées</div>
              </div>
              <div className="rapport-performance-card">
                <div className="value">0</div>
                <div className="label">Annonces vues</div>
              </div>
              <div className="rapport-performance-card">
                <div className="value">0%</div>
                <div className="label">Taux de conversion</div>
              </div>
              <div className="rapport-performance-card">
                <div className="value">0</div>
                <div className="label">Contacts par email</div>
              </div>
              <div className="rapport-performance-card">
                <div className="value">0</div>
                <div className="label">Téléphone</div>
              </div>
              <div className="rapport-performance-card">
                <div className="value">0</div>
                <div className="label">WhatsApp</div>
              </div>
            </div>
            {/* Tableau notifications */}
            <div className="card p-6 mb-8" style={{borderRadius:'10px'}}>
              <div style={{fontWeight:600,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
                <span style={{color:'#1565d8',fontSize:18}}>&#128276;</span>
                Historique des notifications (push et e-mail) envoyées pour votre annonce
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:0}}>
                  <thead>
                    <tr style={{background:'#00b4d8',color:'#fff'}}>
                      <th style={{padding:'8px'}}>Date</th>
                      <th>Annonce</th>
                      <th>Emplacement</th>
                      <th>Envoyé</th>
                      <th>Ouvert</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" style={{textAlign:'center',padding:'16px',color:'#888'}}>Aucune donnée trouvée avec des critères donnés</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{fontSize:'0.85em',color:'#888',textAlign:'center',marginTop:6}}>0 - 0 de 0 résultats | 1 - 1 pages</div>
              </div>
            </div>
            {/* Tableau contacts email */}
            <div className="card p-6 mb-8" style={{borderRadius:'10px'}}>
              <div style={{fontWeight:600,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
                <span style={{color:'#1565d8',fontSize:18}}>&#128231;</span>
                Contacts par e-mail
                <span style={{marginLeft:'auto',fontSize:18,cursor:'pointer',color:'#bdbdbd'}} title="Statistiques">&#128202;</span>
                <span style={{fontSize:18,cursor:'pointer',color:'#bdbdbd'}} title="Exporter">&#128190;</span>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:0}}>
                  <thead>
                    <tr style={{background:'#00b4d8',color:'#fff'}}>
                      <th style={{padding:'8px'}}>#</th>
                      <th>Date</th>
                      <th>Nom</th>
                      <th>Adresse mail</th>
                      <th>Pays</th>
                      <th>Téléphone</th>
                      <th>Référence</th>
                      <th>Annonce</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="8" style={{textAlign:'center',padding:'16px',color:'#888'}}>Aucune donnée trouvée avec des critères donnés</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{fontSize:'0.85em',color:'#888',textAlign:'center',marginTop:6}}>0 - 0 de 0 résultats | 1 - 1 pages</div>
              </div>
            </div>
          </div>
        )}
        {tab === "annonces" && (
          <div className="card p-6" style={{background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <h2 className="text-2xl font-bold text-center mb-6" style={{color:'#174ea6'}}>Gestion annonce</h2>
            {/* Tabs annonces/archivées */}
            <div style={{display:'flex',gap:12,marginBottom:24}}>
              <button className={annonceTab==="mes"?"active-annonce-tab":""} style={{flex:1,padding:'10px 0',borderRadius:8,border:'none',background:annonceTab==="mes"?'#e6f4ff':'#f6f7fa',fontWeight:600,color:annonceTab==="mes"?'#1565d8':'#888'}} onClick={()=>setAnnonceTab('mes')}>&#128274; Mes annonces</button>
              <button className={annonceTab==="archives"?"active-annonce-tab":""} style={{flex:1,padding:'10px 0',borderRadius:8,border:'none',background:annonceTab==="archives"?'#e6f4ff':'#f6f7fa',fontWeight:600,color:annonceTab==="archives"?'#1565d8':'#888'}} onClick={()=>setAnnonceTab('archives')}>Archivées</button>
            </div>
            {/* Barre de recherche et filtres */}
            <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:20,flexWrap:'wrap'}}>
              <input type="text" placeholder="Ville, quartier, adresse..." value={searchVille} onChange={e=>setSearchVille(e.target.value)} style={{flex:2,padding:'10px',borderRadius:6,border:'1.5px solid #e0e7ef',fontSize:16}} />
              <select value={searchStatut} onChange={e=>setSearchStatut(e.target.value)} style={{flex:1,padding:'10px',borderRadius:6,border:'1.5px solid #e0e7ef',fontSize:16}}>
                <option value="">Tous les statuts</option>
                <option value="Active">Active</option>
                <option value="En attente">En attente</option>
                <option value="Vendue">Vendue</option>
                <option value="Louée">Louée</option>
                <option value="Suspendue">Suspendue</option>
              </select>
              <select value={searchType} onChange={e=>setSearchType(e.target.value)} style={{flex:1,padding:'10px',borderRadius:6,border:'1.5px solid #e0e7ef',fontSize:16}}>
                <option value="">Tous les types</option>
                <option value="Vente">Vente</option>
                <option value="Location">Location</option>
              </select>
              <button onClick={handleRechercheAnnonces} style={{background:'#ffd600',color:'#222',fontWeight:600,padding:'10px 26px',border:'none',borderRadius:6,fontSize:16}}>Rechercher</button>
            </div>
            {/* Liste annonces filtrées */}
            {annoncesFiltrees.length === 0 ? (
              <div style={{textAlign:'center',color:'#888',margin:'40px 0'}}>Aucune annonce trouvée.</div>
            ) : (
              annoncesFiltrees.map(annonce => (
                <div key={annonce._id} style={{display:'flex',background:'#fafbfc',borderRadius:10,boxShadow:'0 1px 4px rgba(21,101,216,0.05)',marginBottom:24,overflow:'hidden',border:'1.5px solid #e0e7ef'}}>
                  <div style={{minWidth:140,minHeight:110,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <img src={annonce.photos?.[0] || "/default.jpg"} alt={annonce.typeBien || "annonce"} style={{width:110,height:90,objectFit:'cover',borderRadius:8}} />
                  </div>
                  <div style={{flex:1,padding:'16px 20px',display:'flex',flexDirection:'column',gap:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontWeight:600,fontSize:18}}>{annonce.typeBien === 'Appartements' ? 'Appartement' : annonce.typeBien} {annonce.categorie === 'Vente' ? 'à vendre' : 'à louer'}</span>
                      {annonce.statut && <span style={{marginLeft:8,padding:'2px 12px',background:annonce.statut==='Active'?'#e7f9ef':annonce.statut==='Vendue'?'#e3f0ff':'#f9e7e7',color:annonce.statut==='Active'?'#0c8b4e':annonce.statut==='Vendue'?'#1565d8':'#d32f2f',borderRadius:8,fontWeight:600,fontSize:13}}>{annonce.statut}</span>}
                    </div>
                    <div style={{color:'#666',fontSize:14,marginBottom:2}}>
                      {annonce.chambres || '-'} chambres &nbsp;·&nbsp; {annonce.surfaceConstruite || '-'} m²
                    </div>
                    <div style={{color:'#1565d8',fontWeight:600,fontSize:16,marginBottom:2}}>
                      {annonce.prix ? (annonce.categorie === 'Vente' ? `${annonce.prix} DT` : `${annonce.prix} DT/mois`) : 'Prix à consulter'}
                    </div>
                    <div style={{color:'#888',fontSize:14,marginBottom:2}}>
                      <span>&#128205; {annonce.emplacement?.ville || ''}{annonce.emplacement?.ville && annonce.emplacement?.quartier ? ', ' : ''}{annonce.emplacement?.quartier || ''}</span>
                    </div>
                    <div style={{display:'flex',gap:18,alignItems:'center',fontSize:13,marginTop:6}}>
                      <span>&#128065; {annonce.vues || 0} vues</span>
                      <span>&#128101; {annonce.contacts || 0} contacts</span>
                      <span>&#128197; {annonce.createdAt ? new Date(annonce.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,justifyContent:'center',alignItems:'flex-end',padding:'18px 18px 0 0'}}>
                    <button onClick={() => handleToggleFavori(annonce._id)}
                      style={{background:'none',border:'none',fontSize:'1.7em',cursor:'pointer',color: favoris.some(a => a._id === annonce._id) ? '#ff1744' : '#bbb',transition:'color 0.18s',marginBottom:8}}
                      title={favoris.some(a => a._id === annonce._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      onMouseOver={e => e.currentTarget.style.color = '#ff9100'}
                      onMouseOut={e => e.currentTarget.style.color = favoris.some(a => a._id === annonce._id) ? '#ff1744' : '#bbb'}>
                      {favoris.some(a => a._id === annonce._id) ? '❤️' : '🤍'}
                    </button>
                    <div style={{display:'flex',gap:8}}>
                      <button style={{background:'#fff',border:'1.5px solid #e0e7ef',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}} onClick={() => navigate(`/annonces/${annonce._id}`)}>&#128065; Voir</button>
                      <button style={{background:'#fff',border:'1.5px solid #e0e7ef',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}} onClick={() => navigate(`/annonces/ajouter/${annonce._id}`)}>&#9998; Modifier</button>
                    </div>
                    <button style={{background:'#fff',border:'1.5px solid #ffd6d6',color:'#d32f2f',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
  onClick={() => {
    if(window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) {
      handleDeleteAnnonce(annonce._id);
    }
  }}
>
  &#128465; Supprimer
</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "compte" && (
          <div className="profile-settings-advanced">
            <div className="profile-settings-card">
              <h2 className="profile-settings-title">Modifier les données d'accès</h2>
              <div className="profile-settings-tabs">
                <button className={profileTab==="infos"?"active":""} onClick={()=>setProfileTab("infos")}>Informations Personnelles</button>
                <button className={profileTab==="securite"?"active":""} onClick={()=>setProfileTab("securite")}>Sécurité</button>
              </div>
              {profileTab === "infos" && (
                <form className="profile-settings-form" onSubmit={handleProfileSave} style={{maxWidth:'420px',margin:'36px auto 0 auto',background:'#fff',borderRadius:'16px',boxShadow:'0 4px 24px rgba(21,101,216,0.08)',padding:'28px 16px 20px 16px',display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{width:'100%',textAlign:'center',color:'#888',fontWeight:500,marginBottom:'10px',fontSize:'1em'}}>Ajoutez votre photo de profil</div>
                  <div className="profile-photo-upload" style={{margin:'0 auto 18px auto'}}>
                    <label htmlFor="profile-photo-upload" className="profile-photo-label">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profil" className="profile-photo-img" style={{width:'110px',height:'110px',borderRadius:'16px',objectFit:'cover',border:'2px solid #e0e7ef'}} />
                      ) : (
                        <span className="profile-photo-placeholder" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'120px',height:'120px',border:'2.5px dashed #1754e8',borderRadius:'16px',color:'#1754e8',fontSize:'2.2em',background:'#fafbfc',margin:'0 auto'}}>
                          +
                          <span className="profile-photo-ajouter" style={{fontSize:'1em',fontWeight:400,marginTop:'2px'}}>Ajouter</span>
                        </span>
                      )}
                      <input id="profile-photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div className="profile-field" style={{width:'100%',marginBottom:'14px'}}>
                    <label htmlFor="name" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Nom</label>
                    <input id="name" type="text" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={profileNom} onChange={e=>setProfileNom(e.target.value)} />
                  </div>
                  <div className="profile-field" style={{width:'100%',marginBottom:'14px'}}>
                    <label htmlFor="email" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Email de contact</label>
                    <input id="email" type="email" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} />
                  </div>
                  <button type="submit" className="profile-settings-btn-save" style={{width:'100%',background:'#ff8c42',color:'#fff',fontWeight:600,borderRadius:'8px',padding:'12px 0',fontSize:'1.08em',border:'none',marginTop:'10px',boxShadow:'0 2px 8px rgba(255,140,66,0.08)'}}>SAUVEGARDER</button>
                </form>
              )}
              {profileTab === "securite" && (
                <div className="profile-settings-form" style={{maxWidth:'420px',margin:'36px auto 0 auto',background:'#fff',borderRadius:'16px',boxShadow:'0 4px 24px rgba(21,101,216,0.08)',padding:'28px 16px 20px 16px',display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div className="security-lock" aria-label="cadenas" style={{fontSize:'32px',color:'#bbb',textAlign:'center',marginBottom:'6px'}}>&#128274;</div>
                  <div className="security-title" style={{textAlign:'center',fontWeight:600,fontSize:'1.2rem',color:'#222',marginBottom:'20px'}}>Modifier les données d'accès</div>
                  <form onSubmit={handlePasswordSave}>
                    <div className="profile-field">
                      <label htmlFor="security-email" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Email *</label>
                      <input id="security-email" type="email" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={profileEmail} disabled />
                    </div>
                    <div className="profile-field">
                      <label htmlFor="current-password" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Mot de passe actuel *</label>
                      <input id="current-password" type="password" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Mot de passe actuel" required />
                    </div>
                    <div className="profile-field">
                      <label htmlFor="new-password" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Nouveau mot de passe *</label>
                      <input id="new-password" type="password" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" required />
                    </div>
                    <div className="profile-field">
                      <label htmlFor="confirm-password" style={{color:'#888',fontSize:'0.98em',fontWeight:400,marginBottom:'4px',display:'block'}}>Confirmez votre nouveau mot de passe *</label>
                      <input id="confirm-password" type="password" className="profile-settings-input" style={{width:'100%',background:'#fafbfc',border:'1.5px solid #e0e7ef',borderRadius:'8px',padding:'10px 12px',fontSize:'1em',color:'#222',marginBottom:'2px'}} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirmez votre nouveau mot de passe" required />
                    </div>
                    <button className="profile-settings-btn-save" style={{width:'100%',background:'#ff8c42',color:'#fff',fontWeight:600,borderRadius:'8px',padding:'12px 0',fontSize:'1.08em',border:'none',marginTop:'10px',boxShadow:'0 2px 8px rgba(255,140,66,0.08)'}}>SAUVEGARDER</button>
                  </form>
                </div>
              )}
              <button type="button" className="profile-settings-btn-securite" onClick={()=>setProfileTab("infos")}>Retour</button>
            </div>
          </div>
        )}
        {tab === "favoris" && (
          <div className="card p-6" style={{background:'#fff',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <h2 className="text-2xl font-bold text-center mb-6" style={{color:'#174ea6'}}>Mes Favoris</h2>
            {favoris.length === 0 ? (
              <div style={{textAlign:'center',margin:'60px 0'}}>
                <div style={{fontSize:'4em',color:'#bdbdbd',marginBottom:'16px'}}>&#128148;</div>
                <div style={{color:'#ff1744',fontWeight:500,fontSize:'1.1em'}}>Vous n'avez sélectionné aucun favoris</div>
              </div>
            ) : (
              favoris.map(annonce => (
                <div key={annonce._id} style={{display:'flex',background:'#fafbfc',borderRadius:10,boxShadow:'0 1px 4px rgba(21,101,216,0.05)',marginBottom:24,overflow:'hidden',border:'1.5px solid #e0e7ef'}}>
                  <div style={{minWidth:140,minHeight:110,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <img src={annonce.photos?.[0] || "/default.jpg"} alt={annonce.typeBien || "annonce"} style={{width:110,height:90,objectFit:'cover',borderRadius:8}} />
                  </div>
                  <div style={{flex:1,padding:'16px 20px',display:'flex',flexDirection:'column',gap:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontWeight:600,fontSize:18}}>{annonce.typeBien === 'Appartements' ? 'Appartement' : annonce.typeBien} {annonce.categorie === 'Vente' ? 'à vendre' : 'à louer'}</span>
                      {annonce.statut && <span style={{marginLeft:8,padding:'2px 12px',background:annonce.statut==='Active'?'#e7f9ef':annonce.statut==='Vendue'?'#e3f0ff':'#f9e7e7',color:annonce.statut==='Active'?'#0c8b4e':annonce.statut==='Vendue'?'#1565d8':'#d32f2f',borderRadius:8,fontWeight:600,fontSize:13}}>{annonce.statut}</span>}
                    </div>
                    <div style={{color:'#666',fontSize:14,marginBottom:2}}>
                      {annonce.chambres || '-'} chambres &nbsp;·&nbsp; {annonce.surfaceConstruite || '-'} m²
                    </div>
                    <div style={{color:'#1565d8',fontWeight:600,fontSize:16,marginBottom:2}}>
                      {annonce.prix ? (annonce.categorie === 'Vente' ? `${annonce.prix} DT` : `${annonce.prix} DT/mois`) : 'Prix à consulter'}
                    </div>
                    <div style={{color:'#888',fontSize:14,marginBottom:2}}>
                      <span>&#128205; {annonce.emplacement?.ville || ''}{annonce.emplacement?.ville && annonce.emplacement?.quartier ? ', ' : ''}{annonce.emplacement?.quartier || ''}</span>
                    </div>
                    <div style={{display:'flex',gap:18,alignItems:'center',fontSize:13,marginTop:6}}>
                      <span>&#128065; {annonce.vues || 0} vues</span>
                      <span>&#128101; {annonce.contacts || 0} contacts</span>
                      <span>&#128197; {annonce.createdAt ? new Date(annonce.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,justifyContent:'center',alignItems:'flex-end',padding:'18px 18px 0 0'}}>
                    <button onClick={() => handleToggleFavori(annonce._id)}
                      style={{background:'none',border:'none',fontSize:'1.7em',cursor:'pointer',color: '#ff1744',transition:'color 0.18s',marginBottom:8}}
                      title={'Retirer des favoris'}
                      onMouseOver={e => e.currentTarget.style.color = '#ff9100'}
                      onMouseOut={e => e.currentTarget.style.color = '#ff1744'}>
                      {'❤️'}
                    </button>
                    {/* Boutons CRUD */}
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button onClick={() => navigate(`/annonces/${annonce._id}`)} style={{border:'1px solid #1565d8',background:'#fff',color:'#1565d8',padding:'6px 14px',borderRadius:7,fontWeight:500,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',gap:5}}>
                        <span role="img" aria-label="voir">👁️</span> Voir
                      </button>
                      <button onClick={() => navigate(`/publier-annonce/${annonce._id}`)} style={{border:'1px solid #ff9100',background:'#fff',color:'#ff9100',padding:'6px 14px',borderRadius:7,fontWeight:500,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',gap:5}}>
                        <span role="img" aria-label="modifier">✏️</span> Modifier
                      </button>
                      <button onClick={async () => { if(window.confirm('Confirmer la suppression ?')) { await handleDeleteAnnonce(annonce._id); }}} style={{border:'1.5px solid #ff1744',background:'#fff',color:'#ff1744',padding:'6px 14px',borderRadius:7,fontWeight:500,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',gap:5}}>
                        <span role="img" aria-label="supprimer">🗑️</span> Supprimer
                      </button>
                    </div>
                    {/* Statut coloré à droite */}
                    {annonce.statut && (
                      <div style={{marginTop:12,padding:'4px 18px',background:annonce.statut==='Active'?'#e7f9ef':annonce.statut==='Vendue'?'#e3f0ff':annonce.statut==='Louée'?'#eafbe3':annonce.statut==='En attente'?'#fffbe7':'#f9e7e7',color:annonce.statut==='Active'?'#0c8b4e':annonce.statut==='Vendue'?'#1565d8':annonce.statut==='Louée'?'#6dbf4b':annonce.statut==='En attente'?'#bfa20c':'#d32f2f',borderRadius:8,fontWeight:700,fontSize:15,boxShadow:'0 1px 4px rgba(21,101,216,0.05)'}}>{annonce.statut}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
    </>
  );
}
