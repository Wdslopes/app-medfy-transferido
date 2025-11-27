import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!openai.apiKey) {
      return NextResponse.json(
        { error: 'API key da OpenAI não configurada' },
        { status: 500 }
      );
    }

    let prompt = '';

    if (type === 'laudo') {
      prompt = `Você é um médico especialista gerando um laudo médico profissional.

DADOS DO PACIENTE:
- Nome: ${data.paciente}
- Idade: ${data.idade} anos
- Sexo: ${data.sexo}

TIPO DE LAUDO: ${data.tipo}

INFORMAÇÕES CLÍNICAS:
- Queixa Principal: ${data.queixaPrincipal}
- Histórico: ${data.historico}
- Exame Realizado: ${data.exame}
${data.observacoes ? `- Observações: ${data.observacoes}` : ''}

Gere um laudo médico completo, profissional e detalhado seguindo o padrão médico brasileiro. Inclua:
1. Identificação do paciente
2. Indicação clínica
3. Técnica utilizada
4. Descrição dos achados
5. Impressão diagnóstica
6. Conclusão

Use linguagem técnica apropriada e seja objetivo.`;
    } else if (type === 'receita') {
      prompt = `Você é um médico gerando uma receita médica profissional.

DADOS DO PACIENTE:
- Nome: ${data.paciente}
- Idade: ${data.idade} anos
- Sexo: ${data.sexo}

TIPO DE RECEITA: ${data.tipo}

INFORMAÇÕES CLÍNICAS:
- Diagnóstico: ${data.diagnostico}
- Medicamentos: ${data.medicamentos}
- Posologia: ${data.posologia}
- Duração do Tratamento: ${data.duracao}
${data.observacoes ? `- Observações: ${data.observacoes}` : ''}

Gere uma receita médica completa e profissional seguindo o padrão brasileiro. Inclua:
1. Identificação do paciente
2. Prescrição detalhada dos medicamentos
3. Posologia clara e específica
4. Orientações de uso
5. Duração do tratamento
6. Recomendações gerais

Use linguagem técnica apropriada e seja claro nas instruções.`;
    } else if (type === 'relatorio') {
      prompt = `Você é um médico gerando um relatório médico profissional.

DADOS DO PACIENTE:
- Nome: ${data.paciente}
- Idade: ${data.idade} anos
- Sexo: ${data.sexo}

TIPO DE RELATÓRIO: ${data.tipo}

INFORMAÇÕES CLÍNICAS:
${data.motivoInternacao ? `- Motivo da Internação: ${data.motivoInternacao}` : ''}
- Evolução Clínica: ${data.evolucao}
- Procedimentos Realizados: ${data.procedimentos}
${data.condicaoAlta ? `- Condição na Alta: ${data.condicaoAlta}` : ''}
- Recomendações: ${data.recomendacoes}
${data.observacoes ? `- Observações: ${data.observacoes}` : ''}

Gere um relatório médico completo e profissional seguindo o padrão brasileiro. Inclua:
1. Identificação do paciente
2. Resumo do caso
3. Evolução clínica detalhada
4. Procedimentos e tratamentos realizados
5. Condição atual do paciente
6. Recomendações e orientações
7. Conclusão

Use linguagem técnica apropriada e seja detalhado.`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: type === 'relatorio' ? 1800 : type === 'laudo' ? 1500 : 1200,
    });

    const content = response.choices[0].message.content || '';

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar documento' },
      { status: 500 }
    );
  }
}
