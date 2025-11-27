import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, imageUrl, patientInfo, examDetails, specificQuestions } = body;

    if (!openai.apiKey) {
      return NextResponse.json(
        { error: 'API key da OpenAI não configurada' },
        { status: 500 }
      );
    }

    // Construir prompt especializado baseado no tipo de exame
    const systemPrompt = getSpecialistPrompt(documentType);
    
    const userPrompt = `
Paciente: ${patientInfo.name}, ${patientInfo.age} anos, sexo ${patientInfo.sex}
${patientInfo.clinicalHistory ? `Histórico Clínico: ${patientInfo.clinicalHistory}` : ''}
${examDetails ? `Detalhes do Exame: ${examDetails}` : ''}
${specificQuestions ? `Questões Específicas: ${specificQuestions}` : ''}

Por favor, forneça uma análise médica detalhada incluindo:
1. Achados principais
2. Interpretação clínica
3. Diagnósticos diferenciais possíveis
4. Recomendações de conduta
5. Nível de urgência (baixo/médio/alto)
`;

    // Se houver imagem, usar GPT-4 Vision
    if (imageUrl) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageUrl,
                  detail: 'high'
                } 
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';
      const parsed = parseAnalysisResponse(content);
      
      return NextResponse.json(parsed);
    } else {
      // Análise apenas textual
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';
      const parsed = parseAnalysisResponse(content);
      
      return NextResponse.json(parsed);
    }
  } catch (error: any) {
    console.error('Erro na análise médica:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar documento médico' },
      { status: 500 }
    );
  }
}

function getSpecialistPrompt(documentType: string): string {
  const basePrompt = `Você é um médico especialista experiente atuando como assistente de IA para análise de exames médicos. 
Sua função é auxiliar médicos fornecendo análises detalhadas, identificando achados importantes e sugerindo diagnósticos diferenciais.

IMPORTANTE: 
- Suas análises são para AUXÍLIO MÉDICO, não substituem avaliação clínica completa
- Sempre mencione a necessidade de correlação clínica
- Seja preciso, objetivo e use terminologia médica apropriada
- Indique o nível de confiança em suas observações
- Sugira investigações complementares quando apropriado`;

  const specialistPrompts: Record<string, string> = {
    'raio-x': `${basePrompt}

ESPECIALIDADE: Radiologia - Raio-X
Foque em:
- Análise de estruturas ósseas e articulações
- Avaliação de campos pulmonares e mediastino
- Identificação de fraturas, luxações, alterações degenerativas
- Sinais de processos infecciosos ou neoplásicos
- Alinhamento e posicionamento anatômico`,

    'tomografia': `${basePrompt}

ESPECIALIDADE: Radiologia - Tomografia Computadorizada
Foque em:
- Análise detalhada de tecidos moles e estruturas ósseas
- Identificação de lesões, massas ou coleções
- Avaliação de vasos sanguíneos e órgãos
- Sinais de hemorragia, isquemia ou trauma
- Estadiamento de processos patológicos`,

    'ressonancia': `${basePrompt}

ESPECIALIDADE: Radiologia - Ressonância Magnética
Foque em:
- Análise de tecidos moles com alta resolução
- Avaliação de sistema nervoso central
- Identificação de lesões, edema, inflamação
- Caracterização de massas e tumores
- Avaliação de estruturas articulares e ligamentares`,

    'exame-laboratorial': `${basePrompt}

ESPECIALIDADE: Medicina Laboratorial
Foque em:
- Interpretação de valores laboratoriais
- Identificação de alterações significativas
- Correlação entre diferentes parâmetros
- Sugestão de exames complementares
- Possíveis diagnósticos baseados em padrões laboratoriais`,

    'ultrassom': `${basePrompt}

ESPECIALIDADE: Ultrassonografia
Foque em:
- Análise de ecogenicidade e textura dos órgãos
- Identificação de massas, cistos ou coleções
- Avaliação de fluxo vascular (quando Doppler)
- Medidas e dimensões de estruturas
- Sinais de processos inflamatórios ou obstrutivos`
  };

  return specialistPrompts[documentType] || basePrompt;
}

function parseAnalysisResponse(content: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let confidence = 0.8;

  const lines = content.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase().includes('achado') || trimmed.toLowerCase().includes('finding')) {
      currentSection = 'findings';
    } else if (trimmed.toLowerCase().includes('recomenda') || trimmed.toLowerCase().includes('recommendation')) {
      currentSection = 'recommendations';
    } else if (trimmed.toLowerCase().includes('urgência') || trimmed.toLowerCase().includes('urgency')) {
      if (trimmed.toLowerCase().includes('alta') || trimmed.toLowerCase().includes('high')) {
        urgency = 'high';
      } else if (trimmed.toLowerCase().includes('média') || trimmed.toLowerCase().includes('medium')) {
        urgency = 'medium';
      }
    }

    if (currentSection === 'findings' && trimmed.startsWith('-')) {
      findings.push(trimmed.substring(1).trim());
    } else if (currentSection === 'recommendations' && trimmed.startsWith('-')) {
      recommendations.push(trimmed.substring(1).trim());
    }
  }

  return {
    analysis: content,
    findings: findings.length > 0 ? findings : ['Análise detalhada disponível no texto completo'],
    recommendations: recommendations.length > 0 ? recommendations : ['Correlação clínica recomendada'],
    urgency,
    confidence
  };
}
