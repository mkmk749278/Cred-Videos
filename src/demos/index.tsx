import React from 'react';
import type {Insert} from '../components/TeluguInserts';
import {LetterDemo} from './Letter';
import {BudgetDemo, RotationDemo} from './Ch01';
import {LegalDemo, LegalProcDemo, RegisterDemo, VerifyNoticeDemo} from './Ch02_03';
import {DisputeDemo, InterestDemo, MinDueDemo, StatementDemo} from './Ch04';
import {EmailDemo, SetOffDemo} from './Ch05_06';
import {CallerDemo, ClockDemo, ComplaintDemo, DoorstepDemo, EvidenceDemo, LinkCheckDemo, LocationDemo, PhoneSettingsDemo} from './Ch07_08';
import {CalendarDemo, EmiDemo, LedgerDemo} from './Ch09';
import {LokAdalatDemo, OfferAffDemo, OffersDemo, ReceiptsDemo} from './Ch10_11';
import {ReportDisputeDemo, ReportsDemo, SecuredCardDemo, StabiliseDemo, UsageDemo} from './Ch12';
import {PlanDemo} from './Ch13';
import {PayChannelDemo, ProfileDemo, RecordDemo, SilenceDemo, VisitDemo} from './Gaps';

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
  setoff: SetOffDemo,
  email: EmailDemo,
  clock: ClockDemo,
  caller: CallerDemo,
  location: LocationDemo,
  linkcheck: LinkCheckDemo,
  doorstep: DoorstepDemo,
  evidence: EvidenceDemo,
  complaint: ComplaintDemo,
  phone: PhoneSettingsDemo,
  calendar: CalendarDemo,
  emi: EmiDemo,
  ledger: LedgerDemo,
  offers: OffersDemo,
  offeraff: OfferAffDemo,
  receipts: ReceiptsDemo,
  lokadalat: LokAdalatDemo,
  reports: ReportsDemo,
  securedcard: SecuredCardDemo,
  usage: UsageDemo,
  stabilise: StabiliseDemo,
  reportdispute: ReportDisputeDemo,
  plan: PlanDemo,
  silence: SilenceDemo,
  record: RecordDemo,
  visit: VisitDemo,
  paychannel: PayChannelDemo,
  profile: ProfileDemo,
};

export const DemoRouter: React.FC<{ins: Insert}> = ({ins}) => {
  const D = ins.demo ? DEMOS[ins.demo] : undefined;
  if (!D) throw new Error(`unknown demo "${ins.demo}"`);
  return <D ins={ins} />;
};
