// src/presentation/dtos/faq-response.dto.ts
export class FaqResponseDto {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}
