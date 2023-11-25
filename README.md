# Majority-Ack Reliable Broadcast

## Estrutura de pasta

client: contém uma aplicação que utiliza a API de broadcast construída nesse trabalho

lib: contém o algoritmo para o Majority-Ack Reliable Broadcast

utils: contém funções auxiliares que são comuns ao cliente e a biblioteca de comunicação

## Rodando o projeto

Certifique de que há algum gerenciador de pacote node instalado na sua máquina como o npm, e rode o seguinte comando para instalar as dependências:

```sh
  npm install
```

A comunicação é feita em um grupo fixo, que é descrito no arquivo src/client/index.ts iniciando na linha 6.
Para que as instâncias de clientes se comuniquem corretamente é necessário alterar o trecho de código citado anteriormente, adicionando ou removendo novos integrantes ao grupo. Por padrão a aplicação utilizará o localhost e as porta de 3000 a 3003. Para rodar uma instância do projeto utilize o comando:

```sh
  npm run start [porta]
```

Nesse ambiente, após inicializar os 4 clientes (nas portas 3000 até 3003), é só digitar as mensagens no terminal. Mensagens recebidas no grupo possuem o formato: [ip:porta do nó que enviou a mensagem originalmente]: <msg>. Uma vez que o grupo é composto de 4 nós, ao fechar 2 clientes mais nenhuma mensagem deve ser entregue ao grupo.

## API do algoritmo Majority-Ack Reliable Broadcast

#### construtor(porta: number, group: Host[])
Cria e configura um servidor TCP na porta informada para a comunicação com o grupo.

Host tem o formato { address: string, port: number }

#### broadcast(data: string):
Envia mensagem broadcast ao grupo.

#### onReceiveMessage(cb: ((msg: Message) => void))
Configura uma função de callback que é executada sempre que uma mensagem é entregue no grupo.

Message possui o formato { id: string, data: string, sender: Host }

#### close()
Encerra o recebimento de novas conexões e fecha o servidor ao finalizar as conexões ativas.