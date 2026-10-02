import React from 'react';
import type {Insert} from '../components/TeluguInserts';
import {LetterDemo} from './Letter';
import {BudgetDemo, RotationDemo} from './Ch01';
import {LegalDemo, LegalProcDemo, RegisterDemo, VerifyNoticeDemo} from './Ch02_03';
import {DisputeDemo, InterestDemo, MinDueDemo, StatementDemo} from './Ch04';

/** Telugu-edition animated demonstrations, selected by inserts_te.json `demo`. */
const DEMOS: Record<string, React.FC<{ins: Insert}>> = {
  letter: LetterDemo,
  rotation: RotationDemo,
  budget: BudgetDemo,
  legal: LegalDemo,
  legalproc: LegalProcDemo,
  verifynotice: VerifyNoticeDemo,
  register: RegisterDemo,
  statement: StatementDemo,
  interest: InterestDemo,
  mindue: MinDueDemo,
  dispute: DisputeDemo,
};

export const DemoRouter: React.FC<{ins: Insert}> = ({ins}) => {
  const D = ins.demo ? DEMOS[ins.demo] : undefined;
  if (!D) throw new Error(`unknown demo "${ins.demo}"`);
  return <D ins={ins} />;
};
