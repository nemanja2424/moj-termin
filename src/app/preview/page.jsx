'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DefaultDesign from '@/components/dizajn/Default';
import MinimalDesign from '@/components/dizajn/Minimal';
import ModernDesign from '@/components/dizajn/Modern';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const design = searchParams.get('design') || 'default';

  const [formData, setFormData] = useState({
    ime: '',
    email: '',
    telefon: '+381',
    trajanje: '1h',
    lokacija: '',
    vreme: '',
    dan: '',
    mesec: new Date().getMonth(),
    godina: new Date().getFullYear(),
    opis: ''
  });

  const [forma, setForma] = useState({});
  const [preduzece, setPreduzece] = useState({});
  const id = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    const forma = JSON.parse(localStorage.getItem('zakaziForma') || '{}');
    const preduzece = JSON.parse(localStorage.getItem('zakaziPreduzece') || '{}');
    setForma(forma);
    setPreduzece(preduzece);
  }, []);

  const props = { forma, setForma, preduzece, setPreduzece, formData, setFormData, id };

  if (design === 'minimal') return <MinimalDesign {...props} />;
  if (design === 'modern') return <ModernDesign {...props} />;
  return <DefaultDesign {...props} />;
}
