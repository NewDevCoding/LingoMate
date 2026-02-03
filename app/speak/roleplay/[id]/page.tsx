import React, { Suspense } from 'react';
import RoleplaySession from '@/features/speak/roleplay/RoleplaySession';
import { getScenarioById } from '@/features/speak/roleplay/roleplay.service';
import { notFound } from 'next/navigation';

interface RoleplayPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleplaySessionPage({ params }: RoleplayPageProps) {
  const { id } = await params;
  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoleplaySession scenario={scenario} />
    </Suspense>
  );
}
