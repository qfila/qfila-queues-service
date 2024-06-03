import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddUserDTO {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
