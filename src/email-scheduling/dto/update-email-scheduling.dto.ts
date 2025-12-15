// import { PartialType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

import { CreateEmailSchedulingDto } from './create-email-scheduling.dto';

export class UpdateEmailSchedulingDto extends PartialType(CreateEmailSchedulingDto) {}
