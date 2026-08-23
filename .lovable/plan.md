# Plano de Implementação: Login Único e Seleção de Responsável (Jessica e Anderson)

Este plano descreve as alterações para simplificar o login (uso de um ícone de login/senha) e personalizar a seleção de responsáveis nos compromissos para "Jessica" e "Anderson".

## Ações Técnicas

### 1. Personalização do Formulário de Compromissos
- Alterar o componente `EventDialog.tsx` para substituir o campo de texto livre "Responsável" por um seletor (Select) com as opções pré-definidas: **Jessica** e **Anderson**.
- Atualizar o estado inicial do formulário para refletir essa mudança.

### 2. Interface de Login Simplificada
- Atualizar `src/routes/auth.tsx` para incluir ícones representativos de login e senha na tela de acesso.
- Como o usuário solicitou um "login único", manteremos a estrutura de autenticação atual (que já foi simplificada anteriormente), mas garantindo que a comunicação visual transmita a ideia de acesso compartilhado do casal.

### 3. Ajustes de Segurança e Fluxo
- Manter o redirecionamento automático já implementado que pula o login em ambiente de desenvolvimento se necessário, mas garantindo que a tela de login apresente os novos ícones solicitados.

## Detalhes Técnicos
- O campo `responsible` na tabela `events` continuará sendo uma string, garantindo compatibilidade com o banco de dados existente.
- Utilizaremos componentes do `shadcn/ui` (Select, Input) e ícones da biblioteca `lucide-react` (User, Lock).
- As alterações serão focadas em:
    - `src/components/app/EventDialog.tsx`
    - `src/routes/auth.tsx`

Nenhuma alteração no esquema do banco de dados (SQL) é necessária, pois utilizaremos os campos de string existentes.
