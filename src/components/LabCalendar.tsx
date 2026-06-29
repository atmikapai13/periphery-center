import { useState } from 'react';
import '../styles/LabCalendar.css';
import arrowImg from '../assets/arrow.png';
import iterateImg from '../assets/iterate.png';

const STEPS = [
  { num: 1, name: 'Orientation', desc: 'We introduce the Periphery Center manifesto. We deliberate on the medium and interface, and prepare the community for the cycle ahead.', date: 'Late July', venue: 'TBD' },
  { num: 2, name: 'Community Kick-off', desc: 'Launch the cycle with a provocation, and celebrate the new medium and interaction layer.' },
  { num: 3, name: 'Free Play & Prototype', desc: 'Explore technologies. Iterate fast and develop PoC.' },
  { num: 4, name: 'Community Workshop & User Testing', desc: 'Share PoC with community — teach, workshop, learn. Gather feedback.' },
  { num: 5, name: 'Launch Event', desc: 'Present the artifact publicly, and invite the community to engage and participate.' },
  { num: 6, name: 'Satellite Gatherings', desc: 'Incorporate launch feedback, and deploy the artifact into ongoing community life. Weekly rituals that sustain momentum between major cycle events.' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LabCalendar({ open, onOpenChange }: Props) {
  const [active, setActive] = useState<number | null>(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 1 : null
  );

  return (
    <aside className={`lab-calendar${open ? ' lab-calendar--open' : ''}`}>
      <button
        className="lab-calendar-tab"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? 'Close Lab Calendar' : 'Open Lab Calendar'}
        aria-expanded={open}
      >
        <span className="lab-calendar-label">LAB CALENDAR</span>
      </button>

      <div className="lab-calendar-panel" aria-hidden={!open}>
        <div className="lab-calendar-content">
          <p className="lab-calendar-header">To build community through creative exploration, we move through structured, cyclical labs:</p>
          <div className="lab-steps">
            {STEPS.filter(step => !step.subOf || active === step.subOf).map((step, index) => {
              const isSub = !!step.subOf;
              const isActive = active === step.num || (step.num === 4 && active === 3);
              const isLast = index === STEPS.length - 1;
              return (
                <div key={step.num} className={`lab-step-wrapper${isSub ? ' lab-substep-wrapper' : ''}`}>
                  {isSub && (
                    <div className="lab-step-connector lab-step-connector--right-only" aria-hidden="true">
                      <img src={arrowImg} className="lab-arrow lab-arrow--right" alt="" />
                    </div>
                  )}
                  <button
                    className={`lab-step${isActive ? ' lab-step--active' : ''}`}
                    onClick={() => {
                      if (step.num === 3 || step.num === 4) {
                        setActive(isActive ? null : 3);
                      } else if (isSub) {
                        // clicking a sub-step collapses its parent
                        setActive(null);
                      } else {
                        setActive(isActive ? null : step.num);
                      }
                    }}
                  >
                    <span className="lab-step-num">{step.num}</span>
                    <span className="lab-step-name">{step.name}</span>
                    {isActive && step.desc && <p className="lab-step-desc">{step.desc}</p>}
                    {isActive && step.date && (
                      <p className="lab-step-desc lab-step-desc--date lab-step-desc--date-first">
                        <strong>Date:</strong> {step.date}
                      </p>
                    )}
                    {isActive && step.venue && (
                      <p className="lab-step-desc lab-step-desc--date">
                        <strong>Venue:</strong> {step.venue}
                      </p>
                    )}
                  </button>

                  {(active === 3 || active === 4) && step.num === 3 && (
                    <div key={`connector-${step.num}-${active}`} className="lab-step-connector" aria-hidden="true">
                      <img src={arrowImg} className="lab-arrow lab-arrow--left" alt="" />
                      <img src={arrowImg} className="lab-arrow lab-arrow--right" alt="" />
                    </div>
                  )}
                  {(active === 3 || active === 4) && step.num === 4 && (
                    <img src={iterateImg} className="lab-iterate" alt="" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="lab-calendar-mobile-footer">
            <button
              className="lab-calendar-mobile-newsletter"
              onClick={() => (document.getElementById('brevo-modal') as HTMLDialogElement)?.showModal()}
            >
              Subscribe to our newsletter
            </button>
            <a className="lab-calendar-mobile-email" href="mailto:hello@peripherycenter.com">
              or contact us at hello@peripherycenter.com
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
