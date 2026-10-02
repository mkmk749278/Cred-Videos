import React from 'react';
import type {Insert} from '../components/TeluguInserts';
import {LetterDemo} from './Letter';

/** Telugu-edition animated demonstrations, selected by inserts_te.json `demo`. */
const DEMOS: Record<string, React.FC<{ins: Insert}>> = {
  letter: LetterDemo,
};

export const DemoRouter: React.FC<{ins: Insert}> = ({ins}) => {
  const D = ins.demo ? DEMOS[ins.demo] : undefined;
  if (!D) throw new Error(`unknown demo "${ins.demo}"`);
  return <D ins={ins} />;
};
