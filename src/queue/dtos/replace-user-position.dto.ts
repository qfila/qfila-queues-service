import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ReplaceUserPositionDTO {
  @IsNotEmpty()
  @IsNumber()
  @Max(10)
  @Min(1)
  newPosition: number;
}
