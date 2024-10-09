import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

class DuplicateFileRequestDto {
  @ApiProperty({
    description: 'The original path of the file that will be duplicated',
    example: '/teachers/agy-netzint-teacher/Thesis/aaa.txt',
  })
  @IsString()
  originFilePath: string;

  @ApiProperty({
    description: 'List of destination paths where the file will be duplicated',
    example: ['/teachers/ni-teacher/aaa_copy1.txt', '/teachers/ni-teacher/test/aaa_copy2.txt'],
  })
  @IsArray()
  @IsString({ each: true })
  destinationFilePaths: string[];
}

export default DuplicateFileRequestDto;
