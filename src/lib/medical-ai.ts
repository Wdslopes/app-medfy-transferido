// Cliente para chamadas à API interna (não usa OpenAI diretamente no cliente)

export interface MedicalAnalysisRequest {
  documentType: 'raio-x' | 'tomografia' | 'ressonancia' | 'exame-laboratorial' | 'ultrassom';
  imageUrl?: string;
  patientInfo: {
    name: string;
    age: string;
    sex: string;
    clinicalHistory?: string;
  };
  examDetails?: string;
  specificQuestions?: string;
}

export interface MedicalAnalysisResponse {
  analysis: string;
  findings: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

/**
 * Analisa documentos médicos usando IA especializada via API Route
 */
export async function analyzeMedicalDocument(
  request: MedicalAnalysisRequest
): Promise<MedicalAnalysisResponse> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao analisar documento médico');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro na análise médica:', error);
    throw new Error(error.message || 'Erro ao analisar documento médico');
  }
}

/**
 * Gera laudo médico completo baseado na análise
 */
export async function generateMedicalReport(
  analysis: MedicalAnalysisResponse,
  patientInfo: any,
  examType: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'laudo',
        data: {
          paciente: patientInfo.name,
          idade: patientInfo.age,
          sexo: patientInfo.sex,
          tipo: examType,
          queixaPrincipal: analysis.findings.join(', '),
          historico: patientInfo.clinicalHistory || 'Não informado',
          exame: examType,
          observacoes: analysis.analysis,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar laudo');
    }

    const result = await response.json();
    return result.content;
  } catch (error: any) {
    console.error('Erro ao gerar laudo:', error);
    throw new Error(error.message || 'Erro ao gerar laudo médico');
  }
}
