'use client';
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DefaultDesign from '@/components/dizajn/Default';
import MinimalDesign from '@/components/dizajn/Minimal';
import MultiStepDesign from '@/components/dizajn/MultiStep';
import TimelineDesign from "@/components/dizajn/Timeline";

function PreviewPage() {
  const searchParams = useSearchParams();
  const design = searchParams.get('design');
  const tipUlaska = 1;

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
    opis: '',
    usluga: ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Preview mod - Zakazivanje nije aktivno');
  };

  const handleOtkazi = () => {
    alert('Preview mod - Otkazivanje nije aktivno');
  };

  const potvrdiTermin = () => {
    alert('Preview mod - Potvrda nije aktivna');
  };

  const props = { 
    forma, setForma, 
    preduzece, setPreduzece, 
    formData, setFormData, 
    id, 
    token: null,
    handleSubmit,
    tipUlaska,
    handleOtkazi,
    potvrdiTermin,
    loadingSpin: false,
    loadingSpinOtkaz: false,
    loadingSpinPotvrda: false
  };

  const designLower = design.toLowerCase();
  if (designLower === 'minimal') return <MinimalDesign {...props} />;
  if (designLower === 'multistep') return <MultiStepDesign {...props} />;
  if (designLower === 'timeline') return <TimelineDesign {...props} />;
  return <DefaultDesign {...props} />;
}

export default function PreviewPageWrapper() {
  return (
    <Suspense>
      <PreviewPage />
    </Suspense>
  );
}
