// Cliente para chamadas à API interna (não usa OpenAI diretamente no cliente)

// Função para gerar laudo médico
export async function generateLaudo(data: {
  tipo: string;
  paciente: string;
  idade: string;
  sexo: string;
  queixaPrincipal: string;
  historico: string;
  exame: string;
  observacoes?: string;
}) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'laudo',
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar laudo');
  }

  const result = await response.json();
  return result.content;
}

// Função para gerar receita médica
export async function generateReceita(data: {
  tipo: string;
  paciente: string;
  idade: string;
  sexo: string;
  diagnostico: string;
  medicamentos: string;
  posologia: string;
  duracao: string;
  observacoes?: string;
}) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'receita',
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar receita');
  }

  const result = await response.json();
  return result.content;
}

// Função para gerar relatório médico
export async function generateRelatorio(data: {
  tipo: string;
  paciente: string;
  idade: string;
  sexo: string;
  motivoInternacao?: string;
  evolucao: string;
  procedimentos: string;
  condicaoAlta?: string;
  recomendacoes: string;
  observacoes?: string;
}) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'relatorio',
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar relatório');
  }

  const result = await response.json();
  return result.content;
}
