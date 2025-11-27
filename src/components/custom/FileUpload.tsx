"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

export function FileUpload({ 
  onFileUploaded, 
  acceptedTypes = ['image/*', 'application/pdf'],
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const file = acceptedFiles[0];
      
      // Validar tamanho
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
      }

      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Você precisa estar logado para fazer upload de arquivos');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('📤 Iniciando upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        bucket: 'medical-documents',
        path: filePath
      });

      // Upload para o Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        
        // Mensagens de erro mais específicas
        if (uploadError.message.includes('not found')) {
          throw new Error('Bucket "medical-documents" não encontrado. Execute o SQL de configuração (veja SETUP_SUPABASE_STORAGE.md)');
        } else if (uploadError.message.includes('policy')) {
          throw new Error('Permissão negada. Verifique as políticas RLS do bucket (veja SETUP_SUPABASE_STORAGE.md)');
        } else {
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
      }

      console.log('✅ Upload concluído:', data);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública gerada:', publicUrl);

      setSuccess(`Arquivo "${file.name}" enviado com sucesso!`);
      onFileUploaded(publicUrl, file.name, file.type);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload:', error);
      setError(error.message || 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          uploading 
            ? 'border-white/20 bg-white/5 cursor-not-allowed' 
            : isDragActive 
            ? 'border-[#FF6F00] bg-[#FF6F00]/10' 
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#FF6F00] animate-spin" />
            <p className="text-sm text-white/70">Enviando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
              <Upload className="w-6 h-6 text-[#FF6F00]" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">
                {isDragActive ? 'Solte o arquivo aqui' : 'Clique ou arraste para anexar'}
              </p>
              <p className="text-xs text-white/50">
                Imagens (JPEG, PNG) ou PDF • Máx 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-400 font-medium">Erro no Upload</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400 font-medium">{success}</p>
        </div>
      )}
    </div>
  );
}
