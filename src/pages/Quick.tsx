import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { gentleActions, quickSituations } from '../data/parentTools';
import { sentences } from '../data';
import { useApp } from '../lib/context';
import { EmptyState, PageHeading } from '../components/Cards';
import { QuickSession } from '../components/ParentSupport';
export default function QuickPage({ id, practiceId }: { id?: string; practiceId?: string }) {
  const { practice } = useApp();
  const [completed, setCompleted] = useState(false);
  const situation = quickSituations.find((q) => q.id === id);
  const sentence = sentences.find((s) => s.id === (practiceId ?? situation?.sentenceId));
  if (!sentence)
    return (
      <EmptyState
        title="找一句當下用得上的英文"
        description="從生活情境或首頁的快捷句開始。"
        href="#/topics"
        label="探索生活情境"
      />
    );
  return (
    <div className="quick-page">
      <PageHeading
        eyebrow="A LITTLE ENGLISH, RIGHT NOW"
        title={situation?.title ?? '現在，就用這一句'}
        description="不用備課。說一句、陪著做，再把手機放下。"
      />
      <QuickSession
        sentence={sentence}
        action={situation?.prompt ?? gentleActions[sentence.category]}
        completed={completed}
        onComplete={() => {
          practice(sentence.id);
          setCompleted(true);
        }}
      />
      <a className="next-gentle-link" href={`#/topic/${sentence.category}`}>
        還想聊一點？看看這個情境
        <ArrowRight size={16} />
      </a>
    </div>
  );
}
