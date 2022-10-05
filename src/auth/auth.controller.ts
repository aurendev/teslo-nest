import { CreateUserhDto } from './dto/create-user.dto';
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/get-raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserhDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.chechAuthStatus(user)
  }

  //* ruta protegida,senecesita esta autenticado.
  @Get('private-route')
  @UseGuards(AuthGuard())
  testRoutePrivate(
    @GetUser() user: User,
    @GetUser('email') email:string,
    @RawHeaders() rawHeaders : string[]
  ){
    return {
      ok:true,
      message:  "Hello world private",
      user,
      useEmail: email,
      rawHeaders
    }
  }

  //* ruta protegida que necesita ademasde autenticacion ,ciertos roles del user
  @Get('private-route2')
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute(
    @GetUser() user: User,
  ){
    return {
      ok:true,
      user,
    }
  }

  //* ruta protegida que necesita ademasde autenticacion ,ciertos roles del user
  //! Version cortausando composicion de decoradores.
  @Get('private-route3')
  @Auth(ValidRoles.superUser)
  privateRoute3(
    @GetUser() user: User,
  ){
    return {
      ok:true,
      user,
    }
  }
}
