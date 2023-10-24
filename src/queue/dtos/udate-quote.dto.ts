import { IsString, Max, Min, IsInt, IsOptional } from 'class-validator';

export class UpdateQueueDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Max(120)
  @Min(1)
  @IsOptional()
  averageWaitTimeInMinutes?: number;

  @IsInt()
  @Max(10)
  @Min(4)
  @IsOptional()
  maxParticipants?: number;
}
