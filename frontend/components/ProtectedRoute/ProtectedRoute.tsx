'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const REGRAS_DE_ACESSO: Record<string, string[]> = {
  '/dashboardProfissional': ['profissional', 'gestor'],
  '/dashboardFinanceiro': ['financeiro', 'gestor'],
  '/cadastro_usuario': ['gestor'],
  '/cadastro_clientes' : ['gestor'],
  '/projetos': ['gestor'],
  '/registro-projeto': ['gestor'],
  '/gestao-tarefas-gestor': ['gestor'],
  '/aprovacao-horas': ['gestor'],
  '/visualizacaoTime': ['gestor'],
  '/historico_bloqueio': ['gestor'],
  '/dashboard-gestor': ['gestor'],
  '/painel-auditoria': ['financeiro', 'gestor'],
  '/painel-financeiro': ['financeiro', 'gestor'],
  '/controleHoras': ['profissional', 'gestor'],
  '/bloqueioTarefas': ['profissional', 'gestor'],
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [rotaFallback, setRotaFallback] = useState('/');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cargoStorage = localStorage.getItem('cargo');
    
    if (pathname === '/login') {
      setIsAuthorized(true);
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    if (cargoStorage) {
      const cargoUsuario = cargoStorage.toLowerCase().replace('role_', '');
      
      const rotaProtegida = Object.keys(REGRAS_DE_ACESSO).find(rota => 
        pathname.startsWith(rota)
      );

      if (rotaProtegida) {
        const cargosPermitidos = REGRAS_DE_ACESSO[rotaProtegida];
        
        if (!cargosPermitidos.includes(cargoUsuario)) {
          
          if (cargoUsuario === 'gestor') setRotaFallback('/gestao-tarefas-gestor');
          else if (cargoUsuario === 'profissional') setRotaFallback('/controleHoras/entrada-saida');
          else if (cargoUsuario === 'financeiro') setRotaFallback('/dashboardFinanceiro');
          
          setAcessoNegado(true);
          return;
        }
      }
    }
    
    setIsAuthorized(true);

  }, [pathname, router]);

  if (!isAuthorized && !acessoNegado && pathname !== '/login') {
    return null; 
  }

  if (acessoNegado) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#1e293b', padding: '40px', borderRadius: '8px',
          textAlign: 'center', color: '#f1f5f9', maxWidth: '450px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #334155'
        }}>
          <img 
            src="/images/cadeadoBranco.svg" 
            alt="Cadeado" 
            style={{ width: '50px', marginBottom: '20px', opacity: 0.8 }} 
          />
          <h2 style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>
            Acesso Restrito
          </h2>
          <p style={{ marginBottom: '30px', color: '#cbd5e1', fontSize: '16px', lineHeight: '1.5', fontFamily: "'Roboto', sans-serif" }}>
            Você não possui as permissões necessárias para visualizar o conteúdo desta página.
          </p>
          <button 
            onClick={() => {
              setAcessoNegado(false);
              router.push(rotaFallback);
            }} 
            style={{
              backgroundColor: '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              transition: 'background-color 0.2s',
              fontFamily: "'Roboto', sans-serif"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Voltar para a área segura
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}