import { IsString, IsUrl } from 'class-validator';

class TestMcpConnectionDto {
  @IsString()
  @IsUrl()
  url: string;
}

export default TestMcpConnectionDto;
