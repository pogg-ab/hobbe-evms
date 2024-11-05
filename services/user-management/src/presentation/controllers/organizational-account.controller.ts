// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Post,
// } from '@nestjs/common';
// import { OrganizationalAccountService } from '../../application/services/organizational-account.service';
// import { UpdateOrganizationalAccountDto } from '../../modules/organizational-account/dto/update-organizational-account.dto';
// import { CreateOrganizationalAccountDto } from '../dtos/create-organizational-account.dto';

// @Controller('organizational-account')
// export class OrganizationalAccountController {
//   constructor(
//     private readonly organizationalAccountService: OrganizationalAccountService,
//   ) {}

//   @Post()
//   create(
//     @Body() createOrganizationalAccountDto: CreateOrganizationalAccountDto,
//   ) {
//     return this.organizationalAccountService.create(
//       createOrganizationalAccountDto,
//     );
//   }

//   @Get()
//   findAll() {
//     return this.organizationalAccountService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.organizationalAccountService.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
//   ) {
//     return this.organizationalAccountService.update(
//       +id,
//       updateOrganizationalAccountDto,
//     );
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.organizationalAccountService.remove(+id);
//   }
// }
