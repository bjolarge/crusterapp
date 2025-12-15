import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, BadRequestException } from '@nestjs/common';
import UserService  from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import User from './entities/user.entity';
import Role from './enum/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query()paginationQuery:PaginationQueryDto) {
    return this.userService.findAll(paginationQuery);
  }

 
  @Get('email')
  findOne(@Param('id') email: string) {
    return this.userService.getByEmail(email);
  }

  @Get('/count')
  async findAllUser() {
      const count = await this.userService.findusercount();
  return { count };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // filter by role  only now
  @Get('users-only')
  async getUsersByRole(): Promise<User[]> {
    return this.userService.findUsersByRole(Role.Vendor);
  }
}