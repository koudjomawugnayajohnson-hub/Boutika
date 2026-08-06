import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { AuditLog } from '../../core/types';

export const Compliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'data'>('audit');

  return (
    <div className="flex flex-col h-full">
      <div className="mb-lg">
        <h1 className="font-display-sm text-display-sm text-primary mb-2">Conformité & Sécurité</h1>
        <div className="flex gap-4 border-b border-outline-variant">
          <button 
            className={`py-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('audit')}
          >
            Journal d'audit
          </button>
          <button 
            className={`py-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('data')}
          >
            Données et Conformité
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'audit' ? <AuditLogTab /> : <DataManagementTab />}
      </div>
    </div>
  );
};

const AuditLogTab: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (currentOrganization) {
      getRepositories().auditLogs.findAllByOrganization(currentOrganization.id)
        .then(setLogs);
    }
  }, [currentOrganization]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Filters Sidebar */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase text-on-surface-variant tracking-wider">Date de début</label>
          <input type="date" className="border border-outline-variant rounded p-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase text-on-surface-variant tracking-wider">Date de fin</label>
          <input type="date" className="border border-outline-variant rounded p-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase text-on-surface-variant tracking-wider">Utilisateur</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
            <input type="text" placeholder="Rechercher" className="w-full border border-outline-variant rounded p-2 pl-8 text-sm text-on-surface focus:outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date / Heure</th>
                <th className="p-4 font-medium">Utilisateur ID</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant text-sm">Aucun journal d'audit trouvé.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors text-sm">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-on-surface">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-on-surface-variant">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-4 text-on-surface">{log.userId}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface font-mono text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DataManagementTab: React.FC = () => {
  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <div>
        <h2 className="font-display-sm text-display-sm text-on-surface mb-2">Gestion de vos données</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un contrôle total sur les informations relatives à votre boutique. Utilisez les outils ci-dessous pour exercer votre droit à la portabilité ou votre droit à l'oubli.
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">download</span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="font-title-md text-title-md font-semibold text-on-surface">Exporter mes données</h3>
            <p className="text-sm text-on-surface-variant">
              Téléchargez une archive complète de vos données de compte, inventaire, historique de ventes et paramètres d'équipe. Le fichier sera disponible au format structuré (CSV ou JSON) pour faciliter la portabilité.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <button className="bg-surface-container-high hover:bg-surface-variant text-on-surface px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 border border-outline-variant">
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                Exporter en CSV
              </button>
              <button className="bg-surface hover:bg-surface-container-low text-on-surface px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 border border-outline-variant">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Exporter en JSON
              </button>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-3 flex items-start gap-3 mt-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">info</span>
          <p className="text-xs text-on-surface-variant">La génération de l'archive peut prendre quelques minutes selon le volume de votre inventaire. Un lien de téléchargement vous sera envoyé par email une fois prêt.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-error-container bg-opacity-20 border border-error rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="font-title-md text-title-md font-semibold text-error">Zone de danger : Suppression du compte</h3>
            <p className="text-sm text-on-surface-variant">
              La suppression de votre compte est définitive. Toutes vos données d'inventaire, de ventes, et informations d'équipe seront définitivement effacées de nos serveurs, conformément à votre droit à l'oubli.
            </p>
            
            <div className="bg-surface border border-error-container rounded p-4 mt-2 flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[18px] shrink-0">close</span>
                Perte irréversible de l'historique des ventes
              </div>
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[18px] shrink-0">close</span>
                Suppression de tout le catalogue d'inventaire
              </div>
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[18px] shrink-0">close</span>
                Révocation des accès pour toute l'équipe
              </div>
            </div>

            <button className="mt-4 bg-error hover:bg-error-container text-on-error hover:text-on-error-container px-4 py-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 self-start">
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Supprimer mon compte définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
