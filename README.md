# AGENDA

Crie uma aplicação web completa de Agenda Empresarial e Pessoal, com visual moderno, profissional, intuitivo e responsivo para computador, tablet e celular.

OBJETIVO

A aplicação deve permitir que o usuário organize, em um único sistema, seus compromissos profissionais e pessoais, podendo visualizar separadamente cada agenda ou visualizar tudo em uma agenda unificada.

ESTRUTURA PRINCIPAL

Crie um menu lateral com:

Dashboard

Agenda

Compromissos

Tarefas

Clientes

Contatos

Agenda Empresarial

Agenda Pessoal

Notificações

Configurações

DASHBOARD

Criar uma página inicial mostrando:

Compromissos de hoje

Próximos compromissos

Tarefas pendentes

Tarefas atrasadas

Resumo da agenda empresarial

Resumo da agenda pessoal

Quantidade de compromissos da semana

Botão "Novo compromisso"

Botão "Nova tarefa"

Utilizar cards modernos e gráficos simples quando forem úteis.

AGENDA

Criar um calendário completo com visualização:

Dia

Semana

Mês

Lista

Permitir navegar entre datas e voltar rapidamente para "Hoje".

Cada evento deve aparecer no calendário com uma cor de acordo com sua categoria:

Azul = Empresa

Verde = Pessoal

Amarelo = Reunião

Vermelho = Urgente

Roxo = Tarefa

Permitir criar um compromisso clicando diretamente em um horário do calendário.

NOVO COMPROMISSO

Criar formulário com:

Título

Descrição

Tipo: Empresa ou Pessoal

Categoria

Data

Hora inicial

Hora final

Local

Cliente/contato

Responsável

Prioridade

Status

Observações

Opção de compromisso recorrente

Opção de lembrete

Permitir editar e excluir compromissos.

COMPROMISSOS RECORRENTES

Permitir repetição:

Não repetir

Todos os dias

Toda semana

Todo mês

Todo ano

Personalizado

Permitir definir data final da recorrência.

TAREFAS

Criar sistema de tarefas com:

Título

Descrição

Empresa ou Pessoal

Prazo

Prioridade

Responsável

Status

Status:

A fazer

Em andamento

Concluída

Atrasada

Criar filtros por data, prioridade, categoria e status.

AGENDA EMPRESARIAL

Criar uma área específica para compromissos profissionais.

Permitir cadastrar:

Reuniões

Compromissos com clientes

Visitas

Eventos

Ligações

Prazos

Tarefas profissionais

Criar filtros por cliente, responsável, categoria e período.

AGENDA PESSOAL

Criar uma área separada para compromissos pessoais.

Permitir cadastrar:

Consultas

Compromissos pessoais

Eventos

Aniversários

Viagens

Tarefas pessoais

Lembretes

Os eventos pessoais devem ficar separados dos eventos empresariais, mas o usuário deve poder ativar uma opção para visualizar os dois juntos.

CLIENTES E CONTATOS

Criar cadastro de clientes e contatos com:

Nome

Empresa

Telefone

E-mail

Observações

Ao criar um compromisso empresarial, permitir selecionar um cliente ou contato já cadastrado.

Ao abrir um cliente, mostrar seus próximos e antigos compromissos.

NOTIFICAÇÕES E LEMBRETES

Criar sistema de lembretes.

Permitir configurar lembretes para:

5 minutos antes

15 minutos antes

30 minutos antes

1 hora antes

1 dia antes

Exibir notificações dentro da aplicação.

USUÁRIOS E PERMISSÕES

Preparar o sistema para múltiplos usuários.

Criar perfis:

Administrador

Funcionário

Usuário pessoal

O administrador deve poder visualizar e gerenciar os compromissos empresariais da equipe.

Os compromissos pessoais devem ser privados por padrão.

BANCO DE DADOS

Criar uma estrutura de banco de dados adequada para armazenar:

Usuários

Compromissos

Tarefas

Clientes

Contatos

Categorias

Notificações

Recorrências

Configurações

Utilizar relacionamentos adequados entre as tabelas e garantir que cada usuário tenha seus próprios dados.

PESQUISA E FILTROS

Adicionar pesquisa global para encontrar:

Compromissos

Tarefas

Clientes

Contatos

Adicionar filtros por:

Empresa/Pessoal

Data

Categoria

Status

Prioridade

Responsável

DESIGN

Criar uma interface premium, limpa e profissional.

Usar:

Fundo claro

Cards com cantos arredondados

Sombras discretas

Tipografia moderna

Ícones intuitivos

Espaçamento consistente

Cores diferentes para eventos empresariais e pessoais

A interface deve funcionar muito bem em celulares.

EXPERIÊNCIA DO USUÁRIO

Criar botões de ação rápida:

"+ Novo compromisso"
"+ Nova tarefa"
"+ Novo cliente"

Ao criar ou editar um compromisso, usar uma janela modal moderna, sem obrigar o usuário a sair da página da agenda.

Permitir arrastar e soltar compromissos no calendário para alterar data e horário.

Permitir redimensionar um compromisso para alterar sua duração.

Exibir confirmação antes de excluir qualquer informação.

SEGURANÇA

Implementar autenticação de usuários.

Cada usuário deve ter acesso somente aos dados permitidos pelas suas permissões.

Os dados pessoais devem permanecer privados.

CONFIGURAÇÕES

Criar página de configurações para:

Nome do usuário

Foto

Empresa

Horário de trabalho

Fuso horário

Primeiro dia da semana

Preferências de notificações

Cores da agenda

Preferência entre visualização clara e escura

IMPORTANTE

Não criar apenas uma interface visual estática.

Criar a aplicação funcional, com banco de dados, autenticação, CRUD completo para compromissos, tarefas, clientes e contatos, filtros, calendário e persistência dos dados.

Organizar o código de forma modular e escalável para que novas funcionalidades possam ser adicionadas posteriormente.

Antes de finalizar, testar os principais fluxos:

Criar usuário.

Criar compromisso empresarial.

Criar compromisso pessoal.

Editar compromisso.

Excluir compromisso.

Criar tarefa.

Concluir tarefa.

Criar cliente.

Associar cliente a um compromisso.

Visualizar agenda diária, semanal e mensal.

Filtrar eventos empresariais e pessoais.

Verificar permissões entre usuários.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://agenda123.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cfc25527-c559-4df8-8b87-ac0b0442eadc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
