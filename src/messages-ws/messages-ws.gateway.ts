import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { EventsType } from './interfaces/events.interface';
import { NewMessageDTO } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // console.log('[client] ', client);

    const token = client.handshake.headers.authentication as string;

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log({ payload });

    console.log({ conectados: this.messagesWsService.getConnectedClients() });

    this.wss.emit(
      EventsType.clientsUpdated,
      this.messagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    console.log({ conectados: this.messagesWsService.getConnectedClients() });
    this.wss.emit(
      EventsType.clientsUpdated,
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage(EventsType.messageFromClient)
  onMessageFromClient(client: Socket, payload: NewMessageDTO) {
    console.log('[News Messages]', client.id, payload.message);

    //! Emite unicamente al cliente.
    // client.emit(EventsType.messageFromServer,{
    //   fullname: 'soy yo',
    //   message: payload.message ?? 'no-message'
    // })

    //! Emite a todos menos , al cliente inicial
    // client.broadcast.emit(EventsType.messageFromServer,{
    //   fullname: 'soy yo',
    //   message: payload.message ?? 'no-message'
    // })

    //!Emite a todos
    this.wss.emit(EventsType.messageFromServer, {
      fullname: this.messagesWsService.getUserFullName(client.id),
      body: payload.message ?? 'no-message',
    });
  }
}
