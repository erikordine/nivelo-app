# Nivelo - Monitor de Glicemia (React Native)

Este é um aplicativo móvel completo, construído com React Native e Expo, projetado para ajudar usuários a monitorar seus níveis de glicemia. Ele utiliza o Firebase (Auth, Firestore e Realtime Database) para autenticação e armazenamento de dados em tempo real.

## 🎯 Para que serve o App?

O objetivo principal do Nivelo é fornecer uma ferramenta simples e eficaz para que pessoas com diabetes ou que precisam monitorar a glicose possam:

- Registrar medições de glicemia rapidamente.
- Contextualizar cada registro (jejum, pré/pós-refeição, etc.).
- Adicionar notas, dados de carboidratos e insulina.
- Visualizar um histórico completo de medições.
- Editar ou excluir registros incorretos.
- Definir metas pessoais de glicemia.

## 🚀 Como Iniciar o Aplicativo

Este projeto foi desenvolvido com Expo. Para executá-lo em seu ambiente de desenvolvimento, siga os passos abaixo:

### 1. Clone o Repositório:

```bash
git clone [URL-DO-SEU-REPOSITORIO]
cd [NOME-DA-PASTA-DO-PROJETO]

### 4. Inicie o Servidor de Desenvolvimento:
npm start
# ou
npx expo start
```

# ✨ Funcionalidades Implementadas

O aplicativo conta com um fluxo completo de autenticação e gerenciamento de dados:

# 1.  **Autenticação de Usuário**
    * **Login** (`LoginScreen.js`): Permite que usuários existentes acessem suas contas usando e-mail e senha.
    * **Registro** (`RegisterScreen.js`): Permite que novos usuários criem uma conta.
    * **Redefinição de Senha**: Na tela de Login, o usuário pode solicitar a redefinição de senha (via envio de e-mail do Firebase Auth).

2.  **Dashboard (Tela Inicial - `home.js`)**
    * **Visualização Rápida**: Exibe o último registro de glicemia em destaque.
    * **Atalhos**: Botões de navegação rápida para as principais funções (Novo Registro, Histórico, Metas).
    * **Registros Recentes**: Lista os últimos 5 registros para fácil visualização.
    * **Atualização Automática**: A tela usa `useFocusEffect` para recarregar os dados sempre que o usuário retorna a ela.

3.  **Gerenciamento de Registros (Logs)**
    * **Novo Registro** (`new-log.js`):
        * Formulário para inserir Glicemia, Contexto (Jejum, Pré, Pós), Carboidratos, Insulina e Anotações.
        * Interface otimizada para teclado (navegação "Next", KeyboardAvoidingView e ScrollView).
    * **Edição de Registro** (`NewLogUploadScreens.js`):
        * Tela dedicada para atualizar um registro existente.
        * Carrega os dados do Firebase e permite que o usuário corrija as informações.

4.  **Histórico (`history.jsx`)**
    * **Lista Completa**: Exibe todos os registros do usuário, ordenados do mais recente para o mais antigo.
    * **Visualização de Anotações**: Mostra as anotações feitas em cada registro.
    * **Ações Rápidas**:
        * **Editar**: Toque curto em um item leva à tela de Edição (`NewLogUploadScreens.js`).
        * **Deletar**: Toque longo em um item abre um alerta de confirmação para exclusão.

5.  **Metas (`metas.js`)**
    * **Parâmetros de Glicemia**: Uma tela de configurações onde o usuário pode definir suas faixas-alvo pessoais (Glicemia Baixa, Alta e de Urgência).
    * **Persistência**: As metas são salvas no Realtime Database e podem ser usadas futuramente para classificar os registros no Dashboard e Histórico.

# Desenvolvido por
- Érik Ordine Garcia | 22.224.021-0
