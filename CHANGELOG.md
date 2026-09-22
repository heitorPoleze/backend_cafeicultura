# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.3] - 2026-09-22

### Modificado

- Atualizadas as dependências do Prisma para a versão `7.10.0`, mantendo alinhadas as versões de `prisma`, `@prisma/client` e `@prisma/adapter-mariadb`.
- Atualizado o `@quixo3/prisma-session-store` para a versão `3.1.21`.
- Atualizado o `cpf-cnpj-validator` para a versão `2.1.2`.
- Atualizado o `typescript-eslint` para a versão `8.70.0`.
- Atualizado o hiperlink para comparação entre as tags das versões.
- Atualizado o hiperlink para os perfis do GitHub dos colaboradores.
- Refatorado o cálculo do estoque de insumos, aprimorando a forma como as movimentações de entrada, saída e estorno são processadas.
- Alterados os atributos `qtdUsada` de `tratosinsumos`, `qtdCompra` de `comprasinsumos` e `quantidade` de `estoqueinsumos` de `DOUBLE` para `DECIMAL(10,3)`, garantindo maior precisão no armazenamento e nos cálculos das quantidades de insumos.

### Corrigido

- Corrigido o cálculo do estoque de insumos, que apresentava inconsistências na atualização das quantidades durante determinadas operações de movimentação e estorno.

### Removido

- Removida a dependência `@types/node-cron`, pois o `node-cron` já fornece suas próprias definições de tipos.

### Segurança

- Corrigidas vulnerabilidades de segurança relacionadas ao `mysql2`, com sua atualização para a versão `3.24.4`.
- Corrigidas vulnerabilidades de segurança relacionadas ao `mariadb`, com a utilização da versão `3.4.7` por meio de `overrides`.

## [1.0.2] - 2026-09-16

### Adicionado
- Nova regra de negócio que impede a reativação de uma safra caso já existam 2 safras ativas vinculadas à mesma propriedade.

### Modificado
- Padronização de segurança: Códigos de status HTTP para rotas de acesso negado foram alterados de `401 Unauthorized` para `403 Forbidden`.
- O fluxo de criação de novas propriedades foi atualizado para sincronizar e cadastrar automaticamente, com quantidade zerada, o estoque dos insumos que o proprietário já possui no sistema.

### Corrigido
- Falha na captura e lançamento da exceção durante a validação de datas, que ocorria ao tentar cadastrar uma safra com data de início no futuro.
- Corrigida a validação de exclusão para despesas vinculadas a insumos; o sistema agora captura corretamente o erro e bloqueia a operação caso o estorno deixe o estoque negativo.

### Removido
- Removida a restrição que impedia a exclusão de tratos culturais em safras antigas. Agora, o registro pode ser excluído em qualquer safra, desde que a mesma não esteja com o status de encerrada.

## [1.0.1] - 2026-09-14

### Adicionado

- Forma de pagamento "Boleto".
- Cadastro automático de estoque zerado para as demais propriedades de um mesmo proprietário ao comprar um insumo.
- Links Markdown para comparação entre as tags das versões.
- Links para os perfis do GitHub dos colaboradores.

### Modificado

- Melhorada a mensagem de erro exibida quando o estoque de um insumo é insuficiente.

### Corrigido

- Erro na listagem de insumos que ocorria quando alguns itens não possuíam registros de estoque no sistema.

## [1.0.0] - 2026-09-10

### Adicionado

- Primeira versão da API do sistema Sysgrano.

[1.0.3]: [https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.2...v1.0.3](https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.2...v1.0.3)
[1.0.2]: [https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.1...v1.0.2](https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.1...v1.0.2)
[1.0.1]: [https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.0...v1.0.1](https://github.com/heitorPoleze/backend_cafeicultura/compare/v1.0.0...v1.0.1)
[1.0.0]: [https://github.com/heitorPoleze/backend_cafeicultura/releases/tag/v1.0.0](https://github.com/heitorPoleze/backend_cafeicultura/releases/tag/v1.0.0)

[@karllos-goehringer]: [https://github.com/karllos-goehringer](https://github.com/karllos-goehringer)
[@heitorPoleze]: [https://github.com/heitorPoleze](https://github.com/heitorPoleze)
[@PedroLoriato]: [https://github.com/PedroLoriato](https://github.com/PedroLoriato)