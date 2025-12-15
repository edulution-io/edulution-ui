import { IsOptional, IsString } from 'class-validator';

class AIChatMessagePartDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  text?: string;
}

export default AIChatMessagePartDto;
