import { IsString, Max, Min, IsInt, IsNotEmpty } from 'class-validator';

export class CreateQueueDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsInt()
  @Max(120)
  @Min(1)
  averageWaitTimeInMinutes: number;

  @IsInt()
  @Max(10)
  @Min(4)
  maxParticipants: number;
}
